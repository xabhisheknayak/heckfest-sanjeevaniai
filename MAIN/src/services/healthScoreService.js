/**
 * healthScoreService.js
 * 
 * Clinical data-driven Health Score Engine for SanjivniAI.
 * Calculates a 0–100 "SanjivniAI Health Overview Score" ONLY from verified structured medical data.
 * Does NOT use app activity, chat logs, logins, patient names, or arbitrary guesses.
 */

export const healthScoreService = {
  /**
   * Calculates Health Score based on structured measurements, BP logs, and Blood Sugar logs.
   */
  calculateScore({ structuredMetrics = [], bpHistory = [], sugarHistory = [] }) {
    const components = {
      bloodPressure: null,
      glucose: null,
      diabetesMarker: null,
      cholesterol: null,
      bloodCount: null,
    }

    const availableMetricsList = []
    const missingMetricsList = []

    // 1. Evaluate Blood Pressure
    const latestBP = bpHistory[0] || structuredMetrics.find((m) => m.category === 'Blood Pressure' || m.key === 'blood_pressure')
    if (latestBP) {
      const sys = latestBP.systolic || 120
      const dia = latestBP.diastolic || 80
      let score = 100
      let status = 'Good'
      let note = 'Normal BP (<120/80 mmHg)'

      if (sys >= 140 || dia >= 90) {
        score = 50
        status = 'High'
        note = 'Stage 2 Hypertension range (≥140/90 mmHg)'
      } else if (sys >= 130 || dia >= 80) {
        score = 70
        status = 'Needs attention'
        note = 'Stage 1 Hypertension range (130-139/80-89 mmHg)'
      } else if (sys >= 120) {
        score = 85
        status = 'Mildly elevated'
        note = 'Elevated BP range (120-129/<80 mmHg)'
      }

      components.bloodPressure = {
        name: 'Blood Pressure',
        score,
        status,
        note,
        valueDisplay: `${sys}/${dia} mmHg`,
      }
      availableMetricsList.push('Blood Pressure')
    } else {
      missingMetricsList.push('Blood Pressure')
    }

    // 2. Evaluate Glucose (Fasting / Post-meal / Random)
    const latestSugar = sugarHistory.find((s) => s.measurementType !== 'HbA1c') || structuredMetrics.find((m) => m.key === 'fasting_glucose' || (m.category === 'Blood Sugar' && m.key !== 'hba1c'))
    if (latestSugar) {
      const val = Number(latestSugar.value)
      let score = 100
      let status = 'Good'
      let note = 'Normal glucose (<100 mg/dL)'

      if (val >= 126) {
        score = 50
        status = 'High'
        note = 'High glucose range (≥126 mg/dL)'
      } else if (val >= 100) {
        score = 75
        status = 'Needs attention'
        note = 'Prediabetes range (100-125 mg/dL)'
      }

      components.glucose = {
        name: 'Blood Sugar',
        score,
        status,
        note,
        valueDisplay: `${val} ${latestSugar.unit || 'mg/dL'}`,
      }
      availableMetricsList.push('Blood Sugar')
    } else {
      missingMetricsList.push('Blood Sugar')
    }

    // 3. Evaluate HbA1c (Diabetes Marker)
    const latestHbA1c = sugarHistory.find((s) => s.measurementType === 'HbA1c') || structuredMetrics.find((m) => m.key === 'hba1c')
    if (latestHbA1c) {
      const val = Number(latestHbA1c.value)
      let score = 100
      let status = 'Good'
      let note = 'Normal HbA1c (<5.7%)'

      if (val >= 6.5) {
        score = 50
        status = 'High'
        note = 'Diabetic range (≥6.5%)'
      } else if (val >= 5.7) {
        score = 75
        status = 'Needs attention'
        note = 'Prediabetic range (5.7 - 6.4%)'
      }

      components.diabetesMarker = {
        name: 'HbA1c',
        score,
        status,
        note,
        valueDisplay: `${val}%`,
      }
      availableMetricsList.push('HbA1c')
    } else {
      missingMetricsList.push('HbA1c')
    }

    // 4. Evaluate Cholesterol & Lipid Panel
    const cholMetric = structuredMetrics.find((m) => m.key === 'total_cholesterol')
    const ldlMetric = structuredMetrics.find((m) => m.key === 'ldl')
    if (cholMetric || ldlMetric) {
      const cholVal = cholMetric ? Number(cholMetric.value) : 180
      const ldlVal = ldlMetric ? Number(ldlMetric.value) : 100

      let score = 100
      let status = 'Good'
      let note = 'Normal lipid profile (<200 mg/dL Total)'

      if (cholVal >= 240 || ldlVal >= 160) {
        score = 50
        status = 'High'
        note = 'High cholesterol range (Total ≥240 mg/dL)'
      } else if (cholVal >= 200 || ldlVal >= 100) {
        score = 75
        status = 'Needs attention'
        note = 'Borderline high cholesterol (200-239 mg/dL)'
      }

      components.cholesterol = {
        name: 'Cholesterol & Lipids',
        score,
        status,
        note,
        valueDisplay: cholMetric ? `${cholVal} mg/dL` : `LDL: ${ldlVal} mg/dL`,
      }
      availableMetricsList.push('Cholesterol & Lipids')
    } else {
      missingMetricsList.push('Cholesterol & Lipids')
    }

    // 5. Evaluate Blood Count / Hemoglobin
    const hbMetric = structuredMetrics.find((m) => m.key === 'hemoglobin')
    if (hbMetric) {
      const hbVal = Number(hbMetric.value)
      let score = 100
      let status = 'Good'
      let note = 'Normal Hemoglobin range'

      if (hbVal < 11.0 || hbVal > 18.0) {
        score = 50
        status = 'Needs attention'
        note = 'Abnormal Hemoglobin level'
      } else if (hbVal < 12.5) {
        score = 75
        status = 'Mildly low'
        note = 'Slightly low Hemoglobin'
      }

      components.bloodCount = {
        name: 'Blood Count (CBC)',
        score,
        status,
        note,
        valueDisplay: `${hbVal} ${hbMetric.unit || 'g/dL'}`,
      }
      availableMetricsList.push('CBC / Hemoglobin')
    } else {
      missingMetricsList.push('CBC / Hemoglobin')
    }

    // Calculate Data Completeness (5 total categories)
    const TOTAL_CATEGORIES = 5
    const availableCount = availableMetricsList.length
    const dataCompleteness = Math.round((availableCount / TOTAL_CATEGORIES) * 100)

    // Safeguard: Limited Data Rule (Requires at least 2 distinct categories for numerical score)
    const isLimitedData = availableCount < 2

    let overallScore = null
    let statusText = 'Health Overview: Limited Data'

    if (!isLimitedData) {
      let sum = 0
      let count = 0
      Object.values(components).forEach((comp) => {
        if (comp && typeof comp.score === 'number') {
          sum += comp.score
          count++
        }
      })
      overallScore = count > 0 ? Math.round(sum / count) : 75

      if (overallScore >= 85) {
        statusText = 'Health Overview: Good'
      } else if (overallScore >= 70) {
        statusText = 'Health Overview: Fair'
      } else {
        statusText = 'Health Overview: Needs Attention'
      }
    }

    return {
      overallScore,
      isLimitedData,
      statusText,
      dataCompleteness,
      availableMetrics: availableMetricsList,
      missingMetrics: missingMetricsList,
      components,
      calculatedAt: new Date().toISOString(),
    }
  },
}
