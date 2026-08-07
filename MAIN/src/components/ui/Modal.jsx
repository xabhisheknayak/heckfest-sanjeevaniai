import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 id="modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close modal dialog"
                className="rounded-xl border border-slate-100 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer focus-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

