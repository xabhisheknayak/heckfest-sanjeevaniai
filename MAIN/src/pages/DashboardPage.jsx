import { motion } from 'framer-motion'
import { Activity, Camera, Download, HeartPulse, PlusCircle, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SearchBar } from '../components/ui/SearchBar'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Toast } from '../components/ui/Toast'
import { SkeletonCard } from '../components/common/SkeletonCard'
import { HealthTips } from '../components/common/HealthTips'
import { RiskScoreCard } from '../components/common/RiskScoreCard'
import { AIChatAssistant } from '../components/common/AIChatAssistant'
import { EmergencyButton } from '../components/common/EmergencyButton'
import { SEO } from '../components/common/SEO'

export default function DashboardPage() {
  const { profile, fetchAppointments, fetchMedicalHistory, createAppointment, createMedicalHistory } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [appointmentData, historyData] = await Promise.all([fetchAppointments(), fetchMedicalHistory()])
        setAppointments(appointmentData)
        setHistory(historyData)
      } catch {
        setMessage('Unable to load your latest care data.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [fetchAppointments, fetchMedicalHistory])

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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Care overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Welcome back, {profile?.name || 'there'}</h1>
              {profile?.email && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{profile.email} • Role: {profile.role || 'patient'}</p>}
            </div>
            <SearchBar placeholder="Search reports or doctors" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-[#16A34A] to-[#0F172A] p-6 text-white dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-emerald-100">Health score</p>
                    <p className="mt-2 text-4xl font-semibold">87</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-3"><ShieldCheck className="h-6 w-6" /></div>
                </div>
                <p className="mt-6 max-w-xl text-sm leading-7 text-emerald-50">Your trends look stable this week. Keep your hydration and sleep routine consistent for the best recovery outcome.</p>
              </Card>
            </motion.div>

            <Card hover={true} className="flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Quick actions</p>
                <div className="mt-4 space-y-3">
                  <Link to="/symptom-checker"><Button className="w-full justify-start gap-2"><HeartPulse className="h-4 w-4" /> Symptom checker</Button></Link>
                  <Link to="/image-analysis"><Button variant="secondary" className="w-full justify-start gap-2"><Camera className="h-4 w-4" /> Image analysis</Button></Link>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                {appointments[0] ? `${appointments[0].title} • ${appointments[0].time}` : 'Next appointment • Ask your care team to schedule one'}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card hover={true} className="dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Recent reports</p>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Latest health insights</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={handleExportHistory} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
                  <Button variant="ghost">View all</Button>
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="space-y-3">
                  {(history.length ? history : [{ title: 'Routine blood panel', detail: 'Completed 2 days ago • Normal range', tone: 'success' }, { title: 'ECG summary', detail: 'Reviewed by care team • Stable', tone: 'info' }]).map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.detail}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'}`}>{item.tone === 'success' ? 'Stable' : 'Reviewed'}</span>
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
                <Button variant="ghost">Book</Button>
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

          {message && <div className="mt-6"><Toast title="Update" message={message} tone="success" /></div>}
        </main>
      </div>
      <EmergencyButton />
    </div>
  )
}
