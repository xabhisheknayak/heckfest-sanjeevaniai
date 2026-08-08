import { motion } from 'framer-motion'
import { Activity, Camera, Download, HeartPulse, PlusCircle, ShieldCheck, Sparkles, Stethoscope, Pill, FileText } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SearchBar } from '../components/ui/SearchBar'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Toast } from '../components/ui/Toast'
import { SkeletonCard } from '../components/common/SkeletonCard'
import { HealthTips } from '../components/common/HealthTips'
import { RiskScoreCard } from '../components/common/RiskScoreCard'
import { AIChatAssistant } from '../components/common/AIChatAssistant'
import { EmergencyButton } from '../components/common/EmergencyButton'
import { LocationCard } from '../components/common/LocationCard'
import { SEO } from '../components/common/SEO'
import { MedicationReminderSection } from '../components/medication/MedicationReminderSection'
import { HealthScoreWidget } from '../components/medical/HealthScoreWidget'
import { HealthOverviewWidget } from '../components/medical/HealthOverviewWidget'
import { healthScoreService } from '../services/healthScoreService'
import { healthRiskService } from '../services/healthRiskService'
import { extractionService } from '../services/extractionService'
import { MedicalRecordModal } from '../components/medical/MedicalRecordModal'
import { VerificationModal } from '../components/medical/VerificationModal'

import { getNavigationForRole } from '../config/navigationConfig'

