import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Activity, HeartPulse, FileText, CheckCircle2, AlertTriangle, TrendingUp, Info } from 'lucide-react'

export function HealthDetailsModal({ open, onClose, scoreData, riskData, scoreHistory = [], bpHistory = [], sugarHistory = [], structuredMetrics = [], medicalRecords = [] }) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!scoreData || !riskData) return null

  const {
    overallScore = 78,
    isLimitedData = false,
    dataCompleteness = 72,
    availableMetrics = [],
    missingMetrics = [],
  } = scoreData

  const {
    overallRisk = 'Needs Attention',
    riskLevelBadge = '🟡 Needs Attention',
    riskFactors = [],
    supportingMeasurements = {},
  } = riskData

  // Format date display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A'
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

  return (
    <Modal open={open} onClose={onClose} title="SanjivniAI Comprehensive Health Details">
      <div className="space-y-6">
        
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Overview & Risk
          </button>
          <button
            onClick={() => setActiveTab('scoreHistory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'scoreHistory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Score & Risk History
          </button>
          <button
            onClick={() => setActiveTab('vitalsTrend')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'vitalsTrend'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            BP & Sugar Trends
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'labs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Laboratory & Reports
          </button>
        </div>

        {/* SUB-TAB 1: OVERVIEW & RISK */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health Score</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {isLimitedData ? 'Limited Data' : `${overallScore} / 100`}
                </p>
                <p className="text-xs text-slate-300 mt-1 font-semibold">Completeness: {dataCompleteness}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health Risk</p>
                <p className="text-lg font-extrabold text-amber-400 mt-1">{riskLevelBadge}</p>
                <p className="text-xs text-slate-300 mt-1 font-semibold">{overallRisk}</p>
              </div>
            </div>

            {/* Available vs Missing Data */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">Available Data ({availableMetrics.length}):</p>
                <ul className="space-y-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  {availableMetrics.map((m, idx) => (
                    <li key={idx}>✓ {m}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1.5">Missing Data ({missingMetrics.length}):</p>
                <ul className="space-y-1 text-slate-500 dark:text-slate-400 font-medium">
                  {missingMetrics.map((m, idx) => (
                    <li key={idx}>○ {m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: SCORE & RISK HISTORY */}
        {activeTab === 'scoreHistory' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Score Snapshots</h4>
            {scoreHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No score snapshots recorded yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Completeness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {scoreHistory.map((snap, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{formatDateDisplay(snap.calculatedAt)}</td>
                        <td className="p-2.5 font-extrabold text-emerald-600 dark:text-emerald-400">{snap.score ? `${snap.score} / 100` : 'Limited Data'}</td>
                        <td className="p-2.5 font-semibold text-slate-600 dark:text-slate-400">{snap.dataCompleteness}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: VITALS TRENDS */}
        {activeTab === 'vitalsTrend' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HeartPulse className="h-4 w-4" /> Blood Pressure Trend History
              </h4>
              {bpHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No BP readings logged.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Reading (mmHg)</th>
                        <th className="p-2.5">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bpHistory.map((bp, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-semibold">{formatDateDisplay(bp.measurementDate)}</td>
                          <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">{bp.systolic}/{bp.diastolic} mmHg</td>
                          <td className="p-2.5 text-slate-500">{bp.source || 'Manual'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">
                🍬 Blood Sugar Trend History
              </h4>
              {sugarHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No Blood Sugar readings logged.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sugarHistory.map((sugar, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-semibold">{formatDateDisplay(sugar.measurementDate)}</td>
                          <td className="p-2.5 capitalize">{sugar.measurementType || 'Fasting'}</td>
                          <td className="p-2.5 font-bold text-teal-600 dark:text-teal-400">{sugar.value} {sugar.unit || 'mg/dL'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: LABS & REPORTS */}
        {activeTab === 'labs' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supporting Medical Reports ({medicalRecords.length})</h4>
            {medicalRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No medical reports uploaded.</p>
            ) : (
              <div className="space-y-2">
                {medicalRecords.map((rec) => (
                  <div key={rec.id || rec._id} className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{rec.recordName}</p>
                      <p className="text-slate-500">{formatDateDisplay(rec.recordDate)} • {rec.recordType}</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ID: {String(rec.id || rec._id).substring(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Required Non-Diagnostic Medical Notice */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-xs flex items-start gap-2.5">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            This health overview is generated from the medical information available in your SanjivniAI records. It is not a diagnosis or a substitute for professional medical advice.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs">
            Close
          </Button>
        </div>

      </div>
    </Modal>
  )
}
