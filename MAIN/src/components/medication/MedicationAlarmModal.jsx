import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, Check, X, Volume2, VolumeX, Pill } from 'lucide-react'
import { medicationAudioEngine } from '../../utils/medicationAudioEngine'

export function MedicationAlarmModal({ alarmData, onMarkTaken, onMarkSkipped }) {
  const [isAudioBlocked, setIsAudioBlocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isMissed = alarmData?.type === 'missed'
  const med = alarmData?.medication

  useEffect(() => {
    if (!med) return

    // Start alarm sound
    const triggerAudio = async () => {
      const res = await medicationAudioEngine.startAlarm()
      if (res.isBlocked) {
        setIsAudioBlocked(true)
      } else {
        setIsAudioBlocked(false)
      }
    }

    triggerAudio()

    return () => {
      medicationAudioEngine.stopAlarm()
    }
  }, [med])

  if (!med) return null

  const handleUnlockAudio = async () => {
    const unlocked = await medicationAudioEngine.unlockAudio()
    if (unlocked) {
      setIsAudioBlocked(false)
    }
  }

  const handleTaken = async () => {
    setIsSubmitting(true)
    medicationAudioEngine.stopAlarm()
    try {
      await onMarkTaken(med)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipped = async () => {
    setIsSubmitting(true)
    medicationAudioEngine.stopAlarm()
    try {
      await onMarkSkipped(med)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md rounded-3xl border-2 border-emerald-500 bg-white p-6 shadow-2xl dark:border-emerald-500 dark:bg-slate-900 my-8 text-center"
        >
          {/* Audio Autoplay Unlocking Banner */}
          {isAudioBlocked && (
            <div className="mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 p-3 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <VolumeX className="h-4 w-4 animate-bounce text-amber-500" />
                <span>Tap to enable medication alarm</span>
              </div>
              <button
                onClick={handleUnlockAudio}
                className="rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer shadow"
              >
                ENABLE ALARM
              </button>
            </div>
          )}

          {/* Alarm Header */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={`rounded-full p-4 ${
                isMissed
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                  : 'bg-emerald-100 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-400 animate-pulse'
              }`}
            >
              {isMissed ? <AlertTriangle className="h-10 w-10" /> : <Bell className="h-10 w-10 animate-bounce" />}
            </div>

            <span className={`mt-3 text-xs font-extrabold uppercase tracking-[0.25em] ${isMissed ? 'text-red-500' : 'text-[#16A34A]'}`}>
              {isMissed ? '⚠️ MISSED MEDICATION' : '🔔 MEDICATION REMINDER'}
            </span>

            {med.strictAlarm !== false && (
              <span className="mt-1.5 inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-0.5 text-[11px] font-black text-[#16A34A] dark:text-emerald-300">
                ⚡ Doctor-Enforced Continuous Alarm (Rings until TAKEN or SKIP is tapped)
              </span>
            )}
          </div>

          {/* Details */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
              💊 {med.medicineName}
            </h3>

            {med.dosage && (
              <p className="mt-1 text-base font-bold text-slate-700 dark:text-slate-300">
                {med.dosage}
              </p>
            )}

            <div className="mt-3 inline-block rounded-xl bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Scheduled: {med.time}
            </div>

            {med.notes && (
              <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                "{med.notes}"
              </p>
            )}

            <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
              {isMissed ? 'Please log if you took this medication or skipped it.' : 'Take your scheduled medication now.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={isSubmitting}
              onClick={handleTaken}
              className="flex-1 rounded-2xl bg-[#16A34A] py-3.5 px-4 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" /> MARK AS TAKEN
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleSkipped}
              className="flex-1 rounded-2xl bg-slate-200 py-3.5 px-4 text-sm font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" /> SKIP
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
