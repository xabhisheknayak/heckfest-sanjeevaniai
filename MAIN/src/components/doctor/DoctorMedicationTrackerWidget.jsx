import { useState, useEffect, useCallback } from 'react'
import { Pill, CheckCircle2, Clock, AlertCircle, XCircle, Plus, ShieldCheck, Zap } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { dataService } from '../../services/dataService'
import { formatDateToYYYYMMDD, formatDisplayTime } from '../../utils/medicationScheduler'

const PATIENTS = [
  { id: 'P-1029', name: 'Asha Patel', age: 34, condition: 'Acute Migraine & Tension Headache' },
  { id: 'P-1044', name: 'Rajesh Sharma', age: 52, condition: 'Exertional Chest Pain & Hypertension' },
  { id: 'P-1088', name: 'Priya Nair', age: 29, condition: 'Viral Fever & Upper Respiratory Triage' },
  { id: 'P-1102', name: 'Vikram Singh', age: 61, condition: 'Hypertension Review (135/88 mmHg)' }
]

export function DoctorMedicationTrackerWidget({ doctorName = 'Dr. Practitioner' }) {
  const [selectedPatientId, setSelectedPatientId] = useState('P-1029')
  const [medications, setMedications] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [notice, setNotice] = useState('')

  // Assign Form state
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [time, setTime] = useState('08:00')
  const [frequency, setFrequency] = useState('Every day')
  const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()))
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [strictAlarm, setStrictAlarm] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPatient = PATIENTS.find((p) => p.id === selectedPatientId) || PATIENTS[0]

  useEffect(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    setEndDate(formatDateToYYYYMMDD(d))
  }, [])

  const loadPatientMedData = useCallback(async () => {
    setLoading(true)
    try {
      const [meds, logList] = await Promise.all([
        dataService.doctorGetPatientMedications(selectedPatientId),
        dataService.doctorGetPatientLogs(selectedPatientId)
      ])

      // Fallback demo data if empty
      if (!meds || meds.length === 0) {
        setMedications([
          {
            id: 'med-demo-1',
            medicineName: 'Paracetamol 500mg',
            dosage: '1 tablet twice daily after meals',
            time: '08:00 AM',
            frequency: 'Every day',
            startDate: formatDateToYYYYMMDD(new Date()),
            endDate: formatDateToYYYYMMDD(new Date(Date.now() + 864000000)),
            notes: 'Take after breakfast',
            strictAlarm: true,
            assignedByDoctor: true,
            doctorName: 'Dr. Ananya Mehta'
          },
          {
            id: 'med-demo-2',
            medicineName: 'Amlodipine 5mg',
            dosage: '1 tablet in evening',
            time: '08:00 PM',
            frequency: 'Every day',
            startDate: formatDateToYYYYMMDD(new Date()),
            endDate: formatDateToYYYYMMDD(new Date(Date.now() + 864000000)),
            notes: 'BP management',
            strictAlarm: true,
            assignedByDoctor: true,
            doctorName: 'Dr. Ananya Mehta'
          }
        ])
        setLogs([
          {
            medicationId: 'med-demo-1',
            medicineName: 'Paracetamol 500mg',
            dosage: '1 tablet twice daily after meals',
            date: formatDateToYYYYMMDD(new Date()),
            time: '08:00 AM',
            status: 'taken',
            timestamp: new Date().toISOString()
          }
        ])
      } else {
        setMedications(meds)
        setLogs(logList || [])
      }
    } catch (err) {
      console.warn('Failed to load patient med data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedPatientId])

  useEffect(() => {
    loadPatientMedData()
  }, [loadPatientMedData])

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!medicineName.trim()) return

    setIsSubmitting(true)
    try {
      const formattedTime = formatDisplayTime(time)
      const newMedData = {
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        time: formattedTime,
        frequency,
        startDate,
        endDate,
        notes: notes.trim(),
        strictAlarm,
        doctorName,
        assignedByDoctor: true,
      }

      await dataService.doctorAssignMedication(selectedPatientId, newMedData)
      setNotice(`Prescribed and assigned ${medicineName} to ${selectedPatient.name}.`)
      setShowAssignForm(false)
      setMedicineName('')
      setDosage('')
      await loadPatientMedData()
    } catch (err) {
      setNotice('Failed to assign medication.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const todayStr = formatDateToYYYYMMDD(new Date())

  return (
    <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              💊 Patient Medication Adherence Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor patient daily intake compliance and assign reminders with strict continuous alarms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Patient Selector */}
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                👤 {p.name} ({p.id})
              </option>
            ))}
          </select>

          <Button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="text-xs gap-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" /> Prescribe Reminder
          </Button>
        </div>
      </div>

      {notice && (
        <div className="mt-4 rounded-xl bg-emerald-100 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          ✓ {notice}
        </div>
      )}

      {/* Doctor Prescribe & Assign Reminder Form */}
      {showAssignForm && (
        <form onSubmit={handleAssignSubmit} className="mt-5 space-y-4 rounded-2xl border border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2 dark:border-emerald-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-600" /> Prescribe & Assign Reminder to {selectedPatient.name}
            </h3>
            <button
              type="button"
              onClick={() => setShowAssignForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Medicine Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Paracetamol 500mg"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Dosage / Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. 1 tablet after meals"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Reminder Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Strict Continuous Alarm Option */}
          <div className="rounded-xl bg-white p-3 dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                ⚡ Enable Strict Continuous Alarm
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Alarm will ring continuously on patient's device until they explicitly tap TAKEN or SKIP
              </p>
            </div>
            <input
              type="checkbox"
              checked={strictAlarm}
              onChange={(e) => setStrictAlarm(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full justify-center bg-[#16A34A] hover:bg-emerald-700 py-2.5 text-xs text-white font-bold"
          >
            {isSubmitting ? 'Assigning...' : `ASSIGN REMINDER TO ${selectedPatient.name.toUpperCase()}`}
          </Button>
        </form>
      )}

      {/* Patient Adherence Table */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span>Adherence Status for <strong>{selectedPatient.name}</strong></span>
            <span className="text-slate-400 font-normal">({selectedPatient.condition})</span>
          </p>
          <span className="text-xs text-slate-500">Today's Intake Schedule</span>
        </div>

        {medications.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed rounded-xl">
            No medications prescribed for this patient yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {medications.map((med) => {
              const log = logs.find((l) => l.medicationId === med.id && l.date === todayStr)
              const isTaken = log?.status === 'taken'
              const isSkipped = log?.status === 'skipped'

              return (
                <div
                  key={med.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg">
                        {med.time}
                      </span>

                      <div>
                        {isTaken ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Taken ✓
                          </span>
                        ) : isSkipped ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <XCircle className="h-3 w-3" /> Skipped
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        💊 {med.medicineName}
                      </p>
                      {med.dosage && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {med.dosage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {med.strictAlarm !== false ? '⚡ Continuous Alarm' : 'Standard Reminder'}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {med.assignedByDoctor ? `By ${med.doctorName || 'Doctor'}` : 'Self-scheduled'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
