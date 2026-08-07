import { ShieldCheck } from 'lucide-react'

export function RiskScoreCard({ score = 78, summary = 'Steady trajectory. Continue monitoring hydration, sleep, and activity.' }) {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#16A34A]">
        <ShieldCheck className="h-5 w-5" />
        <h3 className="font-semibold">Health risk score</h3>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-4xl font-semibold text-slate-900">{score}</span>
        <span className="pb-1 text-sm text-slate-500">/ 100</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-[#16A34A]" style={{ width: `${score}%` }} />
      </div>
      <p className="mt-4 text-sm text-slate-600">{summary}</p>
    </div>
  )
}
