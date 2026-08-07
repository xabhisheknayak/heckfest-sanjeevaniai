import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-[0_10px_30px_rgba(22,163,74,0.18)] dark:shadow-[0_10px_30px_rgba(22,163,74,0.06)] disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed',
}

export function Button({ children, variant = 'primary', className = '', loading = false, disabled = false, ...props }) {
  return (
    <motion.button
      whileHover={loading || disabled ? {} : { y: -2, scale: 1.01 }}
      whileTap={loading || disabled ? {} : { scale: 0.98 }}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition cursor-pointer ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}
