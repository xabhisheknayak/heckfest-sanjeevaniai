import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Activity, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, Info } from 'lucide-react'
import { ScoreDetailsModal } from './ScoreDetailsModal'

export function HealthScoreWidget({ scoreData }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (!scoreData) {
    return (
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <Activity className="h-6 w-6 animate-pulse" />
          <p className="text-xs font-semibold">Calculating SanjivniAI Health Overview Score...</p>
        </div>
      </Card>
    )
  }

  const {
    overallScore,
    isLimitedData,
    statusText,
    dataCompleteness,
    availableMetrics = [],
    missingMetrics = [],
  } = scoreData

  return (
    <>
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                SanjivniAI Health Overview Score
              </span>
              <span className="text-[11px] font-bold text-slate-400">Completeness: {dataCompleteness}%</span>
            </div>

            {isLimitedData ? (
              <div className="mt-2.5">
                <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Health Overview: Limited Data
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                  Minimum 2 health measurement categories required to calculate a summary score. Upload reports or log BP/Sugar.
                </p>
              </div>
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {overallScore} <span className="text-sm font-bold text-slate-400">/ 100</span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40">
                  {statusText}
                </span>
              </div>
            )}

            {/* Based on / Not available lists */}
            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              {availableMetrics.length > 0 && (
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="font-bold">Based on:</span>
                  {availableMetrics.map((m, idx) => (
                    <span key={idx} className="bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px]">
                      ✓ {m}
                    </span>
                  ))}
                </div>
              )}

              {missingMetrics.length > 0 && (
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="font-semibold text-slate-500">Not available:</span>
                  {missingMetrics.slice(0, 3).map((m, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                      ○ {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 self-start sm:self-center">
            <Button
              onClick={() => setDetailsOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-sm gap-1"
            >
              [ VIEW SCORE DETAILS ] <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Disclaimer banner */}
        <p className="mt-4 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center gap-1">
          <Info className="h-3 w-3 shrink-0 text-slate-400" />
          This score is an informational summary based on available health records. It is not a medical diagnosis or validated clinical risk score.
        </p>
      </Card>

      <ScoreDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        scoreData={scoreData}
      />
    </>
  )
}
