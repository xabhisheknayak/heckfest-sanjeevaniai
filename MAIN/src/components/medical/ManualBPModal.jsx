import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { HeartPulse, AlertCircle } from 'lucide-react'

export function ManualBPModal({ open, onClose, onSubmit, submitting }) {
  const [systolic, setSystolic] = useState('120')
  const [diastolic, setDiastolic] = useState('80')
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0])
  const [measurementTime, setMeasurementTime] = useState('09:00 AM')
  const [source, setSource] = useState('Manual') // 'Manual' | 'Doctor' | 'Report'
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const sysNum = Number(systolic)
    const diaNum = Number(diastolic)

    if (!sysNum || sysNum < 60 || sysNum > 260) {
      setError('Please enter a valid Systolic BP reading (60 - 260 mmHg).')
      return
    }
    if (!diaNum || diaNum < 40 || diaNum > 160) {
      setError('Please enter a valid Diastolic BP reading (40 - 160 mmHg).')
      return
    }

    try {
      await onSubmit({
        systolic: sysNum,
        diastolic: diaNum,
        measurementDate,
        measurementTime,
        source,
      })

      // Reset
      setSystolic('120')
      setDiastolic('80')
      setMeasurementDate(new Date().toISOString().split('T')[0])
      setMeasurementTime('09:00 AM')
      setSource('Manual')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save BP reading.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="+ Add BP Reading">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Systolic (mmHg) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Diastolic (mmHg) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={measurementDate}
              onChange={(e) => setMeasurementDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Time
            </label>
            <Input
              type="text"
              placeholder="e.g. 09:00 AM"
              value={measurementTime}
              onChange={(e) => setMeasurementTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Measurement Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <option value="Manual">Manual (Self-check monitor)</option>
            <option value="Doctor">Doctor (Clinical Visit)</option>
            <option value="Report">Report (Lab / Scan)</option>
          </select>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
            {submitting ? 'Saving...' : 'SAVE BP READING'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
