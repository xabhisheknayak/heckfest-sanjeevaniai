import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, HeartPulse, MapPin, Camera, CalendarDays, Sparkles } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'

export function QuickActionsFAB() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const items = [
    {
      to: '/symptom-checker',
      label: 'Symptom Checker',
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700',
      icon: <HeartPulse className="h-5 w-5" />
    },
    {
      to: '/maps',
      label: 'Hospital Map',
      color: 'bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700',
      icon: <MapPin className="h-5 w-5" />
    },
    {
      to: '/image-analysis',
      label: 'Upload Scan',
      color: 'bg-violet-500 hover:bg-violet-600 text-white dark:bg-violet-600 dark:hover:bg-violet-700',
      icon: <Camera className="h-5 w-5" />
    },
    {
      to: '/appointments',
      label: 'Book Slot',
      color: 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
      icon: <CalendarDays className="h-5 w-5" />
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      {/* Dial Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-end gap-3"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 group"
              >
                {/* Glassmorphic Tooltip */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-xl border border-slate-200/50 bg-white/80 backdrop-blur-md text-xs font-bold text-slate-800 dark:border-slate-800/40 dark:bg-slate-900/80 dark:text-slate-200 shadow-sm">
                  {item.label}
                </span>
                
                {/* Floating Bubble */}
                <Link
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${item.color}`}
                  aria-label={item.label}
                >
                  {item.icon}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Trigger */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer relative ${
          isOpen ? 'bg-slate-900 dark:bg-white dark:text-slate-950' : 'bg-[#16A34A] hover:bg-[#15803D]'
        }`}
        aria-expanded={isOpen}
        aria-label="Quick action menu panel"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Plus className="h-6 w-6 rotate-45 stroke-[2.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative flex items-center justify-center"
            >
              <Sparkles className="h-6 w-6 animate-pulse" />
              {/* Outer pulsing ring for organic attention */}
              <span className="absolute -inset-1.5 rounded-full border-2 border-[#16A34A]/30 animate-ping pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
