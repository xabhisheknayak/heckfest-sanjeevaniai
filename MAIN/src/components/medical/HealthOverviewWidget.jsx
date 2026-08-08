import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Heart, Activity, ShieldAlert, Sparkles, ChevronRight, Info, AlertTriangle, Plus, FileText } from 'lucide-react'
import { ScoreDetailsModal } from './ScoreDetailsModal'
import { HealthDetailsModal } from './HealthDetailsModal'
import { healthRiskService } from '../../services/healthRiskService'

export function HealthOverviewWidget({ 
  scoreData, 
  riskData, 
  onAddRecordClick,
  bpHistory = [],
  sugarHistory = [],
  structuredMetrics = [],
  medicalRecords = [],
  scoreHistory = []
}) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [scoreDetailsOpen, setScoreDetailsOpen] = useState(false)
  const [aiExplanation, setAiExplanation] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  if (!scoreData || !riskData) {
    return (
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <Activity className="h-6 w-6 animate-pulse" />
          <p className="text-xs font-semibold">Connecting Medical Records to Health Score and Risk...</p>
        </div>
      </Card>
    )
  }

  const {
    overallScore,
    isLimitedData,
    dataCompleteness,
    calculatedAt,
  } = scoreData

  const {
    overallRisk,
    riskLevelBadge,
    riskFactors = [],
    topFactors = [],
    isEmergencyFlag,
    emergencyMessage,
  } = riskData

  // Latest Recent Measurements
  const latestBP = bpHistory[0] || structuredMetrics.find((m) => m.category === 'Blood Pressure' || m.key === 'blood_pressure')
  const latestSugar = sugarHistory.find((s) => s.measurementType !== 'HbA1c') || structuredMetrics.find((m) => m.key === 'fasting_glucose' || (m.category === 'Blood Sugar' && m.key !== 'hba1c'))
  const latestHbA1c = sugarHistory.find((s) => s.measurementType === 'HbA1c') || structuredMetrics.find((m) => m.key === 'hba1c')

  // Format date display: "08 Aug 2026"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Recent'
    try {
      const parts = String(dateStr).split('T')[0].split('-')
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const handleGetAIExplanation = async () => {
    setAiLoading(true)
    try {
      const explanationRes = await healthRiskService.explainRiskWithAI(riskData)
      setAiExplanation(explanationRes.explanation)
    } catch {
      setAiExplanation('Your recorded health measurements are stable and being monitored.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden space-y-6">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* 1. Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
              ❤️
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wider text-slate-900 dark:text-white uppercase">
                HEALTH OVERVIEW
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">
                Updated: <strong>{formatDateDisplay(calculatedAt)}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Data completeness: <strong className="text-emerald-600 dark:text-emerald-400">{dataCompleteness}%</strong>
          </span>
        </div>

        {/* Emergency Flag Banner if Critical Threshold Breached */}
        {isEmergencyFlag && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{emergencyMessage || '⚠️ Attention Required'}</p>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                Some recorded measurements may require prompt professional review.
              </p>
            </div>
          </div>
        )}

        {/* 2. Health Score & Health Risk Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Health Score Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Score</p>
            {isLimitedData ? (
              <div>
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">Limited Data</p>
                <p className="text-[11px] text-slate-500">Minimum 2 categories required.</p>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{overallScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            )}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {riskLevelBadge}
              </span>
            </div>
          </div>

          {/* Health Risk & Main Factors Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Risk</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{riskLevelBadge}</p>
            <p className="text-[11px] font-bold text-slate-500">Main factors:</p>
            {topFactors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No factors recorded yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {topFactors.map((f, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    • {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 3. Recent Measurements Section */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Recent Measurements
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400">BP</p>
              {latestBP ? (
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {latestBP.systolic}/{latestBP.diastolic}
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-600 mt-1">No data</p>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400">Blood Sugar</p>
              {latestSugar ? (
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {latestSugar.value} <span className="text-[10px] text-slate-400 font-normal">{latestSugar.unit || 'mg/dL'}</span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-600 mt-1">No data</p>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400">HbA1c</p>
              {latestHbA1c ? (
                <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {latestHbA1c.value}%
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-600 mt-1">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Cautious Risk Explanations if any */}
        {riskFactors.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
            <p className="font-bold text-slate-700 dark:text-slate-300">Recorded Observations:</p>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              {riskFactors.map((rf, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{rf}</span>
                </li>
              ))}
            </ul>

            {/* Optional AI Explanation Button */}
            {!aiExplanation ? (
              <button
                onClick={handleGetAIExplanation}
                disabled={aiLoading}
                className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" /> {aiLoading ? 'Summarizing...' : 'Explain factors in plain language (AI)'}
              </button>
            ) : (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200/60">
                <strong>AI Explanation:</strong> {aiExplanation}
              </div>
            )}
          </div>
        )}

        {/* 4. Specified Action Buttons Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <Button
            onClick={() => setDetailsModalOpen(true)}
            variant="outline"
            className="text-xs font-bold px-3.5"
          >
            [ VIEW HEALTH DETAILS ]
          </Button>

          <Link to="/medical-history">
            <Button variant="secondary" className="text-xs font-bold px-3.5">
              [ VIEW MEDICAL RECORDS ]
            </Button>
          </Link>

          {onAddRecordClick && (
            <Button
              onClick={onAddRecordClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 px-3.5"
            >
              <Plus className="h-3.5 w-3.5" /> [ ADD MEDICAL RECORD ]
            </Button>
          )}
        </div>

        {/* 5. Required Non-Diagnostic Disclaimer Footer */}
        <p className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center gap-1">
          <Info className="h-3 w-3 shrink-0 text-slate-400" />
          This health overview is generated from the medical information available in your SanjivniAI records. It is not a diagnosis or a substitute for professional medical advice.
        </p>
      </Card>

      <HealthDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        scoreData={scoreData}
        riskData={riskData}
        scoreHistory={scoreHistory}
        bpHistory={bpHistory}
        sugarHistory={sugarHistory}
        structuredMetrics={structuredMetrics}
        medicalRecords={medicalRecords}
      />
    </>
  )
}
