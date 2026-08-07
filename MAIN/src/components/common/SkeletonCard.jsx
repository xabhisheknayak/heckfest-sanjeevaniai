export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
    </div>
  )
}
