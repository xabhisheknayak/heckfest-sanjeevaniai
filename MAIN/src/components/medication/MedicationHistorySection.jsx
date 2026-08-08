import { Activity, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { formatReadableDate } from '../../utils/medicationScheduler'

export function MedicationHistorySection({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
        <Activity className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">No Medication History Recorded Yet</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          When you mark medicines as taken or skipped, your log history will appear here.
        </p>
      </div>
    )
  }

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = log.date || (log.timestamp ? log.timestamp.split('T')[0] : 'Other')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(log)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => (b > a ? 1 : -1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Log History</p>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Medication History</h2>
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.map((dateStr) => {
          const dateLogs = groupedLogs[dateStr]
          return (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 dark:border-slate-800">
                <Clock className="h-4 w-4 text-[#16A34A]" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatReadableDate(dateStr)}
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {dateLogs.map((log) => {
                  const isTaken = log.status === 'taken'
                  const isSkipped = log.status === 'skipped'
                  const isMissed = log.status === 'missed'

                  return (
                    <div
                      key={log.id || `${log.medicationId}-${log.time}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{log.time}</p>
                          <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                            💊 {log.medicineName}
                          </p>
                          {log.dosage && (
                            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{log.dosage}</p>
                          )}
                        </div>

                        <div>
                          {isTaken && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Taken ✓
                            </span>
                          )}
                          {isSkipped && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <XCircle className="h-3.5 w-3.5" /> Skipped
                            </span>
                          )}
                          {isMissed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                              <AlertCircle className="h-3.5 w-3.5" /> Missed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
