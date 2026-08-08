import { motion } from 'framer-motion'
import { 
<<<<<<< HEAD
  ClipboardList, HeartPulse, Brain, CalendarDays, Search, 
  Plus, User, Activity, Stethoscope, Database, 
  Trash2, Edit3, Clock, Phone, Droplet, Weight, Ruler, ChevronRight
=======
  ClipboardList, HeartPulse, Brain, CalendarDays, Camera, FileText, Search, 
  Plus, User, Activity, Stethoscope, AlertTriangle, ShieldCheck, Database, 
  Trash2, Edit3, CheckCircle2, Clock, MapPin, Phone, Droplet, Weight, Ruler, ChevronRight
>>>>>>> 10b16c0bf174bcc9b6c1219facfcb3d40d032b00
} from 'lucide-react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Toast } from '../components/ui/Toast'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { Skeleton } from '../components/ui/Skeleton'
import { mongoService } from '../services/mongoService'

export default function MedicalHistoryPage() {
  const { 
    user,
    fetchMedicalHistory, 
    fetchAppointments,
    fetchHealthRecords,
    fetchImageAnalyses,
    fetchReports
  } = useAuth()

  // State Management
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'illness', 'consultations', 'vitals', 'timeline'
  const [dbStatus, setDbStatus] = useState({ status: 'checking', mongoConnected: false })

  // Data from MongoDB / Backend API
  const [clientProfile, setClientProfile] = useState(null)
  const [illnessHistory, setIllnessHistory] = useState([])
  const [doctorConsultations, setDoctorConsultations] = useState([])
  const [vitalsHistory, setVitalsHistory] = useState([])
  const [generalTimeline, setGeneralTimeline] = useState([])

  // Toast notification state
  const [message, setMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Control States
  const [isIllnessModalOpen, setIsIllnessModalOpen] = useState(false)
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false)
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form States for New Illness
  const [illnessForm, setIllnessForm] = useState({
    illnessName: '',
    diagnosisDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    severity: 'Moderate',
    symptomsStr: '',
    treatment: '',
    prescribedMedicationsStr: '',
    doctorNotes: ''
  })

  // Form States for New Doctor Consultation
  const [consultForm, setConsultForm] = useState({
    doctorName: '',
    specialization: '',
    clinicHospital: '',
    consultationDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    diagnosis: '',
    prescriptionsStr: '',
    followUpDate: '',
    consultationFee: '$50',
    notes: ''
  })

  // Form States for New Vitals Record
  const [vitalsForm, setVitalsForm] = useState({
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 72,
    bloodSugar: 95,
    spo2: 98,
    bmi: 23.0,
    temperatureF: 98.6,
    notes: 'Routine self-check.'
  })

  // Form States for Client Profile
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    age: 30,
    gender: 'Male',
    bloodGroup: 'O+',
    heightCm: 172,
    weightKg: 68,
    phone: '',
    emergencyContact: '',
    allergiesStr: '',
    chronicConditionsStr: ''
  })

  const userId = user?.uid || 'demo-user-123'

  // Load All Data from MongoDB / API
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Check DB health status
      const statusRes = await mongoService.getHealthStatus()
      setDbStatus(statusRes)

      // 2. Fetch Client Full History from MongoDB API
      const fullHistory = await mongoService.getFullHistory(userId)
      if (fullHistory) {
        setClientProfile(fullHistory.client)
        setIllnessHistory(fullHistory.illnessHistory || [])
        setDoctorConsultations(fullHistory.doctorConsultationHistory || [])
        setVitalsHistory(fullHistory.healthVitals || [])

        // Fill profile edit form defaults
        if (fullHistory.client) {
          setProfileForm({
            fullName: fullHistory.client.fullName || '',
            age: fullHistory.client.age || 30,
            gender: fullHistory.client.gender || 'Male',
            bloodGroup: fullHistory.client.bloodGroup || 'O+',
            heightCm: fullHistory.client.heightCm || 172,
            weightKg: fullHistory.client.weightKg || 68,
            phone: fullHistory.client.phone || '',
            emergencyContact: fullHistory.client.emergencyContact || '',
            allergiesStr: (fullHistory.client.allergies || []).join(', '),
            chronicConditionsStr: (fullHistory.client.chronicConditions || []).join(', ')
          })
        }
      }

      // 3. Fetch app records (symptoms, appointments, AI image scans, etc.)
