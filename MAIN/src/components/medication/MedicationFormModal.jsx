import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, AlertCircle, CheckCircle2, Pill } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatDateToYYYYMMDD, formatDisplayTime } from '../../utils/medicationScheduler'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function MedicationFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [time, setTime] = useState('08:00')
  const [frequency, setFrequency] = useState('Every day')
  const [specificDays, setSpecificDays] = useState([])
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()))
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [strictAlarm, setStrictAlarm] = useState(true)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setMedicineName(initialData.medicineName || '')
      setDosage(initialData.dosage || '')
      // Format 12h time to 24h for input if needed
      let rawTime = initialData.time || '08:00'
      if (rawTime.includes('AM') || rawTime.includes('PM')) {
        const [timePart, ampm] = rawTime.split(' ')
        let [h, m] = timePart.split(':')
        let hours = parseInt(h, 10)
        if (ampm === 'PM' && hours < 12) hours += 12
        if (ampm === 'AM' && hours === 12) hours = 0
        rawTime = `${String(hours).padStart(2, '0')}:${m}`
      }
      setTime(rawTime)
      setFrequency(initialData.frequency || 'Every day')
      setSpecificDays(initialData.specificDays || [])
      setStartDate(initialData.startDate || formatDateToYYYYMMDD(new Date()))
      setEndDate(initialData.endDate || '')
      setNotes(initialData.notes || '')
      setStrictAlarm(initialData.strictAlarm ?? true)
    } else {
      setMedicineName('')
      setDosage('')
      setTime('08:00')
      setFrequency('Every day')
      setSpecificDays([])
      setStartDate(formatDateToYYYYMMDD(new Date()))
      
      // Default end date +30 days
      const d = new Date()
      d.setDate(d.getDate() + 30)
      setEndDate(formatDateToYYYYMMDD(d))
      setNotes('')
      setStrictAlarm(true)
    }
    setErrors({})
  }, [initialData, isOpen])

  const toggleDay = (day) => {
    if (specificDays.includes(day)) {
      setSpecificDays(specificDays.filter((d) => d !== day))
    } else {
      setSpecificDays([...specificDays, day])
    }
  }

  const validate = () => {
    const errs = {}
    if (!medicineName.trim()) {
      errs.medicineName = 'Medicine name cannot be empty'
    }
    if (!time) {
      errs.time = 'Time is required'
    }
    if (!startDate) {
      errs.startDate = 'Start date is required'
    }
    if (!endDate) {
      errs.endDate = 'End date is required'
    }
    if (startDate && endDate) {
      if (startDate > endDate) {
        errs.startDate = 'Start date cannot be after end date'
        errs.endDate = 'End date cannot be before start date'
      }
    }
    if (frequency === 'Specific days of week' && specificDays.length === 0) {
      errs.specificDays = 'Please select at least one day'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const formattedTime = formatDisplayTime(time)
      const medicationData = {
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        time: formattedTime,
        frequency,
        specificDays: frequency === 'Specific days of week' ? specificDays : [],
        startDate,
        endDate,
        notes: notes.trim(),
        strictAlarm,
        active: initialData ? (initialData.active ?? true) : true,
      }
      await onSave(medicationData)
      onClose()
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save medication' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-2.5 text-[#16A34A] dark:bg-emerald-950/50">
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {initialData ? 'Edit Medication Reminder' : '+ Add Medication'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Set schedule and dosage instructions</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errors.submit && (
              <div className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className={`mt-1.5 w-full rounded-2xl border ${
                    errors.medicineName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:bg-slate-950 dark:text-white`}
                />
                {errors.medicineName && <p className="mt-1 text-xs text-red-500">{errors.medicineName}</p>}
              </div>

              {/* Dosage / Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dosage / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Reminder Time */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Reminder Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`w-full rounded-2xl border ${
                        errors.time ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:bg-slate-950 dark:text-white`}
                    />
                  </div>
                  {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Every day">Every day</option>
                    <option value="Every week">Every week</option>
                    <option value="Specific days of week">Specific days of week</option>
                  </select>
                </div>
              </div>

              {/* Specific Days checklist */}
              {frequency === 'Specific days of week' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Select Days <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = specificDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            isSelected
                              ? 'bg-[#16A34A] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      )
                    })}
                  </div>
                  {errors.specificDays && <p className="mt-1 text-xs text-red-500">{errors.specificDays}</p>}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`mt-1.5 w-full rounded-2xl border ${
                      errors.startDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:bg-slate-950 dark:text-white`}
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`mt-1.5 w-full rounded-2xl border ${
                      errors.endDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:bg-slate-950 dark:text-white`}
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Notes / Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take after breakfast"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-[#16A34A] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Strict Continuous Alarm Toggle */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-950 dark:bg-emerald-950/30 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    ⚡ Strict Continuous Alarm
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Alarm rings continuously until patient taps TAKEN or SKIP
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={strictAlarm}
                  onChange={(e) => setStrictAlarm(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                />
              </div>

              {/* Save Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full justify-center bg-[#16A34A] hover:bg-emerald-700 py-3 text-white font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'SAVE REMINDER'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
