import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { AlertCircle } from 'lucide-react'

export function ManualSugarModal({ open, onClose, onSubmit, submitting }) {
  const [value, setValue] = useState('100')
  const [unit, setUnit] = useState('mg/dL')
  const [measurementType, setMeasurementType] = useState('Fasting') // 'Fasting' | 'Post-meal' | 'Random' | 'HbA1c'
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const valNum = Number(value)
    if (isNaN(valNum) || valNum <= 0) {
      setError('Please enter a valid blood sugar value.')
      return
    }

    try {
      await onSubmit({
        value: valNum,
        unit,
        measurementType,
        measurementDate,
      })

      // Reset
      setValue('100')
      setUnit('mg/dL')
      setMeasurementType('Fasting')
      setMeasurementDate(new Date().toISOString().split('T')[0])
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save blood sugar reading.')
    }
  }

  const handleTypeChange = (newType) => {
    setMeasurementType(newType)
    if (newType === 'HbA1c') {
      setUnit('%')
      if (Number(value) > 20) setValue('5.8')
    } else {
      setUnit('mg/dL')
      if (Number(value) < 20) setValue('100')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="+ Add Blood Sugar">
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
              Blood Sugar Value <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="any"
              placeholder={unit === '%' ? 'e.g. 5.8' : 'e.g. 102'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
            >
              <option value="mg/dL">mg/dL</option>
              <option value="%">% (HbA1c)</option>
              <option value="mmol/L">mmol/L</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Measurement Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Fasting', 'Post-meal', 'Random', 'HbA1c'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  measurementType === type
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

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

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            {submitting ? 'Saving...' : 'SAVE SUGAR READING'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
