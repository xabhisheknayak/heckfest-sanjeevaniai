import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { MedicationReminderSection } from '../components/medication/MedicationReminderSection'
import { MedicationHistorySection } from '../components/medication/MedicationHistorySection'
import { SEO } from '../components/common/SEO'
import { Toast } from '../components/ui/Toast'
import { SkeletonCard } from '../components/common/SkeletonCard'
import { EmergencyButton } from '../components/common/EmergencyButton'
import { useAuth } from '../hooks/useAuth'
import { getNavigationForRole } from '../config/navigationConfig'

export default function MedicationRemindersPage() {
  const {
    role,
    profile,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    recordMedicationLog,
    fetchMedicationLogs,
  } = useAuth()

  const navConfig = getNavigationForRole(role)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [medications, setMedications] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState('reminders') // 'reminders' | 'history'

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [medsData, logsData] = await Promise.all([fetchMedications(), fetchMedicationLogs()])
      setMedications(medsData || [])
      setLogs(logsData || [])
    } catch (err) {
      setErrorMessage('Unable to load medication records.')
    } finally {
      setLoading(false)
    }
  }, [fetchMedications, fetchMedicationLogs])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddMedication = async (medData) => {
    try {
      await createMedication(medData)
      setMessage(`Reminder created for ${medData.medicineName}.`)
      await loadData()
    } catch (err) {
      setErrorMessage('Failed to add medication.')
    }
  }

  const handleUpdateMedication = async (medId, updates) => {
    try {
      await updateMedication(medId, updates)
      setMessage('Medication updated successfully.')
      await loadData()
    } catch (err) {
      setErrorMessage('Failed to update medication.')
    }
  }

  const handleDeleteMedication = async (medId) => {
    try {
      await deleteMedication(medId)
      setMessage('Medication deleted.')
      await loadData()
    } catch (err) {
      setErrorMessage('Failed to delete medication.')
    }
  }

  const handleRecordLog = async (logData) => {
    try {
      await recordMedicationLog(logData)
      setMessage(`Marked ${logData.medicineName} as ${logData.status}.`)
      await loadData()
    } catch (err) {
      setErrorMessage('Failed to update medication status.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SEO
        title="Medication Reminders | SanjivniAI"
        description="Schedule, track, and log daily medication reminders and dosage history."
      />
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-0">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
                {navConfig.roleLabel}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
                💊 Medication Reminders
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Track prescribed medicines, custom schedules, and dosage completion history.
              </p>
            </div>

            {/* Navigation tabs */}
            <div className="flex rounded-2xl border border-slate-200 p-1.5 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={() => setActiveTab('reminders')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'reminders'
                    ? 'bg-[#16A34A] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Today & Schedules
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'history'
                    ? 'bg-[#16A34A] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Medication History ({logs.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {activeTab === 'reminders' ? (
                <MedicationReminderSection
                  medications={medications}
                  logs={logs}
                  onAddMedication={handleAddMedication}
                  onUpdateMedication={handleUpdateMedication}
                  onDeleteMedication={handleDeleteMedication}
                  onRecordLog={handleRecordLog}
                />
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <MedicationHistorySection logs={logs} />
                </div>
              )}
            </motion.div>
          )}

          {message && (
            <div className="mt-6">
              <Toast title="Success" message={message} tone="success" onClose={() => setMessage('')} />
            </div>
          )}
          {errorMessage && (
            <div className="mt-6">
              <Toast title="Notice" message={errorMessage} tone="warning" onClose={() => setErrorMessage('')} />
            </div>
          )}
        </main>
      </div>
      <EmergencyButton />
    </div>
  )
}
