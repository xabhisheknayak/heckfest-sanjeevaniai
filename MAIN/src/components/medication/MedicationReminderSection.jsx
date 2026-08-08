import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Pill, Plus, Check, X, ShieldAlert, Edit2, Trash2, Power, Clock, Bell, Volume2, Play, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { MedicationFormModal } from './MedicationFormModal'
import { MedicationAlarmModal } from './MedicationAlarmModal'
import { medicationReminderEngine } from '../../utils/medicationReminderEngine'
import {
  formatDateToYYYYMMDD,
  isMedicationScheduledForDate,
  calculateMedicationStatus,
  parseTimeToMinutes,
  formatDisplayTime,
} from '../../utils/medicationScheduler'

import { PWAInstallPrompt } from '../common/PWAInstallPrompt'

export function MedicationReminderSection({
  medications = [],
  logs = [],
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onRecordLog,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [filter, setFilter] = useState('today') // 'today' | 'all'
  const [permissionState, setPermissionState] = useState('default')
  const [activeAlarm, setActiveAlarm] = useState(null) // { medication, type }
  const [isTestPending, setIsTestPending] = useState(false)
  const [showHowToEnable, setShowHowToEnable] = useState(false)

  const todayStr = formatDateToYYYYMMDD(new Date())

  // Evaluate browser notification permission on mount
  useEffect(() => {
    setPermissionState(medicationReminderEngine.getPermissionState())
  }, [])

  const handleRequestPermission = async () => {
    const perm = await medicationReminderEngine.requestPermission()
    setPermissionState(perm)
  }

  // Background reminder evaluator loop (runs every 15s + on visibilitychange)
  const checkReminders = useCallback(() => {
    medicationReminderEngine.evaluateReminders(medications, logs, (med, type) => {
      setActiveAlarm({ medication: med, type })
    })
  }, [medications, logs])

  useEffect(() => {
    checkReminders()
    const interval = setInterval(checkReminders, 15000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkReminders()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkReminders])

  // Filter today's scheduled medications
  const todayMedications = medications.filter((med) => isMedicationScheduledForDate(med, new Date()))

  // Sort today's medications by reminder time
  todayMedications.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))

  const handleOpenAdd = () => {
    setEditingMed(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (med) => {
    setEditingMed(med)
    setModalOpen(true)
  }

  const handleSave = async (formData) => {
    if (editingMed) {
      await onUpdateMedication(editingMed.id, formData)
    } else {
      await onAddMedication(formData)
    }
  }

  const handleMarkTaken = async (med) => {
    await onRecordLog({
      medicationId: med.id,
      medicineName: med.medicineName,
      dosage: med.dosage,
      date: todayStr,
      time: med.time,
      status: 'taken',
    })
    if (activeAlarm?.medication?.id === med.id) {
      setActiveAlarm(null)
    }
  }

  const handleMarkSkipped = async (med) => {
    await onRecordLog({
      medicationId: med.id,
      medicineName: med.medicineName,
      dosage: med.dosage,
      date: todayStr,
      time: med.time,
      status: 'skipped',
    })
    if (activeAlarm?.medication?.id === med.id) {
      setActiveAlarm(null)
    }
  }

  const handleToggleActive = async (med) => {
    await onUpdateMedication(med.id, { active: !med.active })
  }

  // Development / Testing: Trigger Test Reminder in 5 seconds
  const handleTestReminder = () => {
    setIsTestPending(true)
    setTimeout(() => {
      const testMed = {
        id: `test-med-${Date.now()}`,
        medicineName: 'Paracetamol (Test)',
        dosage: '1 tablet',
        time: formatDisplayTime(`${new Date().getHours()}:${new Date().getMinutes()}`),
        notes: 'Take after meal',
      }
      medicationReminderEngine.showNotification(
        'SanjivniAI 💊 Medication Reminder',
        'Time to take Paracetamol (Test) — 1 tablet'
      )
      setActiveAlarm({ medication: testMed, type: 'due' })
      setIsTestPending(false)
    }, 5000)
  }

  return (
    <div className="space-y-6">
      {/* PWA Install Banner */}
      <PWAInstallPrompt />

      {/* Medication Reminder System Status Indicator Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Medication Reminder System Status
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              {permissionState === 'granted' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  🟢 Notifications enabled
                </span>
              )}
              {permissionState === 'default' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  🟡 Notifications permission required
                </span>
              )}
              {permissionState === 'denied' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                  🔴 Notifications blocked
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          {permissionState === 'default' && (
            <button
              onClick={handleRequestPermission}
              className="rounded-xl bg-[#16A34A] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow"
            >
              ENABLE NOTIFICATIONS
            </button>
          )}

          {permissionState === 'denied' && (
            <button
              onClick={() => setShowHowToEnable(!showHowToEnable)}
              className="rounded-xl bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 px-3.5 py-2 text-xs font-bold hover:bg-red-200 transition cursor-pointer"
            >
              {showHowToEnable ? 'Hide Instructions' : 'ENABLE NOTIFICATIONS'}
            </button>
          )}
        </div>
      </div>

      {/* How to enable notifications instructions if blocked */}
      {permissionState === 'denied' && showHowToEnable && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 space-y-2">
          <p className="font-bold">How to enable notifications in browser permissions:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300">
            <li>Click the <strong>Lock / Site Settings</strong> icon in your browser address bar.</li>
            <li>Locate <strong>Notifications</strong> under Site Permissions.</li>
            <li>Switch setting from <em>Block</em> to <strong>Allow</strong>.</li>
            <li>Refresh this page.</li>
          </ol>
        </div>
      )}

      {/* Browser Limitation Disclaimer Box */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 text-xs leading-relaxed">
        <span className="font-bold text-slate-900 dark:text-slate-200">ℹ️ Browser & OS Technical Scope: </span>
        Browser desktop notifications require your device to be powered on and your browser to be open or running in the background. If your computer is powered off or your mobile OS terminates browser background processes, reminders will be detected as ⚠️ <em>Missed Medication</em> as soon as you re-open SanjivniAI.
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-slate-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Safety Note: </span>
            Medication reminders help you remember medicines prescribed or recommended by your healthcare professional. SanjivniAI does not independently prescribe medication.
          </div>
        </div>
      </div>

      {/* Header & Controls */}
      <Card hover={false} className="dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-[#16A34A] dark:bg-emerald-950/50">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Patient Care</p>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                💊 Medication Reminders
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dev Test Reminder Button */}
            <button
              onClick={handleTestReminder}
              disabled={isTestPending}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              title="Triggers a test medication alarm in 5 seconds"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {isTestPending ? 'Triggering in 5s...' : 'TEST REMINDER'}
            </button>

            <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <button
                onClick={() => setFilter('today')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  filter === 'today'
                    ? 'bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Today's ({todayMedications.length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                All Reminders ({medications.length})
              </button>
            </div>

            <Button onClick={handleOpenAdd} className="gap-2 bg-[#16A34A] hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4" /> Add Medication
            </Button>
          </div>
        </div>

        {/* VIEW: TODAY'S MEDICINES */}
        {filter === 'today' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#16A34A]" /> Today's Medicines
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {todayMedications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                <Pill className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No medicines scheduled for today
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Click "+ Add Medication" to create your reminder schedule.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todayMedications.map((med) => {
                  const status = calculateMedicationStatus(med, todayStr, logs)

                  return (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70 flex flex-col justify-between"
                    >
                      <div>
                        {/* Time & Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg">
                            {med.time}
                          </span>
                          <div>
                            {status === 'taken' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                🟢 Taken
                              </span>
                            )}
                            {status === 'skipped' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                ⚪ Skipped
                              </span>
                            )}
                            {status === 'missed' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                🔴 Missed
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                🟡 Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Medicine details */}
                        <div className="mt-3">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            💊 {med.medicineName}
                          </h4>
                          {med.dosage && (
                            <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {med.dosage}
                            </p>
                          )}
                          {med.notes && (
                            <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                              "{med.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        {status === 'taken' ? (
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="h-4 w-4" /> Marked as Taken
                          </div>
                        ) : status === 'skipped' ? (
                          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <X className="h-4 w-4" /> Marked as Skipped
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => handleMarkTaken(med)}
                              className="flex-1 rounded-xl bg-[#16A34A] py-2 px-3 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer text-center"
                            >
                              TAKEN
                            </button>
                            <button
                              onClick={() => handleMarkSkipped(med)}
                              className="flex-1 rounded-xl bg-slate-200 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer text-center"
                            >
                              SKIP
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ALL REMINDERS */}
        {filter === 'all' && (
          <div className="mt-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
              <Pill className="h-4 w-4 text-[#16A34A]" /> All Saved Medication Reminders
            </h3>

            {medications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No saved medication reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className={`rounded-2xl border p-4 transition ${
                      med.active === false
                        ? 'border-slate-200 bg-slate-100/50 opacity-60 dark:border-slate-800 dark:bg-slate-950/40'
                        : 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            💊 {med.medicineName}
                          </span>
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {med.time}
                          </span>
                          {med.active === false ? (
                            <span className="rounded-md bg-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              Disabled
                            </span>
                          ) : (
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {med.dosage && <span>{med.dosage} • </span>}
                          <span>Frequency: {med.frequency}</span>
                          {med.specificDays?.length > 0 && <span> ({med.specificDays.join(', ')})</span>}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Dates: {med.startDate} to {med.endDate} {med.notes && `• "${med.notes}"`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(med)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition ${
                            med.active === false
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {med.active === false ? 'Enable' : 'Disable'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMedication(med.id)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal Form */}
      <MedicationFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingMed}
      />

      {/* Active Alarm / Reminder Modal */}
      {activeAlarm && (
        <MedicationAlarmModal
          alarmData={activeAlarm}
          onMarkTaken={handleMarkTaken}
          onMarkSkipped={handleMarkSkipped}
        />
      )}
    </div>
  )
}
