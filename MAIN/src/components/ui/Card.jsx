import { motion } from 'framer-motion'

export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' } : {}}
      whileTap={hover ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`rounded-3xl border border-slate-200/60 bg-white/75 backdrop-blur-md p-6 shadow-md transition-shadow dark:border-slate-800/75 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
