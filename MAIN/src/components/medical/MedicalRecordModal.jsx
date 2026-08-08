import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'

export const RECORD_CATEGORIES = [
  { id: 'blood_report', label: 'Blood Report', icon: '🩸', desc: 'Blood tests, CBC, Lipid profile, etc.' },
  { id: 'blood_pressure', label: 'Blood Pressure', icon: '❤️', desc: 'BP monitor logs, Cardiology reports' },
  { id: 'blood_sugar', label: 'Blood Sugar', icon: '🍬', desc: 'HbA1c, Fasting/PP glucose logs' },
  { id: 'xray_imaging', label: 'X-Ray / Imaging', icon: '🩻', desc: 'X-Rays, MRI, CT scans, Ultrasound' },
  { id: 'prescription', label: 'Prescriptions', icon: '💊', desc: 'Doctor prescriptions & dosage advice' },
  { id: 'doctor_report', label: 'Doctor Reports', icon: '📄', desc: 'Discharge summaries, Clinical notes' },
  { id: 'other_documents', label: 'Other Documents', icon: '📁', desc: 'Insurance, Vaccination, General lab notes' }
]

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB limit

export function MedicalRecordModal({ open, onClose, onSubmit, submitting }) {
  const [recordType, setRecordType] = useState('blood_report')
  const [recordName, setRecordName] = useState('')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [doctorName, setDoctorName] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    setError('')
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      return
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      setError('Invalid file format. Please upload a PDF, JPG, JPEG, or PNG file.')
      setFile(null)
      return
    }

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError('File size exceeds 10MB limit. Please upload a smaller file.')
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!recordName.trim()) {
      setError('Report Name is required.')
      return
    }
    if (!recordDate) {
      setError('Date is required.')
      return
    }
    if (!file) {
      setError('Please choose a file to upload (PDF, JPG, JPEG, PNG).')
      return
    }

    try {
      await onSubmit({
        recordType,
        recordName: recordName.trim(),
        recordDate,
        doctorName: doctorName.trim(),
        hospitalName: hospitalName.trim(),
        notes: notes.trim(),
      }, file)

      // Reset form on success
      setRecordType('blood_report')
      setRecordName('')
      setRecordDate(new Date().toISOString().split('T')[0])
      setDoctorName('')
      setHospitalName('')
      setNotes('')
      setFile(null)
      setError('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to upload medical record. Please try again.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="+ Add Medical Record">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Record Type Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Record Type <span className="text-red-500">*</span>
          </label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-emerald-500"
          >
            {RECORD_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Report Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Report Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. Complete Blood Count (CBC) or Chest X-Ray"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            required
          />
        </div>

        {/* Doctor & Hospital inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Doctor Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Dr. A. Sharma"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hospital / Clinic
            </label>
            <Input
              type="text"
              placeholder="e.g. City General Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />
          </div>
        </div>

        {/* Upload File */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Upload File <span className="text-red-500">*</span> <span className="text-[10px] text-slate-400 font-normal">(PDF, JPG, JPEG, PNG - Max 10MB)</span>
          </label>
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-900/40">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 z-10 opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-[10px] text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="text-xs font-semibold">Click or drag file here to choose</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, JPEG, PNG</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Notes / Observations
          </label>
          <textarea
            rows={2}
            placeholder="Add any extra notes or doctor's remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Record...</span>
              </div>
            ) : (
              'SAVE RECORD'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
