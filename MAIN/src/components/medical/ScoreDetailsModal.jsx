import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

export function ScoreDetailsModal({ open, onClose, scoreData }) {
  if (!scoreData) return null

  const {
    overallScore,
    isLimitedData,
    statusText,
    dataCompleteness,
    availableMetrics = [],
    missingMetrics = [],
    components = {},
  } = scoreData

  return (
    <Modal open={open} onClose={onClose} title="SanjivniAI Health Overview Score Details">
      <div className="space-y-5">
        
        {/* Score Header */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 text-white dark:bg-slate-800 shadow-md">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Summary</p>
            <p className="text-lg font-extrabold mt-0.5">{statusText}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Data Completeness: {dataCompleteness}%
            </p>
          </div>
          <div className="text-right">
            {isLimitedData ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Limited Data
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-emerald-400">{overallScore}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
            )}
          </div>
        </div>

        {/* Component Contributions Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Component Contributions & Status
          </h4>
          <div className="space-y-2.5">
            {Object.entries(components).map(([key, comp]) => {
              if (!comp) return null
              const isGood = comp.status === 'Good'
              return (
                <div
                  key={key}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{comp.name}</p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{comp.valueDisplay}</p>
                    <p className="text-[11px] text-slate-400">{comp.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
                        isGood
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isGood ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {comp.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Available vs Missing Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Based on ({availableMetrics.length}):</p>
            <ul className="space-y-0.5 text-emerald-700 dark:text-emerald-400 font-semibold">
              {availableMetrics.map((m, idx) => (
                <li key={idx}>✓ {m}</li>
              ))}
            </ul>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Not Available ({missingMetrics.length}):</p>
            <ul className="space-y-0.5 text-slate-500 dark:text-slate-400">
              {missingMetrics.map((m, idx) => (
                <li key={idx}>○ {m}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Required Medical Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-xs flex items-start gap-2.5">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>Medical Notice:</strong> This score is an informational summary based on available health records. It is not a medical diagnosis or validated clinical risk score.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
