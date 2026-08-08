import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, CheckCircle2, Clock, FileText, ShieldCheck, Stethoscope, User, Users, Video, Bot, Sparkles, AlertCircle, RefreshCw, X, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { analyzePatientSummary, generatePrescriptionDraft } from '../lib/gemini'

import { DoctorAIAssistant } from '../components/common/DoctorAIAssistant'

export default function DoctorDashboardPage() {
  const routerLocation = useLocation()
  const { profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [errorNotice, setErrorNotice] = useState('')
  const [showDoctorAIAssistant, setShowDoctorAIAssistant] = useState(false)

  // AI Loading & Result States
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDailySummary, setAiDailySummary] = useState(null)
  const [aiDailyError, setAiDailyError] = useState(null)
  const [activePatientSummary, setActivePatientSummary] = useState(null)
  const [activePatientError, setActivePatientError] = useState(null)
  const [selectedPatientModal, setSelectedPatientModal] = useState(null)

  // Prescription Draft Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: 'Asha Patel',
    diagnosis: 'Acute Tension Headache / Stress Migraine',
    medication: 'Paracetamol 500mg',
    dosage: '1 tablet twice daily after meals',
    duration: '5 days',
    doctorNotes: 'Maintain hydration, avoid caffeine, and rest in dim room.'
  })
  const [prescriptionSaved, setPrescriptionSaved] = useState(false)

  useEffect(() => {
    if (routerLocation.state?.unauthorizedNotice) {
      setErrorNotice(routerLocation.state.message || 'Access Denied: Your account does not have permission to access that area.')
    }
  }, [routerLocation.state])

  const doctorName = profile?.name || 'Dr. Ananya Mehta'
  const doctorSpec = profile?.specialization || 'Cardiology & General Practice'
  const licenseNum = profile?.licenseNumber || 'MED-IND-88901'

  const todayAppointments = [
    { id: 'app-1', patient: 'Asha Patel', age: 34, time: '09:30 AM', type: 'Follow-up Consultation', status: 'Confirmed', severity: 'low', symptoms: 'Episodic frontal headache, fatigue' },
    { id: 'app-2', patient: 'Rajesh Sharma', age: 52, time: '11:00 AM', type: 'ECG & Chest Pain Review', status: 'Pending Review', severity: 'high', symptoms: 'Substernal pressure, shortness of breath on climbing stairs' },
    { id: 'app-3', patient: 'Priya Nair', age: 29, time: '02:15 PM', type: 'Symptom Triage Check', status: 'Confirmed', severity: 'medium', symptoms: 'Low grade fever (100.2°F), dry cough' },
    { id: 'app-4', patient: 'Vikram Singh', age: 61, time: '04:00 PM', type: 'Hypertension Review', status: 'Confirmed', severity: 'low', symptoms: 'BP log review (135/88 mmHg)' }
  ]

  const recentPatients = [
    { name: 'Asha Patel', id: 'P-1029', lastVisit: 'Yesterday', condition: 'Migraine Triage', status: 'Stable', history: '2024: Tension Headache • 2025: Routine GP Check • 2026: Migraine Intake' },
    { name: 'Rajesh Sharma', id: 'P-1044', lastVisit: '2 days ago', condition: 'Angina Assessment', status: 'Under Review', history: '2024: Mild Lipid Elevation • 2025: Stress ECG • 2026: Exertional Discomfort' },
    { name: 'Priya Nair', id: 'P-1088', lastVisit: '3 days ago', condition: 'Viral Fever', status: 'Recovered', history: '2025: Seasonal Allergy • 2026: Upper Respiratory Triage' }
  ]

  // Generate Live AI Daily Summary from actual queue data
  const handleGenerateDailySummary = async () => {
    setAiLoading(true)
    setAiDailyError(null)
    try {
      if (!todayAppointments || todayAppointments.length === 0) {
        setAiDailySummary({
          summary: 'No sufficient data is available for AI analysis.',
          disclaimer: 'AI-generated assistance — verify before making clinical decisions.'
        })
        return
      }

      const summaryRes = await analyzePatientSummary('Today Schedule', `${todayAppointments.length} appointments`, 'Daily Triage Queue')
      setAiDailySummary({
        summary: summaryRes.clinicalSummary || `You have ${todayAppointments.length} appointments scheduled today. High-urgency chest pain review requires immediate attention (Rajesh Sharma).`,
        disclaimer: summaryRes.disclaimer || 'AI-generated assistance — verify before making clinical decisions.'
      })
    } catch (err) {
      setAiDailyError(err.message || '⚠️ AI service is temporarily unavailable.')
    } finally {
      setAiLoading(false)
    }
  }

  // Trigger AI Patient Summary Modal
  const handleReviewPatientSummary = async (patient) => {
    setSelectedPatientModal(patient)
    setAiLoading(true)
    setActivePatientError(null)
    try {
      const summaryData = await analyzePatientSummary(patient.name, patient.condition, patient.history)
      setActivePatientSummary(summaryData)
    } catch (err) {
      setActivePatientError(err.message || '⚠️ AI service is temporarily unavailable.')
    } finally {
      setAiLoading(false)
    }
  }

  // Generate Prescription Draft
  const handleGeneratePrescriptionDraft = async () => {
    setAiLoading(true)
    try {
      const draftData = await generatePrescriptionDraft(prescriptionForm.diagnosis, { name: prescriptionForm.patientName })
      setPrescriptionForm(prev => ({
        ...prev,
        medication: draftData.suggestedMedication || prev.medication,
        dosage: draftData.suggestedDosage || prev.dosage,
        duration: draftData.suggestedFrequency || prev.duration
      }))
    } catch {
      // Fallback
    } finally {
      setAiLoading(false)
    }
  }

  const handleSavePrescription = () => {
    setPrescriptionSaved(true)
    setTimeout(() => {
      setPrescriptionSaved(false)
      setShowPrescriptionModal(false)
      setMessage(`Prescription reviewed and authorized by Dr. ${doctorName}.`)
      setTimeout(() => setMessage(''), 3000)
    }, 1500)
  }

  const handleActionClick = (actionName) => {
    setMessage(`${actionName} initiated successfully.`)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-950 dark:bg-emerald-950/40">
              <div className="flex items-center gap-4">
                <div className="rounded-3xl bg-emerald-600 p-4 text-white shadow-lg">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good morning, Dr. {profile?.name || 'Ananya Mehta'}</h1>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      Verified Practitioner
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {doctorSpec} • License: <code className="font-mono">{licenseNum}</code>
                  </p>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowDoctorAIAssistant(true)} className="gap-2 text-xs py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white">
                  <Bot className="h-4 w-4" /> 🤖 Doctor AI Assistant
                </Button>
                <Button variant="secondary" onClick={() => setShowPrescriptionModal(true)} className="gap-2 text-xs py-2.5">
                  <FileText className="h-4 w-4" /> 🤖 AI Prescription Draft
                </Button>
              </div>
            </div>
          </motion.div>

          {/* 🤖 AI DAILY SUMMARY CARD */}
          <Card className="p-6 mb-8 border-emerald-300 bg-gradient-to-br from-emerald-50/90 to-slate-50 dark:border-emerald-900 dark:from-emerald-950/40 dark:to-slate-900/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🤖 AI Daily Summary
                  </h2>
                  <p className="text-xs text-slate-500">Automated morning clinical briefing from today's active schedule</p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleGenerateDailySummary}
                disabled={aiLoading}
                className="text-xs gap-2 py-2"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    🤖 AI is analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Generate Briefing
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4">
              {aiDailyError ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs dark:border-red-900 dark:bg-red-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="font-semibold text-red-800 dark:text-red-300">{aiDailyError}</span>
                  <Button variant="secondary" onClick={handleGenerateDailySummary} className="text-xs py-1.5 px-3 shrink-0">
                    [ Try Again ]
                  </Button>
                </div>
              ) : aiDailySummary ? (
                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {aiDailySummary.summary}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" />
                    {aiDailySummary.disclaimer}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Click "Generate Briefing" to synthesize today's appointment queue and high-urgency triage alerts.
                </p>
              )}
            </div>
          </Card>

          {/* Clinical Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Appointments</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">4</p>
                </div>
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-950/50">
                  <CalendarDays className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">2 Consultations completed</p>
            </Card>

            <Card className="p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Assigned Patients</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">48</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-semibold">+6 new patient registrations this week</p>
            </Card>

            <Card className="p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Triage Reviews</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">3</p>
                </div>
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-950/50">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 font-semibold">1 Urgent chest pain case</p>
            </Card>

            <Card className="p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Consultation Rating</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">4.9 ★</p>
                </div>
                <div className="rounded-2xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-950/50">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-3 font-semibold">142 verified reviews</p>
            </Card>
          </div>

          {/* Main Doctor Dashboard Grid */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Left: Schedule & Appointment AI Previews */}
            <div className="space-y-6">
              <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Appointment Queue</h2>
                    <p className="text-xs text-slate-500">Real-time clinical consultation schedule with AI Appointment Previews</p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {todayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className={`rounded-2xl border p-4 transition space-y-3 ${
                        app.severity === 'high'
                          ? 'border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/30'
                          : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-slate-100">{app.patient}</p>
                              <span className="text-xs text-slate-500">({app.age} yrs)</span>
                              {app.severity === 'high' && (
                                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                                  High Urgency
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{app.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            {app.time}
                          </span>
                          <button
                            onClick={() => handleActionClick(`Consultation with ${app.patient}`)}
                            className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            Start Call
                          </button>
                        </div>
                      </div>

                      {/* 🤖 AI APPOINTMENT PREVIEW WIDGET */}
                      <div className="rounded-xl bg-white p-3 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          🤖 AI Appointment Preview & Suggested Questions:
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          Reported Intake: "{app.symptoms}"
                        </p>
                        <div className="pl-3 border-l-2 border-emerald-500 text-slate-600 dark:text-slate-300 space-y-0.5">
                          <p>1. When did the symptoms begin and how did they progress?</p>
                          <p>2. Has the condition changed or flared recently?</p>
                          <p>3. Are you currently taking any OTC or prescribed medications?</p>
                        </div>
                        <p className="mt-2 text-[10px] font-semibold text-slate-400 italic">
                          AI-generated assistance — verify before making clinical decisions.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Doctor Quick Actions Grid */}
              <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Doctor Clinical Quick Actions</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => handleActionClick('Appointments Directory')}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="rounded-xl bg-sky-100 p-2.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">View Appointments</p>
                      <p className="text-[11px] text-slate-500">Manage patient booking requests</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleActionClick('Patient Registry')}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">View Patients</p>
                      <p className="text-[11px] text-slate-500">Access authorized health records</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleActionClick('Telehealth Virtual Room')}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Start Consultation</p>
                      <p className="text-[11px] text-slate-500">Launch secure video room</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowPrescriptionModal(true)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Write Prescription</p>
                      <p className="text-[11px] text-slate-500">🤖 AI Prescription Draft Assistant</p>
                    </div>
                  </button>
                </div>
              </Card>
            </div>

            {/* Right: Authorized Patient Registry & AI Patient Summaries */}
            <div className="space-y-6">
              <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Authorized Patient Registry</h2>
                  <span className="text-xs font-semibold text-slate-500">HIPAA Compliant</span>
                </div>

                <div className="mt-4 space-y-3">
                  {recentPatients.map((pt) => (
                    <div key={pt.id} className="rounded-2xl border border-slate-200 p-3.5 text-sm dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{pt.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">ID: {pt.id} • {pt.condition}</p>
                        </div>
                        <button
                          onClick={() => handleReviewPatientSummary(pt)}
                          className="rounded-xl border border-emerald-600 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                        >
                          [ Review Summary ]
                        </button>
                      </div>

                      {/* AI Medical History Timeline Preview */}
                      <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950 text-xs">
                        <p className="font-bold text-slate-600 dark:text-slate-400 mb-1">
                          🤖 SUMMARIZE HISTORY (Timeline):
                        </p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          {pt.history}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Doctor Security & Privacy Box */}
              <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-2">
                  <ShieldCheck className="h-5 w-5" /> HIPAA Clinical Scope & Safety
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Doctor access is restricted to authorized patient consultation records. Every AI output is provided solely as clinical decision support. The attending physician must independently review, verify, and approve all diagnoses and prescription drafts.
                </p>
              </Card>
            </div>
          </div>

          {/* AI PATIENT SUMMARY MODAL */}
          <AnimatePresence>
            {selectedPatientModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg">
                  <Card className="p-6 border-emerald-300 dark:border-emerald-800 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          🤖 AI Patient Summary — {selectedPatientModal.name}
                        </h3>
                      </div>
                      <button onClick={() => setSelectedPatientModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="my-4 space-y-3 text-xs">
                      {aiLoading ? (
                        <div className="py-8 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" /> 🤖 AI is analyzing patient records...
                        </div>
                      ) : activePatientError ? (
                        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs dark:border-red-900 dark:bg-red-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="font-semibold text-red-800 dark:text-red-300">{activePatientError}</span>
                          <Button variant="secondary" onClick={() => handleReviewPatientSummary(selectedPatientModal)} className="text-xs py-1.5 px-3 shrink-0">
                            [ Try Again ]
                          </Button>
                        </div>
                      ) : (
                        activePatientSummary && (
                          <>
                            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border">
                              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Intake Briefing:</p>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {activePatientSummary.clinicalSummary}
                              </p>
                            </div>

                            {activePatientSummary.keyRiskIndicators && (
                              <div className="rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                                <p className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">Key Risk & Monitoring Indicators:</p>
                                <ul className="list-disc pl-4 text-emerald-800 dark:text-emerald-400 space-y-0.5">
                                  {activePatientSummary.keyRiskIndicators.map((risk, i) => (
                                    <li key={i}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <p className="text-[11px] font-semibold text-slate-400 italic">
                              AI-generated assistance — verify before making clinical decisions.
                            </p>
                          </>
                        )
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button variant="secondary" onClick={() => setSelectedPatientModal(null)} className="text-xs">
                        Close Summary
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* AI PRESCRIPTION DRAFT MODAL */}
          <AnimatePresence>
            {showPrescriptionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl">
                  <Card className="p-6 border-amber-300 dark:border-amber-900 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-600" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          🤖 AI Prescription Draft Assistant
                        </h3>
                      </div>
                      <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* MANDATORY WARNING BANNER */}
                    <div className="my-4 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                      <AlertCircle className="h-4 w-4 inline mr-1 text-amber-600" />
                      <strong>AI-generated draft — Doctor review required.</strong> AI must NEVER directly prescribe medication. Review, edit, and sign before authorizing.
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                          value={prescriptionForm.patientName}
                          onChange={e => setPrescriptionForm({ ...prescriptionForm, patientName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                          value={prescriptionForm.diagnosis}
                          onChange={e => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prescribed Medication</label>
                          <input
                            type="text"
                            className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                            value={prescriptionForm.medication}
                            onChange={e => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage & Schedule</label>
                          <input
                            type="text"
                            className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                            value={prescriptionForm.dosage}
                            onChange={e => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physician Clinical Instructions</label>
                        <textarea
                          rows={2}
                          className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                          value={prescriptionForm.doctorNotes}
                          onChange={e => setPrescriptionForm({ ...prescriptionForm, doctorNotes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t pt-4 dark:border-slate-800">
                      <Button
                        variant="secondary"
                        onClick={handleGeneratePrescriptionDraft}
                        disabled={aiLoading}
                        className="text-xs py-2 gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        {aiLoading ? '🤖 Generating Draft...' : 'Re-generate AI Draft'}
                      </Button>

                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setShowPrescriptionModal(false)} className="text-xs py-2">
                          Cancel
                        </Button>
                        <Button onClick={handleSavePrescription} disabled={prescriptionSaved} className="text-xs py-2 gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                          {prescriptionSaved ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Saved & Authorized!
                            </>
                          ) : (
                            'Approve & Save Prescription'
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {(message || errorNotice) && (
            <div className="mt-6">
              <Toast title="Doctor Portal Notice" message={message || errorNotice} tone={message ? 'success' : 'warning'} />
            </div>
          )}

          <DoctorAIAssistant
            open={showDoctorAIAssistant}
            onClose={() => setShowDoctorAIAssistant(false)}
            selectedPatient={selectedPatientModal}
          />
        </main>
      </div>
    </div>
  )
}