export default function DashboardPage() {
  const routerLocation = useLocation()
  const {
    profile,
    role,
    fetchAppointments,
    fetchMedicalHistory,
    createAppointment,
    createMedicalHistory,
    fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    recordMedicationLog,
    fetchMedicationLogs,
    fetchStructuredMeasurements,
    fetchBPHistory,
    fetchBloodSugarHistory,
    fetchMedicalRecords,
    uploadMedicalRecord,
    saveStructuredMeasurements,
    saveHealthScoreSnapshot,
    fetchHealthScoreHistory,
  } = useAuth()

  const navConfig = getNavigationForRole(role)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [history, setHistory] = useState([])
  const [medications, setMedications] = useState([])
  const [medLogs, setMedLogs] = useState([])
  const [scoreData, setScoreData] = useState(null)
  const [riskData, setRiskData] = useState(null)

  // Pipeline Data State
  const [structuredMetrics, setStructuredMetrics] = useState([])
  const [bpHistory, setBpHistory] = useState([])
  const [sugarHistory, setSugarHistory] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [scoreHistory, setScoreHistory] = useState([])

  // Modal Control
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [pendingVerificationMetrics, setPendingVerificationMetrics] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (routerLocation.state?.unauthorizedNotice) {
      setErrorMessage('Access Denied: Your patient account does not have authorization to access that area.')
    }
  }, [routerLocation.state])

  const loadAllData = useCallback(async () => {
    try {
      const [appointmentData, historyData, medsData, logsData, structured, bp, sugar, records, sHistory] = await Promise.all([
        fetchAppointments(),
        fetchMedicalHistory(),
        fetchMedications(),
        fetchMedicationLogs(),
        fetchStructuredMeasurements ? fetchStructuredMeasurements() : [],
        fetchBPHistory ? fetchBPHistory() : [],
        fetchBloodSugarHistory ? fetchBloodSugarHistory() : [],
        fetchMedicalRecords ? fetchMedicalRecords() : [],
        fetchHealthScoreHistory ? fetchHealthScoreHistory() : [],
      ])
      setAppointments(appointmentData || [])
      setHistory(historyData || [])
      setMedications(medsData || [])
      setMedLogs(logsData || [])
      setStructuredMetrics(structured || [])
      setBpHistory(bp || [])
      setSugarHistory(sugar || [])
      setMedicalRecords(records || [])
      setScoreHistory(sHistory || [])

      // Calculate Phase 3 Health Score & Phase 4 Health Risk
      if (healthScoreService) {
        const scoreRes = healthScoreService.calculateScore({
          structuredMetrics: structured || [],
          bpHistory: bp || [],
          sugarHistory: sugar || [],
        })
        setScoreData(scoreRes)
      }

      if (healthRiskService) {
        const riskRes = healthRiskService.evaluateRisk({
          structuredMetrics: structured || [],
          bpHistory: bp || [],
          sugarHistory: sugar || [],
        })
        setRiskData(riskRes)
      }
    } catch {
      setMessage('Unable to load your latest care data.')
    } finally {
      setLoading(false)
    }
  }, [fetchAppointments, fetchMedicalHistory, fetchMedications, fetchMedicationLogs, fetchStructuredMeasurements, fetchBPHistory, fetchBloodSugarHistory, fetchMedicalRecords, fetchHealthScoreHistory])

  // Save Medical Record & Extract Metrics
  const handleSaveMedicalRecord = async (recordMeta, file) => {
    setSubmitting(true)
    try {
      const savedDoc = await uploadMedicalRecord(recordMeta, file)
      setMessage('Medical record saved successfully!')

      // Extract structured health parameters from report
      const extracted = await extractionService.extractReportMetrics(
        { ...recordMeta, id: savedDoc?.id || savedDoc?._id },
        file
      )

      if (extracted && extracted.length > 0) {
        setPendingVerificationMetrics(extracted)
      }

      await loadAllData()
    } catch (err) {
      setErrorMessage('Failed to upload medical record.')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Save Verified Health Measurements & Snapshot Score
  const handleSaveVerifiedMetrics = async (verifiedItems) => {
    try {
      await saveStructuredMeasurements(verifiedItems)

      // Recalculate & Snapshot Score
      const updatedScore = healthScoreService.calculateScore({
        structuredMetrics: [...structuredMetrics, ...verifiedItems],
        bpHistory,
        sugarHistory,
      })
      if (saveHealthScoreSnapshot) {
        await saveHealthScoreSnapshot(updatedScore)
      }

      setMessage('Verified health data saved and Health Score recalculated!')
      setPendingVerificationMetrics(null)
      await loadAllData()
    } catch (err) {
      setErrorMessage('Failed to save verified measurements.')
    }
  }

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const handleAddMedication = async (medData) => {
    try {
      await createMedication(medData)
      setMessage(`Reminder created for ${medData.medicineName}.`)
      await loadAllData()
    } catch (err) {
      setErrorMessage('Failed to add medication.')
    }
  }

  const handleUpdateMedication = async (medId, updates) => {
    try {
      await updateMedication(medId, updates)
      setMessage('Medication updated.')
      await loadAllData()
    } catch (err) {
      setErrorMessage('Failed to update medication.')
    }
  }

  const handleDeleteMedication = async (medId) => {
    try {
      await deleteMedication(medId)
      setMessage('Medication deleted.')
      await loadAllData()
    } catch (err) {
      setErrorMessage('Failed to delete medication.')
    }
  }

  const handleRecordLog = async (logData) => {
    try {
      await recordMedicationLog(logData)
      setMessage(`Marked ${logData.medicineName} as ${logData.status}.`)
      await loadAllData()
    } catch (err) {
      setErrorMessage('Failed to record log.')
    }
  }

  const handleCreateDemoData = async () => {
    try {
      await createAppointment({ title: 'Follow-up checkup', time: 'Next Tuesday • 10:30 AM', doctor: 'Dr. Nair' })
      await createMedicalHistory({ title: 'Wellness note', detail: 'Hydration and sleep trend improved this week.' })
      const [appointmentData, historyData] = await Promise.all([fetchAppointments(), fetchMedicalHistory()])
      setAppointments(appointmentData)
      setHistory(historyData)
      setMessage('Your latest care records were saved.')
    } catch {
      setMessage('Unable to save new care data right now.')
    }
  }

  const handleExportHistory = () => {
    const content = [
      'SanjivniAI Medical Summary',
      `Patient: ${profile?.name || 'Guest'}`,
      '---',
      ...history.map((item) => `• ${item.title}: ${item.detail}`),
      '---',
      ...appointments.map((item) => `• ${item.title}: ${item.time} • ${item.doctor || 'Care team'}`),
    ].join('\n')

    const printWindow = window.open('', '_blank', 'width=900,height=800')
    if (!printWindow) {
      setMessage('Your browser blocked the export window.')
      return
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Medical History</title><style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.6}</style></head><body><pre>${content}</pre></body></html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    setMessage('PDF export dialog opened for your medical summary.')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <SEO title="SanjivniAI | Care dashboard" description="Track appointments, reports, wellness insights, and care plans in one place." />
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-0">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">{navConfig.roleLabel}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{navConfig.greetingTitle(profile?.name)}</h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{navConfig.greetingSubtitle}</p>
            </div>
            <SearchBar placeholder="Search reports or doctors" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <HealthOverviewWidget 
              scoreData={scoreData} 
              riskData={riskData} 
              onAddRecordClick={() => setIsRecordModalOpen(true)}
              bpHistory={bpHistory}
              sugarHistory={sugarHistory}
              structuredMetrics={structuredMetrics}
              medicalRecords={medicalRecords}
              scoreHistory={scoreHistory}
            />

            <Card hover={true} className="flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Quick actions</p>
                <div className="mt-4 space-y-3">
                  <Link to="/medication-reminders"><Button className="w-full justify-start gap-2 bg-[#16A34A] hover:bg-emerald-700 text-white"><Pill className="h-4 w-4" /> Medication Reminders</Button></Link>
                  <Link to="/symptom-checker"><Button variant="secondary" className="w-full justify-start gap-2"><HeartPulse className="h-4 w-4" /> Symptom checker</Button></Link>
                  <Link to="/image-analysis"><Button variant="secondary" className="w-full justify-start gap-2"><Camera className="h-4 w-4" /> Image analysis</Button></Link>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                {appointments[0] ? `${appointments[0].title} • ${appointments[0].time}` : 'Next appointment • Ask your care team to schedule one'}
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <MedicationReminderSection
              medications={medications}
              logs={medLogs}
              onAddMedication={handleAddMedication}
              onUpdateMedication={handleUpdateMedication}
              onDeleteMedication={handleDeleteMedication}
              onRecordLog={handleRecordLog}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card hover={true} className="dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Recent reports</p>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Latest health insights</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => setIsRecordModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-3 py-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" /> [ + Upload PDF Report ]
                  </Button>
                  <Button variant="secondary" onClick={handleExportHistory} className="gap-1 text-xs py-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
                  <Link to="/medical-history"><Button variant="ghost" className="text-xs py-1.5">View all</Button></Link>
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="space-y-3">
                  {(medicalRecords.length > 0 ? medicalRecords.slice(0, 4) : [
                    { id: 'demo-1', recordName: 'Routine Blood Panel (PDF)', recordDate: '2026-08-08', recordType: 'blood_report', doctorName: 'Dr. Nair', mimeType: 'application/pdf' },
                    { id: 'demo-2', recordName: 'Cardiology BP Summary', recordDate: '2026-08-05', recordType: 'blood_pressure', doctorName: 'Dr. Mehta', mimeType: 'application/pdf' }
                  ]).map((item) => (
                    <div key={item.id || item.recordName} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.recordName}</p>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                              {item.mimeType === 'application/pdf' || String(item.recordName).toLowerCase().includes('pdf') ? 'PDF' : 'REPORT'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {item.recordDate ? String(item.recordDate).split('T')[0] : 'Recent'} • {item.doctorName || 'Practitioner'} {item.hospitalName ? `(${item.hospitalName})` : ''}
                          </p>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Structured & Calculated
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card hover={true} className="dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Appointments</p>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Your upcoming care</h2>
                </div>
                <Link to="/appointments"><Button variant="ghost">Book</Button></Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="space-y-3">
                  {(appointments.length ? appointments : [{ title: 'Cardiology follow-up', time: 'Tomorrow • 10:00 AM', doctor: 'Dr. Nair' }]).map((appt) => (
                    <div key={appt.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{appt.title}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{appt.time}</p>
                        </div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{appt.doctor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <RiskScoreCard />
              <HealthTips />
            </div>
            <div className="space-y-6">
              <AIChatAssistant />
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card hover={true} className="dark:border-slate-800 dark:bg-slate-900/80">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Latest activity</p>
              <div className="mt-4 space-y-4">
                {[
                  { text: 'Medication reminder completed', time: '8 mins ago' },
                  { text: 'Doctor note shared', time: '2 hours ago' },
                ].map((activity) => (
                  <div key={activity.text} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Activity className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.text}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card hover={true} className="dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Care plan</p>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Daily wellness targets</h2>
                </div>
                <Button variant="secondary" onClick={handleCreateDemoData}>Save snapshot</Button>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Sparkles, label: 'Hydration', value: '8 glasses' },
                  { icon: Stethoscope, label: 'Movement', value: '20 mins' },
                  { icon: PlusCircle, label: 'Sleep', value: '7.5 hrs' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
                    <item.icon className="mx-auto h-5 w-5 text-[#16A34A]" />
                    <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <LocationCard />
          </div>

          {message && <div className="mt-6"><Toast title="Update" message={message} tone="success" /></div>}
          {errorMessage && <div className="mt-6"><Toast title="Access Notice" message={errorMessage} tone="warning" /></div>}

          <MedicalRecordModal
            open={isRecordModalOpen}
            onClose={() => setIsRecordModalOpen(false)}
            onSubmit={handleSaveMedicalRecord}
            submitting={submitting}
          />

          <VerificationModal
            open={Boolean(pendingVerificationMetrics)}
            onClose={() => setPendingVerificationMetrics(null)}
            metrics={pendingVerificationMetrics || []}
            onSaveVerified={handleSaveVerifiedMetrics}
          />
        </main>
      </div>
      <EmergencyButton />
    </div>
  )
}
