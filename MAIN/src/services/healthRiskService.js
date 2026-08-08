/**
 * healthRiskService.js
 * 
 * Data-driven Health Risk Engine for SanjivniAI.
 * Evaluates risk levels (🟢 Lower Concern, 🟡 Needs Attention, 🟠 Elevated Concern, 🔴 High Concern, ⚪ Insufficient Data)
 * strictly from verified structured medical measurements.
 * 
 * Uses cautious non-diagnostic language.
 * Never says "You have hypertension" or "You have diabetes".
 */

import { analyzePatientSummary } from '../lib/gemini'

export const healthRiskService = {
  /**
   * Evaluates deterministic health risk based on structured measurements, BP history, and Sugar history.
   */
  evaluateRisk({ structuredMetrics = [], bpHistory = [], sugarHistory = [] }) {
    const riskFactors = []
    const supportingMeasurements = {}
    const topFactors = []

    let maxRiskLevel = 1 // 1: Lower, 2: Needs Attention, 3: Elevated, 4: High
    let isEmergencyFlag = false
    let emergencyMessage = null

    // 1. Evaluate BP Risk
    const latestBP = bpHistory[0] || structuredMetrics.find((m) => m.category === 'Blood Pressure' || m.key === 'blood_pressure')
    if (latestBP) {
      const sys = latestBP.systolic || 120
      const dia = latestBP.diastolic || 80
      supportingMeasurements.bloodPressure = `${sys}/${dia} mmHg`

      if (sys >= 180 || dia >= 120) {
        maxRiskLevel = Math.max(maxRiskLevel, 4)
        isEmergencyFlag = true
        emergencyMessage = '⚠️ Attention Required: Some recorded measurements may require prompt professional review.'
        riskFactors.push(`Your recorded blood pressure (${sys}/${dia} mmHg) is significantly elevated and requires immediate medical attention.`)
        topFactors.push({ name: 'Blood Pressure', status: 'High Concern', tone: 'danger' })
      } else if (sys >= 140 || dia >= 90) {
        maxRiskLevel = Math.max(maxRiskLevel, 3)
        riskFactors.push(`Your recorded blood pressure (${sys}/${dia} mmHg) is noticeably elevated above the preferred range and should be evaluated by a healthcare professional.`)
        topFactors.push({ name: 'Blood Pressure', status: 'Elevated', tone: 'warning' })
      } else if (sys >= 130 || dia >= 80) {
        maxRiskLevel = Math.max(maxRiskLevel, 2)
        riskFactors.push(`Your recorded blood pressure (${sys}/${dia} mmHg) is slightly above the preferred range and should be discussed with a healthcare professional.`)
        topFactors.push({ name: 'Blood Pressure', status: 'Needs attention', tone: 'warning' })
      } else {
        topFactors.push({ name: 'Blood Pressure', status: 'Good', tone: 'success' })
      }
    }

    // 2. Evaluate Glucose Risk
    const latestSugar = sugarHistory.find((s) => s.measurementType !== 'HbA1c') || structuredMetrics.find((m) => m.key === 'fasting_glucose' || (m.category === 'Blood Sugar' && m.key !== 'hba1c'))
    if (latestSugar) {
      const val = Number(latestSugar.value)
      supportingMeasurements.glucose = `${val} ${latestSugar.unit || 'mg/dL'}`

      if (val >= 300) {
        maxRiskLevel = Math.max(maxRiskLevel, 4)
        isEmergencyFlag = true
        emergencyMessage = '⚠️ Attention Required: Critical blood glucose level recorded.'
        riskFactors.push(`Recent blood glucose level (${val} mg/dL) is critically high and requires prompt professional medical review.`)
        topFactors.push({ name: 'Blood Sugar', status: 'High Concern', tone: 'danger' })
      } else if (val >= 160) {
        maxRiskLevel = Math.max(maxRiskLevel, 3)
        riskFactors.push(`Recent blood glucose measurements (${val} mg/dL) are elevated and warrant monitoring with your doctor.`)
        topFactors.push({ name: 'Blood Sugar', status: 'Elevated', tone: 'warning' })
      } else if (val >= 100) {
        maxRiskLevel = Math.max(maxRiskLevel, 2)
        riskFactors.push(`Recent blood glucose measurements (${val} mg/dL) are slightly above optimal levels and require regular tracking.`)
        topFactors.push({ name: 'Blood Sugar', status: 'Needs attention', tone: 'warning' })
      } else {
        topFactors.push({ name: 'Blood Sugar', status: 'Good', tone: 'success' })
      }
    }

    // 3. Evaluate HbA1c
    const latestHbA1c = sugarHistory.find((s) => s.measurementType === 'HbA1c') || structuredMetrics.find((m) => m.key === 'hba1c')
    if (latestHbA1c) {
      const val = Number(latestHbA1c.value)
      supportingMeasurements.hba1c = `${val}%`

      if (val >= 7.5) {
        maxRiskLevel = Math.max(maxRiskLevel, 3)
        riskFactors.push(`Recorded HbA1c (${val}%) is above the recommended glycemic target range.`)
        topFactors.push({ name: 'HbA1c', status: 'Needs attention', tone: 'warning' })
      } else if (val >= 5.7) {
        maxRiskLevel = Math.max(maxRiskLevel, 2)
        riskFactors.push(`Recorded HbA1c (${val}%) indicates borderline glycemic levels.`)
        topFactors.push({ name: 'HbA1c', status: 'Needs attention', tone: 'warning' })
      } else {
        topFactors.push({ name: 'HbA1c', status: 'Good', tone: 'success' })
      }
    }

    // Determine Risk Level Text & Badge
    const TOTAL_CATEGORIES = 5
    const availableCount = topFactors.length
    const dataCompleteness = Math.round((availableCount / TOTAL_CATEGORIES) * 100)
    const isLimitedData = availableCount < 2

    let overallRisk = 'Lower Concern'
    let riskLevelBadge = '🟢 Lower Concern'

    if (isLimitedData) {
      overallRisk = 'Insufficient Data'
      riskLevelBadge = '⚪ Insufficient Data'
    } else if (maxRiskLevel === 4) {
      overallRisk = 'High Concern'
      riskLevelBadge = '🔴 High Concern'
    } else if (maxRiskLevel === 3) {
      overallRisk = 'Elevated Concern'
      riskLevelBadge = '🟠 Elevated Concern'
    } else if (maxRiskLevel === 2) {
      overallRisk = 'Needs Attention'
      riskLevelBadge = '🟡 Needs Attention'
    }

    return {
      overallRisk,
      riskLevelBadge,
      riskFactors,
      topFactors,
      supportingMeasurements,
      dataCompleteness,
      isEmergencyFlag,
      emergencyMessage,
      calculatedAt: new Date().toISOString(),
    }
  },

  /**
   * Optional AI Explanation Wrapper:
   * Uses Gemini AI to explain the ALREADY-CALCULATED deterministic risk result in simple language.
   * Does NOT alter or override the risk classification.
   */
  async explainRiskWithAI(riskResult) {
    if (!riskResult || riskResult.overallRisk === 'Insufficient Data') {
      return {
        explanation: 'Insufficient structured medical data available for AI summary. Upload medical reports or log BP/Sugar readings.',
        disclaimer: 'AI explanations summarize stored records only.',
      }
    }

    try {
      const promptContext = `Explain these patient health risk findings in 2 short, reassuring sentences for a patient.
Risk Level: ${riskResult.overallRisk}
Factors: ${riskResult.riskFactors.join(' ')}
Do not state a medical diagnosis.`

      const aiRes = await analyzePatientSummary('Patient Risk Summary', promptContext, 'Health Overview')
      return {
        explanation: aiRes.clinicalSummary || riskResult.riskFactors.join(' '),
        disclaimer: 'AI explanation based strictly on stored verified health data.',
      }
    } catch {
      return {
        explanation: riskResult.riskFactors.join(' ') || 'Your recorded measurements are being monitored.',
        disclaimer: 'Deterministic health risk summary.',
      }
    }
  },
}
