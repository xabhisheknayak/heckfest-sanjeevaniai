export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
      <div className="h-4 w-28 rounded-full animate-shimmer" />
      <div className="mt-4 h-6 w-3/4 rounded-full animate-shimmer" />
      <div className="mt-3 h-4 w-full rounded-full animate-shimmer" />
      <div className="mt-2 h-4 w-1/2 rounded-full animate-shimmer" />
    </div>
  )
}

