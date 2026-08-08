import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-[0_10px_30px_rgba(22,163,74,0.18)] dark:shadow-[0_10px_30px_rgba(22,163,74,0.06)] disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed',
  white: 'bg-white text-[#16A34A] hover:bg-emerald-50 dark:bg-white dark:text-[#16A34A] dark:hover:bg-emerald-50 shadow-md border-none disabled:opacity-50 disabled:cursor-not-allowed',
  'outline-white': 'border border-white/40 bg-transparent text-white hover:bg-white/15 dark:border-white/40 dark:bg-transparent dark:text-white dark:hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed',
  none: 'disabled:opacity-50 disabled:cursor-not-allowed',
}

export function Button({ children, variant = 'primary', className = '', loading = false, disabled = false, ...props }) {
  const isCustomBg = className.includes('bg-')
  let selectedVariantClass = variants[variant] || variants.primary
  if (variant === 'primary' && isCustomBg) {
    selectedVariantClass = 'shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
  }

  return (
    <motion.button
      whileHover={loading || disabled ? {} : { y: -2, scale: 1.01 }}
      whileTap={loading || disabled ? {} : { scale: 0.98 }}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${selectedVariantClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

