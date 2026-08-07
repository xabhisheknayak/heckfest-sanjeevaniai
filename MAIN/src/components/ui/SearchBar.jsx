import { Search } from 'lucide-react'

export function SearchBar({ placeholder = 'Search', value, onChange, className = '', ...props }) {
  return (
    <label className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 ${className}`}>
      <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
        {...props}
      />
    </label>
  )
}
