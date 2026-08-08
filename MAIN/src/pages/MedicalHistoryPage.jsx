import { motion } from 'framer-motion'
import { 
  ClipboardList, HeartPulse, Brain, CalendarDays, Search, 
  Plus, User, Activity, Stethoscope, Database, 
  Trash2, Edit3, Clock, Phone, Droplet, Weight, Ruler, ChevronRight,
  FileText, Download, Eye, Filter, ArrowUpDown, FilePlus, FolderOpen,
  CheckCircle2, AlertTriangle, Sparkles, ShieldCheck, TrendingUp
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
import { extractionService } from '../services/extractionService'
import { healthScoreService } from '../services/healthScoreService'
import { MedicalRecordModal, RECORD_CATEGORIES } from '../components/medical/MedicalRecordModal'
import { DeleteConfirmationModal } from '../components/medical/DeleteConfirmationModal'
import { RecordViewerModal } from '../components/medical/RecordViewerModal'
import { VerificationModal } from '../components/medical/VerificationModal'
import { ManualBPModal } from '../components/medical/ManualBPModal'
import { ManualSugarModal } from '../components/medical/ManualSugarModal'
import { HealthScoreWidget } from '../components/medical/HealthScoreWidget'

export default function MedicalHistoryPage() {
  const { 
    user,
    fetchMedicalHistory, 
    fetchAppointments,
    fetchHealthRecords,
    fetchImageAnalyses,
    fetchReports,
    fetchMedicalRecords,
    uploadMedicalRecord,
    deleteMedicalRecord,
    saveStructuredMeasurements,
    fetchStructuredMeasurements,
    updateStructuredMeasurement,
    saveBPReading,
    fetchBPHistory,
    saveBloodSugarReading,
    fetchBloodSugarHistory,
    saveHealthScoreSnapshot,
    fetchHealthScoreHistory
  } = useAuth()

  // State Management
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('records') // Default to 'records' tab
  const [dbStatus, setDbStatus] = useState({ status: 'checking', mongoConnected: false })

  // Phase 1 Medical Records State (Firebase Firestore + Storage)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'

  // Phase 2 Structured Health Data State
  const [structuredMetrics, setStructuredMetrics] = useState([])
  const [bpHistory, setBpHistory] = useState([])
  const [sugarHistory, setSugarHistory] = useState([])

  // Phase 3 Health Score & Trend History State
  const [scoreData, setScoreData] = useState(null)
  const [scoreHistory, setScoreHistory] = useState([])

  // Modals Control
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [recordToView, setRecordToView] = useState(null)
  const [deletingRecord, setDeletingRecord] = useState(false)

  // Phase 2 Verification & Manual Modals
  const [pendingVerificationMetrics, setPendingVerificationMetrics] = useState(null)
  const [isBPModalOpen, setIsBPModalOpen] = useState(false)
  const [isSugarModalOpen, setIsSugarModalOpen] = useState(false)

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

  // Modal Control States for MongoDB records
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

  // Load All Data from Firebase & MongoDB
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch Patient Medical Records from Firebase Firestore
      let records = []
      if (fetchMedicalRecords) {
        records = await fetchMedicalRecords()
        setMedicalRecords(records || [])
      }

      // 2. Fetch Phase 2 Structured Health Data & Histories
      let sMetrics = []
      let bp = []
      let sugar = []
      if (fetchStructuredMeasurements) {
        sMetrics = await fetchStructuredMeasurements()
        setStructuredMetrics(sMetrics || [])
      }
      if (fetchBPHistory) {
        bp = await fetchBPHistory()
        setBpHistory(bp || [])
      }
      if (fetchBloodSugarHistory) {
        sugar = await fetchBloodSugarHistory()
        setSugarHistory(sugar || [])
      }

      // 3. Phase 3: Calculate Health Score Engine & Fetch Score History
      if (healthScoreService) {
        const scoreRes = healthScoreService.calculateScore({
          structuredMetrics: sMetrics || [],
          bpHistory: bp || [],
          sugarHistory: sugar || [],
        })
        setScoreData(scoreRes)
      }

      if (fetchHealthScoreHistory) {
        const sHistory = await fetchHealthScoreHistory()
        setScoreHistory(sHistory || [])
      }

      // 4. Check DB health status
      const statusRes = await mongoService.getHealthStatus()
      setDbStatus(statusRes)

      // 5. Fetch Client Full History from MongoDB API
      const fullHistory = await mongoService.getFullHistory(userId)
      if (fullHistory) {
        setClientProfile(fullHistory.client)
        setIllnessHistory(fullHistory.illnessHistory || [])
        setDoctorConsultations(fullHistory.doctorConsultationHistory || [])
        setVitalsHistory(fullHistory.healthVitals || [])

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

      // 6. Fetch app records (symptoms, appointments, AI image scans, etc.)
      const [notes, symptoms, _reports, appointments, _images] = await Promise.all([
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
  }, [userId, fetchMedicalRecords, fetchStructuredMeasurements, fetchBPHistory, fetchBloodSugarHistory, fetchHealthScoreHistory, fetchMedicalHistory, fetchHealthRecords, fetchReports, fetchAppointments, fetchImageAnalyses])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Phase 1 Medical Record Save & Phase 2 Extraction Trigger & Phase 3 Score Snapshot
  const handleSaveMedicalRecord = async (recordMeta, file) => {
    setSubmitting(true)
    try {
      const savedDoc = await uploadMedicalRecord(recordMeta, file)
      setToastType('success')
      setMessage('Medical record saved successfully!')

      // Phase 2: Extract structured health parameters from the uploaded report
      const extracted = await extractionService.extractReportMetrics(
        { ...recordMeta, id: savedDoc?.id || savedDoc?._id },
        file
      )

      if (extracted && extracted.length > 0) {
        setPendingVerificationMetrics(extracted)
      }

      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to upload medical record.')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Phase 2: Save Verified Health Measurements & Phase 3 Snapshot Trigger
  const handleSaveVerifiedMetrics = async (verifiedItems) => {
    try {
      await saveStructuredMeasurements(verifiedItems)
      
      // Auto save extracted BP or Blood Sugar to history tables if present
      for (const item of verifiedItems) {
        if (item.category === 'Blood Pressure' && item.systolic && item.diastolic) {
          await saveBPReading({
            systolic: item.systolic,
            diastolic: item.diastolic,
            measurementDate: item.measurementDate,
            source: 'Report',
            verified: true,
          })
        } else if (item.category === 'Blood Sugar' && item.value) {
          await saveBloodSugarReading({
            value: item.value,
            unit: item.unit,
            measurementType: item.measurementType || 'fasting',
            measurementDate: item.measurementDate,
            verified: true,
          })
        }
      }

      // Phase 3: Recalculate & Save Score Snapshot
      const updatedScore = healthScoreService.calculateScore({
        structuredMetrics: [...structuredMetrics, ...verifiedItems],
        bpHistory,
        sugarHistory,
      })
      if (saveHealthScoreSnapshot) {
        await saveHealthScoreSnapshot(updatedScore)
      }

      setToastType('success')
      setMessage('Verified structured health measurements & recalculated Health Score saved!')
      setPendingVerificationMetrics(null)
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to save structured health measurements.')
    }
  }

  // Phase 2: Manual BP Submission
  const handleManualBPSubmit = async (bpData) => {
    setSubmitting(true)
    try {
      await saveBPReading(bpData)
      
      // Phase 3: Snapshot score
      const updatedBP = [bpData, ...bpHistory]
      const updatedScore = healthScoreService.calculateScore({
        structuredMetrics,
        bpHistory: updatedBP,
        sugarHistory,
      })
      if (saveHealthScoreSnapshot) {
        await saveHealthScoreSnapshot(updatedScore)
      }

      setToastType('success')
      setMessage('Blood Pressure reading added & Health Score updated!')
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to save BP reading.')
    } finally {
      setSubmitting(false)
    }
  }

  // Phase 2: Manual Blood Sugar Submission
  const handleManualSugarSubmit = async (sugarData) => {
    setSubmitting(true)
    try {
      await saveBloodSugarReading(sugarData)
      
      // Phase 3: Snapshot score
      const updatedSugar = [sugarData, ...sugarHistory]
      const updatedScore = healthScoreService.calculateScore({
        structuredMetrics,
        bpHistory,
        sugarHistory: updatedSugar,
      })
      if (saveHealthScoreSnapshot) {
        await saveHealthScoreSnapshot(updatedScore)
      }

      setToastType('success')
      setMessage('Blood Sugar reading added & Health Score updated!')
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to save Blood Sugar reading.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete) return
    setDeletingRecord(true)
    try {
      const recId = recordToDelete.id || recordToDelete._id
      const storagePath = recordToDelete.storagePath
      await deleteMedicalRecord(recId, storagePath)
      
      // Filter out ONLY structured metrics originating from this specific deleted report
      const remainingStructured = structuredMetrics.filter((m) => m.sourceRecordId !== recId)
      setStructuredMetrics(remainingStructured)

      // Recalculate Health Score & Risk after record deletion
      const updatedScore = healthScoreService.calculateScore({
        structuredMetrics: remainingStructured,
        bpHistory,
        sugarHistory,
      })
      if (saveHealthScoreSnapshot) {
        await saveHealthScoreSnapshot(updatedScore)
      }

      setToastType('success')
      setMessage('Medical record permanently deleted. Health score and risk recalculated.')
      setRecordToDelete(null)
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to delete medical record.')
    } finally {
      setDeletingRecord(false)
    }
  }

  // MongoDB Record Handlers
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
      setMessage('Illness history record added successfully!')
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
      setMessage('Doctor consultation logged successfully!')
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
      setMessage('Health vitals saved!')
      setIsVitalsModalOpen(false)
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to save health vitals.')
    } finally {
      setSubmitting(false)
    }
  }

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
      setMessage('Client health profile updated!')
      setIsProfileModalOpen(false)
      await loadData()
    } catch (err) {
      setToastType('error')
      setMessage('Failed to update client profile.')
    } finally {
      setSubmitting(false)
    }
  }

  // Medical Records Filter & Search Logic
  const filteredMedicalRecords = useMemo(() => {
    let list = [...medicalRecords]

    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.recordType === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          (r.recordName && r.recordName.toLowerCase().includes(q)) ||
          (r.doctorName && r.doctorName.toLowerCase().includes(q)) ||
          (r.hospitalName && r.hospitalName.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      )
    }

    list.sort((a, b) => {
      const timeA = new Date(a.recordDate || a.createdAt || 0).getTime()
      const timeB = new Date(b.recordDate || b.createdAt || 0).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })

    return list
  }, [medicalRecords, selectedCategory, searchQuery, sortOrder])

  // Category counts map
  const categoryCounts = useMemo(() => {
    const counts = { all: medicalRecords.length }
    RECORD_CATEGORIES.forEach((cat) => {
      counts[cat.id] = medicalRecords.filter((r) => r.recordType === cat.id).length
    })
    return counts
  }, [medicalRecords])

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

  // Format date nicely: "08 Aug 2026"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const parts = String(dateStr).split('T')[0].split('-')
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2])
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Get category info helper
  const getCategoryInfo = (recordType) => {
    return RECORD_CATEGORIES.find((c) => c.id === recordType) || {
      id: 'other_documents',
      label: 'Other Documents',
      icon: '📁'
    }
  }

  // Latest readings
  const latestBP = bpHistory[0] || null
  const latestSugar = sugarHistory[0] || null

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 dark:bg-slate-950">
      <Toast message={message} type={toastType} onClose={() => setMessage('')} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Medical Records & Health Vault
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <Database className="h-3.5 w-3.5" />
                Data-Driven Health Score Engine Active
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Upload reports, extract structured parameters, verify measurements, and track your SanjivniAI Health Overview Score.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsRecordModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition gap-1.5"
            >
              <Plus className="h-4 w-4" /> [ + ADD MEDICAL RECORD ]
            </Button>
            <Button onClick={() => setIsBPModalOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1">
              <HeartPulse className="h-3.5 w-3.5" /> [ + ADD BP READING ]
            </Button>
            <Button onClick={() => setIsSugarModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-1">
              <span>🍬</span> [ + ADD BLOOD SUGAR ]
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xl shrink-0 shadow-inner">
                  {clientProfile?.fullName ? clientProfile.fullName.charAt(0) : (user?.displayName ? user.displayName.charAt(0) : 'P')}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {clientProfile?.fullName || user?.displayName || 'Patient Health Record'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      Patient ID: {userId.substring(0, 10)}
                    </span>
                    <button 
                      onClick={() => setIsProfileModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {clientProfile?.age || 30} Yrs • {clientProfile?.gender || 'Male'}</span>
                    <span className="flex items-center gap-1"><Droplet className="h-3.5 w-3.5 text-red-500" /> Blood Group: <strong>{clientProfile?.bloodGroup || 'O+'}</strong></span>
                    <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5 text-blue-500" /> {clientProfile?.heightCm || 172} cm</span>
                    <span className="flex items-center gap-1"><Weight className="h-3.5 w-3.5 text-amber-500" /> {clientProfile?.weightKg || 68} kg</span>
                  </div>
                </div>
              </div>

              {/* Right Quick Vitals & Structured Data Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl dark:bg-slate-850 border border-slate-100 dark:border-slate-800 shrink-0">
                <div className="text-center px-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Health Overview Score</p>
                  {scoreData?.isLimitedData ? (
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">Limited Data</p>
                  ) : (
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{scoreData?.overallScore} <span className="text-[10px] text-slate-400 font-normal">/100</span></p>
                  )}
                </div>
                <div className="text-center px-2 border-l border-slate-200/60 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Blood Pressure</p>
                  {latestBP ? (
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{latestBP.systolic}/{latestBP.diastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span></p>
                  ) : (
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Insufficient data</p>
                  )}
                </div>
                <div className="text-center px-2 border-l border-slate-200/60 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Blood Sugar</p>
                  {latestSugar ? (
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{latestSugar.value} <span className="text-[10px] text-slate-400 font-normal">{latestSugar.unit}</span></p>
                  ) : (
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Insufficient data</p>
                  )}
                </div>
                <div className="text-center px-2 border-l border-slate-200/60 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completeness</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{scoreData?.dataCompleteness || 0}%</p>
                </div>
              </div>

            </div>
          </Card>
        )}

        {/* 2. Interactive Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          
          {/* Main Section Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'records'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              📁 Medical Records ({medicalRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('score')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'score'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              🏆 Health Score & Trend
            </button>
            <button
              onClick={() => setActiveTab('structured')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'structured'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              📊 Structured Metrics ({structuredMetrics.length})
            </button>
            <button
              onClick={() => setActiveTab('bp')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'bp'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              ❤️ BP History ({bpHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('sugar')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'sugar'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              🍬 Sugar History ({sugarHistory.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search records, parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* 3. TAB CONTENTS */}

        {/* TAB 1: MEDICAL RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            
            {/* Header & Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📁</span> Patient Medical Records
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload reports to automatically trigger structured parameters extraction and recalculate Health Score.
                </p>
              </div>
              <Button
                onClick={() => setIsRecordModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 shadow-md gap-2"
              >
                <Plus className="h-4 w-4" /> [ + ADD MEDICAL RECORD ]
              </Button>
            </div>

            {/* Category Filter Pills & Sort Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  }`}
                >
                  <span>All</span>
                  <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] bg-white/20 dark:bg-slate-800">
                    {categoryCounts.all}
                  </span>
                </button>

                {RECORD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {categoryCounts[cat.id] > 0 && (
                      <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold">
                        {categoryCounts[cat.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sort Order Control */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Medical Records Cards Display */}
            {filteredMedicalRecords.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <FolderOpen className="h-14 w-14 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No medical records found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No records match your search or selected category filter.'
                    : 'Your medical vault is empty. Click "+ Add Medical Record" to upload blood reports, X-rays, prescriptions, and lab tests.'}
                </p>
                <Button
                  onClick={() => setIsRecordModalOpen(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Medical Record
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMedicalRecords.map((record) => {
                  const catInfo = getCategoryInfo(record.recordType)
                  return (
                    <motion.div
                      key={record.id || record._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-full">
                        <div>
                          {/* Card Header: Category & Date */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                              <span>{catInfo.icon}</span>
                              <span>{catInfo.label}</span>
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {formatDateDisplay(record.recordDate)}
                            </span>
                          </div>

                          {/* Record Title */}
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {record.recordName}
                          </h3>

                          {/* Doctor & Hospital Details */}
                          {(record.doctorName || record.hospitalName) && (
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                              <span>👨‍⚕️</span>
                              <span>
                                {record.doctorName || 'Practitioner'} {record.hospitalName ? `• ${record.hospitalName}` : ''}
                              </span>
                            </p>
                          )}

                          {/* Notes if present */}
                          {record.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl italic line-clamp-2">
                              "{record.notes}"
                            </p>
                          )}

                          {/* File info badge */}
                          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                            <span className="uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                              {record.mimeType === 'application/pdf' ? 'PDF' : 'IMAGE'}
                            </span>
                            {record.fileSize > 0 && (
                              <span>{(record.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: VIEW, DOWNLOAD, DELETE */}
                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRecordToView(record)}
                              className="text-xs font-bold gap-1 px-3 py-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" /> VIEW
                            </Button>
                            <a
                              href={record.fileUrl}
                              download={record.recordName || 'medical-record'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                            >
                              <Download className="h-3.5 w-3.5" /> DOWNLOAD
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRecordToDelete(record)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-0.5" /> DELETE
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PHASE 3 HEALTH SCORE & TREND HISTORY */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            <HealthScoreWidget scoreData={scoreData} />

            {/* Health Score Trend Table */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" /> Health Score Trend
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Historical score calculation snapshots recorded upon adding or verifying medical data.
                  </p>
                </div>
              </div>

              {scoreHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-850 rounded-2xl">
                  No previous score snapshots recorded yet. Upload a report or log BP/Sugar to record your first trend snapshot.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Calculation Date</th>
                        <th className="pb-3">Score</th>
                        <th className="pb-3">Completeness</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-800 dark:text-slate-200">
                      {scoreHistory.map((snap, idx) => (
                        <tr key={snap.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition">
                          <td className="py-3.5">{formatDateDisplay(snap.calculatedAt)}</td>
                          <td className="py-3.5 font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            {snap.isLimitedData || snap.score === null ? 'Limited Data' : `${snap.score} / 100`}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-600 dark:text-slate-300">
                            {snap.dataCompleteness || 0}%
                          </td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60">
                              Recorded Snapshot
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 3: PHASE 2 STRUCTURED HEALTH METRICS VAULT */}
        {activeTab === 'structured' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📊</span> Extracted Structured Health Data
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Individual health metrics extracted from reports with full provenance (value, unit, reference range, method, confidence).
                </p>
              </div>
            </div>

            {structuredMetrics.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No structured metrics extracted yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Upload a blood report, BP log, or lab test under Medical Records to automatically extract structured health data.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {structuredMetrics.map((item, idx) => (
                  <Card key={item.id || idx} className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.category || 'Health Metric'}</span>
                      {item.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="h-3.5 w-3.5" /> Unverified
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {item.value} <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                      </p>
                      {item.referenceRange && (
                        <p className="text-xs text-slate-400 font-medium">Ref Range: {item.referenceRange}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <div>
                        <span>Date: </span>
                        <strong className="text-slate-700 dark:text-slate-300">{formatDateDisplay(item.measurementDate)}</strong>
                      </div>
                      <div>
                        <span>Method: </span>
                        <strong className="text-slate-700 dark:text-slate-300">{item.extractionMethod || 'AI/OCR'}</strong>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOOD PRESSURE HISTORY */}
        {activeTab === 'bp' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="h-6 w-6 text-rose-500" /> Blood Pressure History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recorded BP systolic and diastolic logs with source tracking.
                </p>
              </div>
              <Button
                onClick={() => setIsBPModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" /> [ + ADD BP READING ]
              </Button>
            </div>

            {bpHistory.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <HeartPulse className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-amber-600 dark:text-amber-400">Blood Pressure: Insufficient data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  No blood pressure measurements recorded yet. Click "+ Add BP Reading" to record a manual check or upload a cardiology report.
                </p>
                <Button
                  onClick={() => setIsBPModalOpen(true)}
                  className="mt-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add BP Reading
                </Button>
              </Card>
            ) : (
              <Card className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Blood Pressure (mmHg)</th>
                      <th className="pb-3">Source</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-800 dark:text-slate-200">
                    {bpHistory.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition">
                        <td className="py-3.5">{formatDateDisplay(item.measurementDate)}</td>
                        <td className="py-3.5 text-slate-500">{item.measurementTime || 'N/A'}</td>
                        <td className="py-3.5 font-bold text-sm text-rose-600 dark:text-rose-400">
                          {item.systolic}/{item.diastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.source || 'Manual'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}

        {/* TAB 5: BLOOD SUGAR HISTORY */}
        {activeTab === 'sugar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🍬</span> Blood Sugar History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track Fasting, Post-meal, Random Glucose, and HbA1c history.
                </p>
              </div>
              <Button
                onClick={() => setIsSugarModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" /> [ + ADD BLOOD SUGAR ]
              </Button>
            </div>

            {sugarHistory.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-4xl block mb-2">🍬</span>
                <h3 className="text-base font-bold text-amber-600 dark:text-amber-400">Blood Sugar: Insufficient data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  No blood sugar measurements recorded yet. Click "+ Add Blood Sugar" to enter Fasting, Post-meal, or HbA1c values.
                </p>
                <Button
                  onClick={() => setIsSugarModalOpen(true)}
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Blood Sugar
                </Button>
              </Card>
            ) : (
              <Card className="p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Measurement Type</th>
                      <th className="pb-3">Value</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-800 dark:text-slate-200">
                    {sugarHistory.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition">
                        <td className="py-3.5">{formatDateDisplay(item.measurementDate)}</td>
                        <td className="py-3.5">
                          <span className="capitalize px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200/60">
                            {item.measurementType || 'Fasting'}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-sm text-teal-600 dark:text-teal-400">
                          {item.value} <span className="text-xs text-slate-400 font-normal">{item.unit || 'mg/dL'}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}

      </div>

      {/* PHASE 1, 2, & 3 MODALS */}
      <MedicalRecordModal
        open={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleSaveMedicalRecord}
        submitting={submitting}
      />

      <DeleteConfirmationModal
        open={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDeleteRecord}
        deleting={deletingRecord}
        recordName={recordToDelete?.recordName}
      />

      <RecordViewerModal
        open={Boolean(recordToView)}
        onClose={() => setRecordToView(null)}
        record={recordToView}
      />

      <VerificationModal
        open={Boolean(pendingVerificationMetrics)}
        onClose={() => setPendingVerificationMetrics(null)}
        metrics={pendingVerificationMetrics || []}
        onSaveVerified={handleSaveVerifiedMetrics}
      />

      <ManualBPModal
        open={isBPModalOpen}
        onClose={() => setIsBPModalOpen(false)}
        onSubmit={handleManualBPSubmit}
        submitting={submitting}
      />

      <ManualSugarModal
        open={isSugarModalOpen}
        onClose={() => setIsSugarModalOpen(false)}
        onSubmit={handleManualSugarSubmit}
        submitting={submitting}
      />

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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsIllnessModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? 'Saving...' : 'Save Record'}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsConsultModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? 'Saving...' : 'Save Consultation Log'}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? 'Updating...' : 'Update Client Profile'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
