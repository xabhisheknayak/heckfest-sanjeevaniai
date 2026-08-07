import { Sparkles } from 'lucide-react'

const tips = [
  'Hydrate regularly and keep a water bottle nearby throughout the day.',
  'Take a 10-minute walk after meals to support blood sugar balance.',
  'Prioritize 7-8 hours of sleep to improve recovery and focus.',
  'A short breathing session can lower stress and support heart health.'
]

export function HealthTips() {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-gradient-to-br from-[#F0FDF4] to-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#16A34A]">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-semibold">Daily health tips</h3>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {tips.map((tip) => (
          <li key={tip} className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">{tip}</li>
        ))}
      </ul>
    </div>
  )
}
