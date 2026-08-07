export function Input({ label, className = '', ...props }) {
  return (
    <label className="block w-full text-sm text-slate-600 dark:text-slate-400">
      {label && <span className="mb-2 block font-medium">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none ring-0 transition focus:border-[#16A34A] focus:ring-2 focus:ring-[#DCFCE7] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-[#16A34A] dark:focus:ring-emerald-950/50 ${className}`}
        {...props}
      />
    </label>
  )
}
