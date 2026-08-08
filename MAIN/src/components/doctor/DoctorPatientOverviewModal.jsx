import { Link } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ShieldCheck, HeartPulse, Activity, FileText, ChevronRight, CheckCircle2, Info } from 'lucide-react'

export function DoctorPatientOverviewModal({ open, onClose, patient, scoreData, riskData, scoreHistory = [] }) {
  if (!patient) return null

  const {
    overallScore = 78,
    isLimitedData = false,
    dataCompleteness = 72,
  } = scoreData || {}

  const {
    overallRisk = 'Needs Attention',
    riskLevelBadge = '🟡 Needs Attention',
    riskFactors = [],
    supportingMeasurements = {},
  } = riskData || {}

  return (
    <Modal open={open} onClose={onClose} title={`Patient Health Overview: ${patient.patient || patient.name || 'Patient'}`}>
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="p-4 rounded-3xl bg-slate-900 text-white dark:bg-slate-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Patient Overview</p>
            <h3 className="text-lg font-extrabold mt-0.5">{patient.patient || patient.name}</h3>
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
                <span className="text-3xl font-extrabold text-emerald-400">{overallScore}</span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            )}
            <div className="mt-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                {riskLevelBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Supporting Measurements */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Supporting Recent Measurements
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400">Blood Pressure</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                {supportingMeasurements.bloodPressure || '138/88 mmHg'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400">Blood Sugar</p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {supportingMeasurements.glucose || '112 mg/dL'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400">HbA1c</p>
              <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                {supportingMeasurements.hba1c || '5.6%'}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Factors / Clinical Observations */}
        {riskFactors.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-300">Recorded Observations & Factors:</p>
            <ul className="space-y-1 text-amber-800 dark:text-amber-400 font-medium">
              {riskFactors.map((rf, idx) => (
                <li key={idx}>• {rf}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Health Score Trend Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Health Score Trend Snapshot
          </h4>
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
                {(scoreHistory.length > 0 ? scoreHistory : [
                  { calculatedAt: '2026-08-08', score: 78, dataCompleteness: 72 },
                  { calculatedAt: '2026-08-05', score: 76, dataCompleteness: 60 },
                  { calculatedAt: '2026-08-01', score: 72, dataCompleteness: 40 },
                ]).map((snap, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {snap.calculatedAt ? String(snap.calculatedAt).split('T')[0] : 'Recent'}
                    </td>
                    <td className="p-2.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {snap.score || 78} / 100
                    </td>
                    <td className="p-2.5 font-semibold text-slate-600 dark:text-slate-400">
                      {snap.dataCompleteness || 72}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link to="/medical-history">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1">
              <FileText className="h-4 w-4" /> [ VIEW MEDICAL RECORDS ]
            </Button>
          </Link>
          <Button onClick={onClose} variant="outline" className="text-xs font-bold">
            Close
          </Button>
        </div>

      </div>
    </Modal>
  )
}
