import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, ShieldCheck } from 'lucide-react'

const DISMISSED_KEY = 'sanjivni-pwa-dismissed'

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user previously dismissed prompt
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem(DISMISSED_KEY)
      if (isDismissed) return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsVisible(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true')
    }
  }

  if (!isVisible || !deferredPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/90 to-slate-950/90 p-4 text-white shadow-xl backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#16A34A] p-2.5 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">PWA App Available</p>
              <p className="text-sm font-semibold text-slate-100">
                Install SanjivniAI for better medication reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="rounded-xl bg-[#16A34A] px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="h-4 w-4" /> INSTALL APP
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