<<<<<<< HEAD
      const [notes, symptoms, _reports, appointments, _images] = await Promise.all([
=======
      const [notes, symptoms, reports, appointments, images] = await Promise.all([
>>>>>>> 10b16c0bf174bcc9b6c1219facfcb3d40d032b00
        fetchMedicalHistory ? fetchMedicalHistory() : [],
        fetchHealthRecords ? fetchHealthRecords() : [],
        fetchReports ? fetchReports() : [],
        fetchAppointments ? fetchAppointments() : [],
        fetchImageAnalyses ? fetchImageAnalyses() : []
      ])

      const timeline = []

      // Patient Notes
      notes.forEach((item) => {
        timeline.push({
          id: item.id || `note-${Math.random()}`,
          title: item.title,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'note',
          details: item.detail || 'Personal journal details.',
          badge: 'Patient Note',
          badgeStyle: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/50',
          icon: <ClipboardList className="h-4 w-4" />,
          iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        })
      })

      // AI Symptom Checks
      symptoms.forEach((item) => {
        timeline.push({
          id: item.id,
          title: `AI Symptom Triaging: ${item.ai_response?.recommended_specialist || 'General Care'}`,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'symptom',
          details: `Symptoms: "${item.symptoms}". Advice: ${item.ai_response?.advice?.join(' • ') || 'Monitor closely.'}`,
          badge: `Severity: ${item.severity || 'low'}`,
          badgeStyle: item.severity === 'high' 
            ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
          icon: <Brain className="h-4 w-4" />,
          iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
        })
      })

      // Appointments
      appointments.forEach((item) => {
        timeline.push({
          id: item.id,
          title: `Doctor Consultation: ${item.doctor || 'Practitioner'}`,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'appointment',
          details: `Facility: ${item.facility || 'Sanjivni Health Center'}. Time: ${item.time}. Reason: ${item.title}`,
          badge: 'Appointment',
          badgeStyle: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
          icon: <CalendarDays className="h-4 w-4" />,
          iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
        })
      })

      timeline.sort((a, b) => b.timestamp - a.timestamp)
      setGeneralTimeline(timeline)
    } catch (err) {
      console.error('Failed loading history data:', err)
      setToastType('error')
      setMessage('Failed to load health records from server.')
    } finally {
      setLoading(false)
    }
  }, [userId, fetchMedicalHistory, fetchHealthRecords, fetchReports, fetchAppointments, fetchImageAnalyses])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers for Adding & Deleting MongoDB Records

  // 1. Add Illness Record
  const handleAddIllness = async (e) => {
    e.preventDefault()
    if (!illnessForm.illnessName.trim()) {
      setToastType('warning')
      setMessage('Please enter an illness or condition name.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        userId,
        illnessName: illnessForm.illnessName,
        diagnosisDate: illnessForm.diagnosisDate,
        status: illnessForm.status,
        severity: illnessForm.severity,
        symptoms: illnessForm.symptomsStr ? illnessForm.symptomsStr.split(',').map(s => s.trim()) : [],
        treatment: illnessForm.treatment,
        prescribedMedications: illnessForm.prescribedMedicationsStr ? illnessForm.prescribedMedicationsStr.split(',').map(m => m.trim()) : [],
        doctorNotes: illnessForm.doctorNotes
      }
      await mongoService.addIllnessHistory(payload)
      setToastType('success')
      setMessage('Illness history record added to MongoDB successfully!')
      setIsIllnessModalOpen(false)
      setIllnessForm({
        illnessName: '',
        diagnosisDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        severity: 'Moderate',
        symptomsStr: '',
        treatment: '',
        prescribedMedicationsStr: '',
        doctorNotes: ''
      })
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to save illness history record.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Illness Record
  const handleDeleteIllness = async (id) => {
    try {
      await mongoService.deleteIllnessHistory(id, userId)
      setToastType('success')
      setMessage('Illness record deleted.')
      await loadData()
    } catch {
      setToastType('error')
      setMessage('Failed to delete illness record.')
    }
  }

  // 2. Add Doctor Consultation Record
  const handleAddConsultation = async (e) => {
    e.preventDefault()
    if (!consultForm.doctorName.trim() || !consultForm.diagnosis.trim()) {
      setToastType('warning')
      setMessage('Please enter Doctor Name and Diagnosis.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        userId,
        doctorName: consultForm.doctorName,
        specialization: consultForm.specialization || 'General Physician',
        clinicHospital: consultForm.clinicHospital || 'Sanjivni Health Center',
        consultationDate: consultForm.consultationDate,
        chiefComplaint: consultForm.chiefComplaint,
        diagnosis: consultForm.diagnosis,
        prescriptions: consultForm.prescriptionsStr ? consultForm.prescriptionsStr.split(',').map(p => p.trim()) : [],
        followUpDate: consultForm.followUpDate,
        consultationFee: consultForm.consultationFee,
        notes: consultForm.notes
      }
      await mongoService.addDoctorConsultation(payload)
      setToastType('success')
      setMessage('Doctor consultation logged in MongoDB successfully!')
      setIsConsultModalOpen(false)
      setConsultForm({
        doctorName: '',
        specialization: '',
        clinicHospital: '',
        consultationDate: new Date().toISOString().split('T')[0],
        chiefComplaint: '',
        diagnosis: '',
        prescriptionsStr: '',
        followUpDate: '',
        consultationFee: '$50',
        notes: ''
      })
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to log doctor consultation.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Doctor Consultation
  const handleDeleteConsultation = async (id) => {
    try {
      await mongoService.deleteDoctorConsultation(id, userId)
      setToastType('success')
      setMessage('Consultation log deleted.')
      await loadData()
    } catch {
      setToastType('error')
      setMessage('Failed to delete consultation log.')
    }
  }

  // 3. Add Vitals Record
  const handleAddVitals = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        userId,
        bpSystolic: Number(vitalsForm.bpSystolic),
        bpDiastolic: Number(vitalsForm.bpDiastolic),
        heartRate: Number(vitalsForm.heartRate),
        bloodSugar: Number(vitalsForm.bloodSugar),
        spo2: Number(vitalsForm.spo2),
        bmi: Number(vitalsForm.bmi),
        temperatureF: Number(vitalsForm.temperatureF),
        notes: vitalsForm.notes
      }
      await mongoService.addHealthRecord(payload)
      setToastType('success')
      setMessage('Health vitals saved to MongoDB!')
      setIsVitalsModalOpen(false)
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to save health vitals.')
    } finally {
      setSubmitting(false)
    }
  }

  // 4. Update Client Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        fullName: profileForm.fullName,
        age: Number(profileForm.age),
        gender: profileForm.gender,
        bloodGroup: profileForm.bloodGroup,
        heightCm: Number(profileForm.heightCm),
        weightKg: Number(profileForm.weightKg),
        phone: profileForm.phone,
        emergencyContact: profileForm.emergencyContact,
        allergies: profileForm.allergiesStr ? profileForm.allergiesStr.split(',').map(a => a.trim()) : [],
        chronicConditions: profileForm.chronicConditionsStr ? profileForm.chronicConditionsStr.split(',').map(c => c.trim()) : []
      }
      await mongoService.updateClientProfile(userId, payload)
      setToastType('success')
      setMessage('Client health profile updated in MongoDB!')
      setIsProfileModalOpen(false)
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to update client profile.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filtering Logic
  const filteredIllnesses = useMemo(() => {
    if (!searchQuery.trim()) return illnessHistory
    const q = searchQuery.toLowerCase()
    return illnessHistory.filter(i => 
      i.illnessName.toLowerCase().includes(q) || 
      i.status.toLowerCase().includes(q) ||
      i.treatment?.toLowerCase().includes(q) ||
      i.symptoms?.some(s => s.toLowerCase().includes(q))
    )
  }, [illnessHistory, searchQuery])

  const filteredConsultations = useMemo(() => {
    if (!searchQuery.trim()) return doctorConsultations
    const q = searchQuery.toLowerCase()
    return doctorConsultations.filter(c => 
      c.doctorName.toLowerCase().includes(q) || 
      c.specialization.toLowerCase().includes(q) ||
      c.diagnosis.toLowerCase().includes(q) ||
      c.chiefComplaint.toLowerCase().includes(q)
    )
  }, [doctorConsultations, searchQuery])

  const latestVitals = vitalsHistory[0] || {
    bpSystolic: 120, bpDiastolic: 80, heartRate: 72, bloodSugar: 95, spo2: 98, bmi: 23.0, temperatureF: 98.6
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 dark:bg-slate-950">
      <Toast message={message} type={toastType} onClose={() => setMessage('')} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Client Health & Medical History
              </h1>
              {/* MongoDB Connection Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                dbStatus.mongoConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
              }`}>
                <Database className="h-3.5 w-3.5" />
                {dbStatus.mongoConnected ? 'MongoDB Connected' : 'Local Health DB Active'}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Complete diagnostic health records, illness history logs, and doctor consultation history stored securely in MongoDB.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setIsIllnessModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" /> Add Illness Record
            </Button>
            <Button onClick={() => setIsConsultModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Stethoscope className="mr-1.5 h-4 w-4" /> Log Doctor Visit
            </Button>
            <Button onClick={() => setIsVitalsModalOpen(true)} variant="outline">
              <HeartPulse className="mr-1.5 h-4 w-4 text-rose-500" /> Log Vitals
            </Button>
          </div>
        </div>

        {/* 1. Client Basic Profile Header Card */}
        {loading ? (
          <Skeleton className="h-44 w-full rounded-3xl" />
        ) : (
          <Card className="relative overflow-hidden border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-3xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left Client Profile Details */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 font-bold text-xl shrink-0 shadow-inner">
                  {clientProfile?.fullName ? clientProfile.fullName.charAt(0) : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {clientProfile?.fullName || 'Aarav Sharma'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800">
                      Client ID: #{userId.substring(0, 8)}
                    </span>
                    <button 
                      onClick={() => setIsProfileModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {clientProfile?.age || 32} Yrs • {clientProfile?.gender || 'Male'}</span>
                    <span className="flex items-center gap-1"><Droplet className="h-3.5 w-3.5 text-red-500" /> Blood Group: <strong>{clientProfile?.bloodGroup || 'O+'}</strong></span>
                    <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5 text-blue-500" /> {clientProfile?.heightCm || 178} cm</span>
                    <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5 text-amber-500" /> {clientProfile?.weightKg || 74} kg</span>
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {clientProfile?.phone || '+91 98765 43210'}</span>
                  </div>

                  {/* Allergies & Chronic Conditions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Known Allergies:</span>
                    {clientProfile?.allergies && clientProfile.allergies.length > 0 ? (
                      clientProfile.allergies.map((alg, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300">
                          ⚠️ {alg}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No known allergies</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Quick Vitals Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl dark:bg-slate-850 border border-slate-100 dark:border-slate-800 shrink-0">
                <div className="text-center px-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Blood Pressure</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{latestVitals.bpSystolic}/{latestVitals.bpDiastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span></p>
                </div>
                <div className="text-center px-2 border-l border-slate-200/60 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Heart Rate</p>
                  <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">{latestVitals.heartRate} <span className="text-[10px] text-slate-400 font-normal">bpm</span></p>
                </div>
                <div className="text-center px-2 border-l border-slate-200/60 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Blood Sugar</p>
                  <p className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">{latestVitals.bloodSugar} <span className="text-[10px] text-slate-400 font-normal">mg/dL</span></p>
                </div>
                <div className="text-center px-2 border-l border-slate-200/60 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">SpO2 Oxygen</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{latestVitals.spo2}%</p>
                </div>
              </div>

            </div>
          </Card>
        )}

        {/* 2. Interactive Navigation Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              📊 Health Overview
            </button>
            <button
              onClick={() => setActiveTab('illness')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'illness'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              🦠 Illness History ({illnessHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'consultations'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              🩺 Doctor Consultations ({doctorConsultations.length})
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'vitals'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              📈 Health Vitals Log
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              🕒 Medical Timeline
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* 3. TAB CONTENTS */}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Illnesses Summary */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-500" /> Active & Past Conditions
                </h3>
                <span className="text-xs font-semibold text-slate-500">MongoDB Records</span>
              </div>
              <div className="space-y-3">
                {illnessHistory.slice(0, 3).map((item) => (
                  <div key={item._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.illnessName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'Active' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Diagnosed: {item.diagnosisDate} • Severity: {item.severity}</p>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveTab('illness')}
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center justify-center gap-1 cursor-pointer"
                >
                  View All Illness Records ({illnessHistory.length}) <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>

            {/* Doctor Consultation Summary */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-500" /> Recent Doctor Visits
                </h3>
                <span className="text-xs font-semibold text-slate-500">Consultation Logs</span>
              </div>
              <div className="space-y-3">
                {doctorConsultations.slice(0, 3).map((item) => (
                  <div key={item._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.doctorName}</span>
                      <span className="text-xs text-slate-500">{item.consultationDate}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">{item.specialization} • {item.clinicHospital}</p>
                    <p className="text-xs text-slate-500 mt-1">Diagnosis: {item.diagnosis}</p>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveTab('consultations')}
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1 cursor-pointer"
                >
                  View All Consultation History ({doctorConsultations.length}) <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>

            {/* Vitals Summary Card */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-rose-500" /> Health Vitals Status
                </h3>
                <span className="text-xs text-slate-400">Normal Range</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Blood Pressure</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{latestVitals.bpSystolic}/{latestVitals.bpDiastolic} mmHg</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Resting Heart Rate</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{latestVitals.heartRate} bpm</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Fasting Blood Sugar</span>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{latestVitals.bloodSugar} mg/dL</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Body Mass Index (BMI)</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{latestVitals.bmi} kg/m²</span>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* TAB 2: ILLNESS HISTORY */}
        {activeTab === 'illness' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🦠 Client Illness History Records
              </h2>
              <Button onClick={() => setIsIllnessModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Illness
              </Button>
            </div>

            {filteredIllnesses.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">No illness records found</p>
                <p className="text-xs text-slate-400 mt-1">Click 'Add New Illness' to log a past or current medical condition into MongoDB.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIllnesses.map((item) => (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl relative shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.illnessName}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              item.status === 'Active'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}>
                              {item.status}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.severity === 'Severe' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {item.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Diagnosed Date: <strong>{item.diagnosisDate}</strong>
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteIllness(item._id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Delete illness record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Symptoms tags */}
                      {item.symptoms && item.symptoms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Symptoms Experienced:</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {item.symptoms.map((symptom, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treatment & Medications */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <strong>Treatment:</strong> {item.treatment}
                        </p>
                        {item.prescribedMedications && item.prescribedMedications.length > 0 && (
                          <p className="text-xs text-teal-700 dark:text-teal-400">
                            <strong>Prescriptions:</strong> {item.prescribedMedications.join(', ')}
                          </p>
                        )}
                        {item.doctorNotes && (
                          <p className="text-xs text-slate-500 italic mt-1">"{item.doctorNotes}"</p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCTOR CONSULTATION HISTORY */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🩺 Doctor Consultation History
              </h2>
              <Button onClick={() => setIsConsultModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Doctor Visit
              </Button>
            </div>

            {filteredConsultations.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <Stethoscope className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">No doctor consultation history recorded</p>
                <p className="text-xs text-slate-400 mt-1">Log consultation notes and diagnoses from your doctor visits.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredConsultations.map((item) => (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl relative shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.doctorName}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                              {item.specialization}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>🏥 {item.clinicHospital}</span>
                            <span>•</span>
                            <span>📅 Date: <strong>{item.consultationDate}</strong></span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                            Fee: {item.consultationFee}
                          </span>
                          <button 
                            onClick={() => handleDeleteConsultation(item._id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Delete consultation log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Chief Complaint & Symptoms:</p>
                          <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{item.chiefComplaint}</p>

                          <p className="text-xs font-semibold text-slate-500 mt-2">Clinical Diagnosis:</p>
                          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">{item.diagnosis}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-850/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-semibold text-slate-500">Prescribed Medication:</p>
                          {item.prescriptions && item.prescriptions.length > 0 ? (
                            <ul className="mt-1 text-xs text-slate-700 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                              {item.prescriptions.map((p, idx) => (
                                <li key={idx}>{p}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400">None prescribed</p>
                          )}

                          {item.followUpDate && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2">
                              🗓️ Next Follow-Up Date: {item.followUpDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VITALS LOG */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                📈 Client Health Vitals Records
              </h2>
              <Button onClick={() => setIsVitalsModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Log New Vitals
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vitalsHistory.map((item, idx) => (
                <Card key={item._id || idx} className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500">Recorded: {new Date(item.recordedAt).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">Vitals Log</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                      <p className="text-slate-400 text-[10px]">BP</p>
                      <p className="font-bold text-slate-900 dark:text-white">{item.bpSystolic}/{item.bpDiastolic} mmHg</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                      <p className="text-slate-400 text-[10px]">Heart Rate</p>
                      <p className="font-bold text-rose-600 dark:text-rose-400">{item.heartRate} bpm</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                      <p className="text-slate-400 text-[10px]">Blood Sugar</p>
                      <p className="font-bold text-teal-600 dark:text-teal-400">{item.bloodSugar} mg/dL</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                      <p className="text-slate-400 text-[10px]">SpO2</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">{item.spo2}%</p>
                    </div>
                  </div>
                  {item.notes && <p className="text-xs text-slate-500 mt-3 italic">"{item.notes}"</p>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: UNIFIED MEDICAL TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              🕒 Complete Medical Timeline
            </h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pl-6 py-2">
              {generalTimeline.map((item) => (
                <div key={item.id} className="relative">
                  <div className={`absolute -left-[31px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <Card className="p-4 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                      <span className="text-xs text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.details}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODALS FOR ADDING DATA TO MONGODB */}

      {/* 1. Modal: Add Illness Record */}
      <Modal open={isIllnessModalOpen} onClose={() => setIsIllnessModalOpen(false)} title="Add Illness / Condition Record">
        <form onSubmit={handleAddIllness} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Illness / Condition Name *</label>
            <Input 
              required 
              placeholder="e.g. Acute Bronchitis, Type 2 Diabetes" 
              value={illnessForm.illnessName}
              onChange={(e) => setIllnessForm({ ...illnessForm, illnessName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diagnosis Date</label>
              <Input 
                type="date"
                value={illnessForm.diagnosisDate}
                onChange={(e) => setIllnessForm({ ...illnessForm, diagnosisDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <select 
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                value={illnessForm.status}
                onChange={(e) => setIllnessForm({ ...illnessForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Recovered">Recovered</option>
                <option value="Chronic">Chronic</option>
                <option value="Under Treatment">Under Treatment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</label>
              <select 
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                value={illnessForm.severity}
                onChange={(e) => setIllnessForm({ ...illnessForm, severity: e.target.value })}
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Symptoms (comma separated)</label>
            <Input 
              placeholder="Fever, Cough, Shortness of breath"
              value={illnessForm.symptomsStr}
              onChange={(e) => setIllnessForm({ ...illnessForm, symptomsStr: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Treatment Plan</label>
            <Input 
              placeholder="Rest, hydration, physical therapy"
              value={illnessForm.treatment}
              onChange={(e) => setIllnessForm({ ...illnessForm, treatment: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prescribed Medications (comma separated)</label>
            <Input 
              placeholder="Azithromycin 500mg, Paracetamol 650mg"
              value={illnessForm.prescribedMedicationsStr}
              onChange={(e) => setIllnessForm({ ...illnessForm, prescribedMedicationsStr: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Doctor Notes</label>
            <Input 
              placeholder="Follow up in 2 weeks if symptoms persist."
              value={illnessForm.doctorNotes}
              onChange={(e) => setIllnessForm({ ...illnessForm, doctorNotes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsIllnessModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
              {submitting ? 'Saving to MongoDB...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Add Doctor Consultation */}
      <Modal open={isConsultModalOpen} onClose={() => setIsConsultModalOpen(false)} title="Log Doctor Consultation">
        <form onSubmit={handleAddConsultation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Doctor Name *</label>
              <Input 
                required
                placeholder="Dr. Evelyn Vance"
                value={consultForm.doctorName}
                onChange={(e) => setConsultForm({ ...consultForm, doctorName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specialization</label>
              <Input 
                placeholder="Cardiology / Pulmonology"
                value={consultForm.specialization}
                onChange={(e) => setConsultForm({ ...consultForm, specialization: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clinic / Hospital</label>
              <Input 
                placeholder="City General Hospital"
                value={consultForm.clinicHospital}
                onChange={(e) => setConsultForm({ ...consultForm, clinicHospital: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Consultation Date</label>
              <Input 
                type="date"
                value={consultForm.consultationDate}
                onChange={(e) => setConsultForm({ ...consultForm, consultationDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chief Complaint / Reason</label>
            <Input 
              placeholder="Chest tightness during morning runs"
              value={consultForm.chiefComplaint}
              onChange={(e) => setConsultForm({ ...consultForm, chiefComplaint: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diagnosis *</label>
            <Input 
              required
              placeholder="Post-viral bronchial hyper-responsiveness"
              value={consultForm.diagnosis}
              onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prescriptions (comma separated)</label>
            <Input 
              placeholder="Inhaler 200mcg, Montelukast 10mg"
              value={consultForm.prescriptionsStr}
              onChange={(e) => setConsultForm({ ...consultForm, prescriptionsStr: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Follow-up Date</label>
              <Input 
                type="date"
                value={consultForm.followUpDate}
                onChange={(e) => setConsultForm({ ...consultForm, followUpDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Consultation Fee</label>
              <Input 
                placeholder="$50"
                value={consultForm.consultationFee}
                onChange={(e) => setConsultForm({ ...consultForm, consultationFee: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsConsultModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? 'Saving to MongoDB...' : 'Save Consultation Log'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Log Vitals */}
      <Modal open={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title="Log Health Vitals">
        <form onSubmit={handleAddVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Systolic BP (mmHg)</label>
              <Input type="number" value={vitalsForm.bpSystolic} onChange={(e) => setVitalsForm({ ...vitalsForm, bpSystolic: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Diastolic BP (mmHg)</label>
              <Input type="number" value={vitalsForm.bpDiastolic} onChange={(e) => setVitalsForm({ ...vitalsForm, bpDiastolic: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heart Rate (bpm)</label>
              <Input type="number" value={vitalsForm.heartRate} onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Blood Sugar (mg/dL)</label>
              <Input type="number" value={vitalsForm.bloodSugar} onChange={(e) => setVitalsForm({ ...vitalsForm, bloodSugar: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SpO2 Oxygen (%)</label>
              <Input type="number" value={vitalsForm.spo2} onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white">
              {submitting ? 'Saving...' : 'Save Vitals Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Modal: Edit Client Profile */}
      <Modal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Edit Client Health Profile">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <Input value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Age</label>
              <Input type="number" value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gender</label>
              <select 
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                value={profileForm.gender} 
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
              <Input value={profileForm.bloodGroup} onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weight (kg)</label>
              <Input type="number" value={profileForm.weightKg} onChange={(e) => setProfileForm({ ...profileForm, weightKg: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Known Allergies (comma separated)</label>
            <Input value={profileForm.allergiesStr} onChange={(e) => setProfileForm({ ...profileForm, allergiesStr: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
              {submitting ? 'Updating...' : 'Update Client Profile'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
