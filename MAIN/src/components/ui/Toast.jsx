import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export function Toast({ title, message, tone = 'success' }) {
  const toneStyles = {
    success: 'border-emerald-100 bg-emerald-50/90 text-emerald-800 dark:border-emerald-950/40 dark:bg-emerald-950/30 dark:text-emerald-300',
    info: 'border-sky-100 bg-sky-50/90 text-sky-800 dark:border-sky-950/40 dark:bg-sky-950/30 dark:text-sky-300',
    warning: 'border-amber-100 bg-amber-50/90 text-amber-800 dark:border-amber-950/40 dark:bg-amber-950/30 dark:text-amber-300',
  }

  const icons = {
    success: CheckCircle2,
    info: Info,
    warning: AlertCircle,
  }

  const IconComponent = icons[tone] || CheckCircle2

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-md backdrop-blur-md ${toneStyles[tone] || toneStyles.success}`}
    >
      <IconComponent className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-0.5 text-xs opacity-90 leading-relaxed">{message}</div>
      </div>
    </motion.div>
  )
}

