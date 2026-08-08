import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, HeartPulse, Sparkles, Phone, Ambulance, AlertTriangle, ArrowLeft, CheckCircle2, RefreshCw, Check, Download, Share2, Calendar, FileText, User, Clock, ShieldCheck, Eye, X, Image as ImageIcon, Upload, Send, MessageSquare, ShieldAlert, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Toast } from '../components/ui/Toast'
import { generateSymptomQuestions, analyzeSymptoms, analyzeImage } from '../lib/gemini'
import { useAuth } from '../hooks/useAuth'
import { firestoreService } from '../services/firestoreService'

export default function SymptomCheckerPage() {
  const { user, profile } = useAuth()

  // Workflow Wizard Steps: 'intake' | 'questionnaire' | 'review' | 'results'
  const [step, setStep] = useState('intake')

  // Initial Inputs
  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('')
  const [medications, setMedications] = useState('')

  // Optional Image Upload State
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [imageMimeType, setImageMimeType] = useState('')
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null)
  const [imageError, setImageError] = useState('')

  // Dynamic Questionnaire State
  const [questions, setQuestions] = useState([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  // Analysis & Loading States
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isHighRiskWarning, setIsHighRiskWarning] = useState(false)
  const [reportTimestamp, setReportTimestamp] = useState('')

  // UI Modals & Actions
  const [showFullReportModal, setShowFullReportModal] = useState(false)
  const [showShareDoctorModal, setShowShareDoctorModal] = useState(false)
  const [showWhatsAppConfirmModal, setShowWhatsAppConfirmModal] = useState(false)
  const [showDemoDoctorResponseModal, setShowDemoDoctorResponseModal] = useState(false)

  // Demo Doctor Response State
  const [doctorResponse, setDoctorResponse] = useState(null)
  const [doctorForm, setDoctorForm] = useState({
    doctorNotes: 'Patient presents with reported symptoms and intake answers. Clinical presentation requires supportive care and observation.',
    diagnosis: 'Acute Upper Respiratory Irritation / Symptomatic Intake',
    medications: 'Paracetamol 500mg (if fever > 100°F), Warm saline gargle',
    dosage: '1 tablet twice daily after meals as needed',
    followUp: 'Follow-up in 3 days if symptoms worsen or fever persists'
  })

  const [shareSuccess, setShareSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Handle File Upload & Base64 conversion
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.')
      return
    }

    setError('')
    setImageFile(file)
    setImageMimeType(file.type)

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      const base64Clean = reader.result.split(',')[1]
      setImageBase64(base64Clean)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageBase64(null)
    setImageMimeType('')
    setImageAnalysisResult(null)
    setImageError('')
  }

  // Step 1: Start Intake & Fetch Dynamic AI Questions
  const handleStartQuestionnaire = async () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms first.')
      return
    }
    setError('')
    setLoading(true)
    setLoadingText('🤖 AI is understanding your symptoms & generating follow-up questions...')

    try {
      const res = await generateSymptomQuestions(symptoms)
      const qList = res.questions && res.questions.length > 0 ? res.questions : []
      setQuestions(qList)
      setCurrentQIndex(0)
      setAnswers({})
      setStep('questionnaire')
    } catch (err) {
      console.error('Question generation error:', err)
      setError('Unable to generate AI questionnaire right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Option Selection
  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }))
    setError('')
  }

  // Next Question with Validation
  const handleNextQuestion = () => {
    const currentQ = questions[currentQIndex]
    if (!answers[currentQ.id]) {
      setError('Please select an option before proceeding.')
      return
    }
    setError('')
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1)
    } else {
      setStep('review')
    }
  }

  const handlePrevQuestion = () => {
    setError('')
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1)
    }
  }

  // Jump to specific question from review screen
  const handleEditQuestion = (index) => {
    setCurrentQIndex(index)
    setStep('questionnaire')
  }

  // Step 4: Final Submission & Combined Health Report Generation
  const handleGenerateReport = async () => {
    setLoading(true)
    setLoadingText('🤖 AI is compiling your combined health report...')
    setError('')
    setImageError('')

    try {
      // 1. Analyze Symptoms + Questionnaire
      const structuredAnswersStr = Object.entries(answers)
        .map(([qId, ans]) => {
          const qObj = questions.find(q => q.id === Number(qId))
          return `[Q: ${qObj?.question || 'Question'}] -> Answer: ${ans}`
        })
        .join(' | ')

      const fullIntakeText = `Primary Symptoms: ${symptoms}. Intake Answers: ${structuredAnswersStr}`

      const symptomData = await analyzeSymptoms(fullIntakeText, duration, medications)
      setResult(symptomData)
      setReportTimestamp(new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))

      // 2. Perform Optional Image Analysis
      if (imageBase64) {
        setLoadingText('📷 AI is analyzing uploaded medical visual...')
        try {
          const imgData = await analyzeImage(imageBase64, imageMimeType, imageFile?.name || 'Uploaded Visual')
          setImageAnalysisResult(imgData)
        } catch (imgErr) {
          console.warn('Image analysis failed:', imgErr)
          setImageError('Image analysis is currently unavailable.')
        }
      }

      // Pre-fill Demo Doctor Form based on intake
      setDoctorForm({
        doctorNotes: `Reviewed intake for "${symptoms}". Clinical presentation aligns with preliminary observations. Maintain rest and monitor vitals.`,
        diagnosis: symptomData.possible_conditions?.[0] || 'Acute Symptomatic Presentation',
        medications: 'Paracetamol 500mg PRN for discomfort, Hydration',
        dosage: '1 tablet twice daily after meals as needed',
        followUp: 'Follow-up in 3 days if symptoms do not improve'
      })

      // High-Risk Emergency Detection
      const hasHighRiskAnswers = Object.values(answers).some(a =>
        /continuous|radiating|severe|chest|blood|blackout|unable|yes, severe|emergency/i.test(a)
      ) || symptomData.severity === 'high'

      setIsHighRiskWarning(hasHighRiskAnswers)
      setStep('results')

      // Save combined record to Firestore / LocalStorage
      if (user) {
        const combinedPayload = {
          patientSymptoms: symptoms,
          questionnaire: questions,
          answers: answers,
          imageAnalysis: imageBase64 ? { uploaded: true, fileName: imageFile?.name, result: imageAnalysisResult } : { uploaded: false },
          severity: symptomData.severity || 'low',
          ai_response: symptomData
        }

        try {
          const recordId = `record-${Date.now()}`
          await firestoreService.saveUserData('health_records', recordId, {
            uid: user.uid,
            symptoms: fullIntakeText,
            ai_response: combinedPayload,
            severity: symptomData.severity || 'low',
            createdAt: new Date().toISOString()
          })
        } catch {
          const key = `sanjivni-demo-db-health_records-record-${Date.now()}`
          const payload = {
            id: `record-${Date.now()}`,
            uid: user.uid,
            symptoms: fullIntakeText,
            ai_response: combinedPayload,
            severity: symptomData.severity || 'low',
            createdAt: new Date().toISOString()
          }
          localStorage.setItem(key, JSON.stringify(payload))
        }
      }
    } catch (err) {
      console.error('Report generation error:', err)
      setError('⚠️ AI service is temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetIntake = () => {
    setStep('intake')
    setSymptoms('')
    setDuration('')
    setMedications('')
    setImageFile(null)
    setImagePreview(null)
    setImageBase64(null)
    setImageMimeType('')
    setImageAnalysisResult(null)
    setImageError('')
    setQuestions([])
    setAnswers({})
    setResult(null)
    setDoctorResponse(null)
    setError('')
    setIsHighRiskWarning(false)
  }

  // Submit Demo Doctor Response
  const handleSubmitDemoDoctorResponse = () => {
    setDoctorResponse({
      doctorName: 'Dr. Ananya Mehta (SanjivniAI Demo Doctor)',
      license: 'MED-DEMO-79031',
      reviewedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      doctorNotes: doctorForm.doctorNotes,
      diagnosis: doctorForm.diagnosis,
      medications: doctorForm.medications,
      dosage: doctorForm.dosage,
      followUp: doctorForm.followUp,
      status: 'Reviewed'
    })
    setShowDemoDoctorResponseModal(false)
    setToastMessage('👨‍⚕️ Doctor consultation response submitted & verified!')
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Format concise Doctor-Ready Consultation Report Text
  const formatDoctorReportText = () => {
    const qText = questions.map((q, idx) => `Q${idx + 1}: ${q.question}\nAnswer: ${answers[q.id] || 'Not answered'}`).join('\n\n')

    return `-----------------------------------------
SANJIVNIAI PATIENT CONSULTATION REPORT
-----------------------------------------

Patient symptoms:
${symptoms}

Duration:
${duration || 'Not provided'}

Questionnaire:
${qText}

IMAGE ANALYSIS:
${imageBase64 ? `Image uploaded: Yes (${imageFile?.name})\nVisual Observations: ${imageAnalysisResult?.observations || 'Visual intake completed'}` : 'Image uploaded: No'}

PRELIMINARY AI OBSERVATIONS:
${result?.advice?.join('\n') || 'Routine supportive evaluation'}

POSSIBLE CONDITIONS TO DISCUSS:
${result?.possible_conditions?.join(', ') || 'N/A'}

WARNING SIGNS:
${result?.warning_signs?.join(', ') || 'None reported'}

URGENCY:
${result?.urgency || 'Routine clinical review'}

RECOMMENDED SPECIALIST:
${result?.recommended_specialist || 'General Practitioner'}

AI DISCLAIMER:
AI-generated preliminary assistance.
This is not a medical diagnosis.
A qualified healthcare professional must review this information.
-----------------------------------------`
  }

  // Format Pre-filled WhatsApp Consultation Message
  const formatWhatsAppMessage = () => {
    const importantAnswers = Object.entries(answers)
      .map(([qId, ans]) => {
        const qObj = questions.find(q => q.id === Number(qId))
        return `• ${qObj?.question || 'Question'}: ${ans}`
      })
      .slice(0, 4)
      .join('\n')

    return `Hello Doctor,

I would like to request a consultation through SanjivniAI.

Patient Symptoms:
${symptoms}

Duration:
${duration || 'Not provided'}

Important Responses:
${importantAnswers}

AI Preliminary Observations:
${result?.advice?.join(', ') || 'Preliminary intake complete'}

Image Analysis:
${imageBase64 ? `Image uploaded (${imageFile?.name || 'Medical Visual'})` : 'No image attached'}

Urgency:
${result?.urgency || 'Routine clinical review'}

Please review the information and provide medical guidance.

SanjivniAI`
  }

  // Open Pre-filled WhatsApp Window
  const handleConfirmOpenWhatsApp = () => {
    const phone = '917903119301'
    const messageText = formatWhatsAppMessage()
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`

    window.open(waUrl, '_blank')
    setShowWhatsAppConfirmModal(false)
    setToastMessage('WhatsApp consultation opened.')
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle Share With Doctor Execution
  const handleConfirmShareWithDoctor = () => {
    const reportText = formatDoctorReportText()

    if (navigator.share) {
      navigator.share({
        title: 'SanjivniAI Patient Consultation Report',
        text: reportText
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(reportText)
    }

    setShareSuccess(true)
    setTimeout(() => {
      setShareSuccess(false)
      setShowShareDoctorModal(false)
      setToastMessage('Doctor Consultation Report formatted and shared successfully!')
      setTimeout(() => setToastMessage(''), 4000)
    }, 1500)
  }

  const handleDownloadReport = () => {
    setShowFullReportModal(true)
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const currentQ = questions[currentQIndex]
  const progressPercent = questions.length > 0 ? Math.round(((currentQIndex + 1) / questions.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        {/* Header Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A]">AI Guided Health Assessment</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Intelligent Symptom & Visual Intake</h1>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Describe your symptoms and optionally attach medical images to receive a comprehensive AI health assessment.
          </p>
        </motion.div>

        {/* STEP 1: INITIAL SYMPTOM & OPTIONAL IMAGE INTAKE */}
        {step === 'intake' && (
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 shadow-md">
            <div className="mb-6 flex items-center gap-3 border-b pb-4 dark:border-slate-800">
              <div className="rounded-2xl bg-[#DCFCE7] p-2.5 text-[#16A34A] dark:bg-emerald-950/40">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Step 1: Describe What You Are Experiencing</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter symptoms and optionally attach photos (rash, lab result, scan)</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Symptoms <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="e.g. I have fever, headache and cough for 2 days..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Symptom Duration (Optional)"
                  placeholder="e.g. 2 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <Input
                  label="Recent Medications (Optional)"
                  placeholder="e.g. Paracetamol, Vitamin C"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                />
              </div>

              {/* OPTIONAL MEDICAL IMAGE UPLOAD */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-emerald-600" />
                    Attach Medical Photo or Document (Optional)
                  </span>
                  <span className="text-[11px] text-slate-400">Skin rash, X-Ray, Lab report (Max 5MB)</span>
                </div>

                {imagePreview ? (
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <img src={imagePreview} alt="Medical Upload Preview" className="h-16 w-16 object-cover rounded-lg border" />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{imageFile?.name}</p>
                      <p className="text-slate-500 text-[11px]">{(imageFile?.size / 1024).toFixed(1)} KB • Image attached</p>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Click to upload medical image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button
                className="w-full py-3 text-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleStartQuestionnaire}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> {loadingText}
                  </>
                ) : (
                  <>
                    Next: Start Guided AI Questionnaire <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: DYNAMIC QUESTIONNAIRE WIZARD */}
        {step === 'questionnaire' && currentQ && (
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 shadow-md">
            <div className="border-b pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Let's understand your symptoms better
                </span>
                <span className="font-semibold text-slate-500">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-right font-semibold text-slate-500 mt-1">Progress: {progressPercent}%</p>
            </div>

            <div className="my-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentQIndex + 1}. {currentQ.question}
              </h3>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === opt
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      className={`w-full flex items-center justify-between rounded-2xl border p-3.5 text-xs font-semibold transition text-left cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-sm'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400'}`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4 dark:border-slate-800">
              <Button
                variant="secondary"
                onClick={handlePrevQuestion}
                disabled={currentQIndex === 0}
                className="text-xs gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </Button>

              <Button
                onClick={handleNextQuestion}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {currentQIndex === questions.length - 1 ? (
                  <>
                    Review Answers <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: REVIEW ANSWERS & ATTACHMENTS */}
        {step === 'review' && (
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 shadow-md">
            <div className="border-b pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Please review your answers</h2>
              <p className="text-xs text-slate-500">Verify your responses before submitting for AI health report synthesis</p>
            </div>

            {/* Optional Image Attachment Preview */}
            {imagePreview && (
              <div className="my-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900 dark:bg-emerald-950/30 flex items-center gap-3 text-xs">
                <img src={imagePreview} alt="Attached Visual" className="h-12 w-12 object-cover rounded-lg border" />
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">Attached Medical Visual: {imageFile?.name}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">Will be analyzed alongside your intake responses</p>
                </div>
              </div>
            )}

            <div className="my-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950 text-xs flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Q{idx + 1}: {q.question}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                      Selected: "{answers[q.id] || 'Not answered'}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditQuestion(idx)}
                    className="shrink-0 rounded-xl border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setStep('questionnaire')} className="text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Questionnaire
              </Button>

              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="text-xs py-3 px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> {loadingText}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> GENERATE COMBINED HEALTH REPORT
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: COMBINED STRUCTURED AI HEALTH REPORT */}
        {step === 'results' && result && (
          <div className="space-y-6">
            {/* EMERGENCY SAFETY WARNING BANNER */}
            {isHighRiskWarning && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border-2 border-red-500 bg-red-50 p-6 dark:border-red-600 dark:bg-red-950/60 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-red-600 p-3 text-white shadow">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                      Some of your responses may require urgent medical attention.
                    </h3>
                    <p className="mt-1 text-xs text-red-800 dark:text-red-200 leading-relaxed">
                      If you are experiencing severe chest discomfort, sudden shortness of breath, high fever, or loss of consciousness, do not rely solely on online advice.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a href="tel:102" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition">
                        <Phone className="h-4 w-4" /> CALL EMERGENCY SERVICES (102 / 911)
                      </a>
                      <Link to="/emergency" className="inline-flex items-center gap-2 rounded-xl border border-red-400 bg-white px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 dark:bg-slate-900 dark:text-red-300 dark:border-red-800 transition">
                        <Ambulance className="h-4 w-4" /> EMERGENCY SOS
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE 6: SUBMITTED DOCTOR RESPONSE DISPLAY CARD */}
            {doctorResponse && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 border-2 border-indigo-500 bg-indigo-50/60 dark:border-indigo-600 dark:bg-indigo-950/40 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                          👨‍⚕️ Doctor Response
                        </h3>
                        <p className="text-xs text-indigo-800 dark:text-indigo-300">
                          {doctorResponse.doctorName} • License: {doctorResponse.license}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Doctor Review Status: Reviewed
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl bg-white p-3.5 dark:bg-slate-900 border space-y-1">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Doctor's Clinical Notes</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{doctorResponse.doctorNotes}</p>
                    </div>

                    <div className="rounded-xl bg-white p-3.5 dark:bg-slate-900 border space-y-1">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Primary Diagnosis</p>
                      <p className="text-indigo-900 dark:text-indigo-300 font-bold">{doctorResponse.diagnosis}</p>
                    </div>

                    <div className="rounded-xl bg-white p-3.5 dark:bg-slate-900 border space-y-1">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Treatment / Medication Instructions</p>
                      <p className="text-slate-800 dark:text-slate-200 font-bold">{doctorResponse.medications}</p>
                      <p className="text-slate-500 text-[11px]">Dosage: {doctorResponse.dosage}</p>
                    </div>

                    <div className="rounded-xl bg-white p-3.5 dark:bg-slate-900 border space-y-1">
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Follow-Up Instructions</p>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">{doctorResponse.followUp}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic border-t pt-2 dark:border-slate-800">
                    Demo doctor consultation response — for demonstration purposes only. Practitioner verification required before clinical decision making.
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Health Report Card */}
            <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#DCFCE7] p-2.5 text-[#16A34A] dark:bg-emerald-950/40">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      SANJIVNIAI PRELIMINARY HEALTH REPORT
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Combined intake synthesis: Symptoms + Questionnaire + Image Analysis</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowDemoDoctorResponseModal(true)}
                    className="text-xs py-1.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <Stethoscope className="h-3.5 w-3.5" /> [ DEMO DOCTOR REVIEW ]
                  </Button>
                  <Button variant="secondary" onClick={handleResetIntake} className="text-xs py-1.5">
                    Start New Intake
                  </Button>
                </div>
              </div>

              {/* REPORT SECTIONS 1 to 5: PATIENT METADATA & INTAKE */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">1. Patient Information</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <User className="h-4 w-4 text-emerald-600" />
                    {profile?.name || user?.email || 'Anonymous Patient'}
                  </p>
                  <p className="text-slate-500">Age: <span className="font-semibold text-slate-700 dark:text-slate-300">Not provided</span></p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">2. Report Date & Time</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    {reportTimestamp}
                  </p>
                  <p className="text-slate-500">Status: <span className="font-semibold text-emerald-600">Generated & Saved</span></p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">3. Primary Reported Symptoms</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">"{symptoms}"</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">4. Symptom Duration & Medications</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    Duration: <span className="font-semibold">{duration || 'Not provided'}</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    Recent Medications: <span className="font-semibold">{medications || 'Not provided'}</span>
                  </p>
                </div>
              </div>

              {/* REPORT SECTION 5: QUESTIONNAIRE RESPONSES */}
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">5. Patient Questionnaire Responses (10 Intake Questions)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border text-[11px]">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Q{i + 1}: {q.question}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Answer: "{answers[q.id] || 'Not provided'}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMBINED REPORT SECTION: IMAGE ANALYSIS */}
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-emerald-600" />
                  IMAGE ANALYSIS
                </p>

                {imageBase64 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {imagePreview && (
                        <img src={imagePreview} alt="Uploaded Visual Thumbnail" className="h-16 w-16 object-cover rounded-xl border shadow-sm" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Image uploaded: <span className="text-emerald-600">Yes ({imageFile?.name})</span></p>
                        <p className="text-slate-500 text-[11px]">Visual analysis synthesized into clinical intake protocol</p>
                      </div>
                    </div>

                    {imageError ? (
                      <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-900 dark:bg-red-950/40">
                        {imageError}
                      </div>
                    ) : imageAnalysisResult ? (
                      <div className="rounded-xl bg-white p-3.5 dark:bg-slate-900 border space-y-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200">AI Visual Observations:</p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{imageAnalysisResult.observations}</p>

                        {imageAnalysisResult.possibleIssues && (
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 mt-2">Possible Visual Issues Identified:</p>
                            <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400">
                              {imageAnalysisResult.possibleIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400 italic pt-1 border-t dark:border-slate-800">
                          Preliminary AI image analysis — This analysis is not a medical diagnosis and should be reviewed by a qualified healthcare professional.
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Processing visual intake...</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Image uploaded: <span className="font-semibold">No (Optional step skipped)</span></p>
                )}
              </div>

              {/* REPORT SECTIONS 6 to 11: CLINICAL ANALYSIS */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                {/* 8. Severity / Urgency */}
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">8. Severity & Urgency Assessment</p>
                  <p className={`text-xl font-black mt-1 uppercase ${
                    result.severity === 'high' ? 'text-red-600' : result.severity === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {result.severity || 'Low'}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{result.urgency || 'Routine clinical consultation'}</p>
                </div>

                {/* 10. Recommended Specialist */}
                <div className="rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[10px]">10. Recommended Medical Specialist</p>
                  <p className="text-base font-bold text-emerald-800 dark:text-emerald-200 mt-1">{result.recommended_specialist || 'General Practitioner'}</p>
                </div>
              </div>

              {/* 7. Possible Conditions to Discuss */}
              {result.possible_conditions && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">7. Possible Conditions to Discuss With Doctor</p>
                  <div className="flex flex-wrap gap-2">
                    {result.possible_conditions.map((cond, i) => (
                      <span key={i} className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. Warning Signs */}
              {result.warning_signs && (
                <div className="rounded-2xl bg-amber-50/70 p-4 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10px] mb-1">9. Warning Signs & Clinical Indicators</p>
                  <ul className="list-disc pl-4 text-amber-800 dark:text-amber-400 space-y-0.5">
                    {result.warning_signs.map((sign, i) => (
                      <li key={i}>{sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 11. Suggested Next Steps */}
              {result.advice && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">11. Suggested Next Steps & Supportive Care</p>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {result.advice.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 italic text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Note: A qualified doctor should determine whether medication or diagnostic testing is appropriate.</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* 12. AI Disclaimer */}
              <div className="border-t pt-4 text-[11px] text-slate-400 italic">
                {result.disclaimer || 'AI assistance only, not medical diagnosis. Verify before making clinical decisions.'}
              </div>

              {/* DEMO DOCTOR WHATSAPP CONSULTATION CARD */}
              <div className="rounded-3xl border-2 border-emerald-500 bg-[#F0FDF4] p-5 dark:border-emerald-600 dark:bg-emerald-950/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-2xl bg-emerald-600 p-2 text-white">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                        👨‍⚕️ DEMO DOCTOR CONSULTATION
                      </h3>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        Doctor: <span className="font-bold">SanjivniAI Demo Doctor</span> • Contact: <span className="font-bold">WhatsApp (+91 7903119301)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Open a pre-filled WhatsApp consultation message directly with the SanjivniAI Demo Doctor.
                </p>

                <Button
                  onClick={() => setShowWhatsAppConfirmModal(true)}
                  className="w-full py-2.5 text-xs font-bold gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow"
                >
                  <MessageSquare className="h-4 w-4" /> [ SEND REPORT ON WHATSAPP ]
                </Button>
              </div>

              {/* REPORT ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2.5 pt-2 border-t dark:border-slate-800">
                <Button variant="secondary" onClick={() => setShowFullReportModal(true)} className="text-xs gap-1.5 py-2.5">
                  <Eye className="h-4 w-4 text-emerald-600" /> [ VIEW FULL REPORT ]
                </Button>

                <Button variant="secondary" onClick={handleDownloadReport} className="text-xs gap-1.5 py-2.5">
                  <Download className="h-4 w-4 text-sky-600" /> [ DOWNLOAD REPORT ]
                </Button>

                <Button variant="secondary" onClick={() => setShowShareDoctorModal(true)} className="text-xs gap-1.5 py-2.5">
                  <Share2 className="h-4 w-4 text-purple-600" /> [ SHARE WITH DOCTOR ]
                </Button>

                <Link to="/booking" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                  <Calendar className="h-4 w-4" /> [ START DOCTOR CONSULTATION ]
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* FULL REPORT PRINTABLE / MODAL VIEW */}
        <AnimatePresence>
          {showFullReportModal && result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl">
                <Card className="p-6 border-emerald-300 dark:border-emerald-900 shadow-2xl max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase">
                        SANJIVNIAI PRELIMINARY HEALTH REPORT (FULL VIEW)
                      </h3>
                    </div>
                    <button onClick={() => setShowFullReportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="my-4 space-y-4 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950 border space-y-1">
                      <p><strong>Patient:</strong> {profile?.name || user?.email || 'Anonymous Patient'}</p>
                      <p><strong>Report Timestamp:</strong> {reportTimestamp}</p>
                      <p><strong>Primary Symptoms:</strong> "{symptoms}"</p>
                      <p><strong>Duration:</strong> {duration || 'Not provided'}</p>
                      <p><strong>Medications:</strong> {medications || 'Not provided'}</p>
                      <p><strong>Image Uploaded:</strong> {imageBase64 ? `Yes (${imageFile?.name})` : 'No'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">10 Intake Questionnaire Responses:</p>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {questions.map((q, i) => (
                          <div key={q.id} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900 text-[11px]">
                            <p className="font-semibold">Q{i + 1}: {q.question}</p>
                            <p className="text-emerald-700 dark:text-emerald-400">Answer: {answers[q.id] || 'Not provided'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {imageAnalysisResult && (
                      <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900 border space-y-1">
                        <p className="font-bold">Image Observations:</p>
                        <p>{imageAnalysisResult.observations}</p>
                      </div>
                    )}

                    <div className="rounded-xl bg-emerald-50/70 p-3.5 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                      <p><strong>Severity / Urgency:</strong> {result.severity?.toUpperCase() || 'LOW'} ({result.urgency})</p>
                      <p><strong>Recommended Specialist:</strong> {result.recommended_specialist || 'General Practitioner'}</p>
                      <p><strong>Possible Conditions to Discuss:</strong> {result.possible_conditions?.join(', ') || 'N/A'}</p>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-400 italic">
                      {result.disclaimer || 'AI assistance only, not medical diagnosis. Verify before making clinical decisions.'}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                    <Button variant="secondary" onClick={() => setShowFullReportModal(false)} className="text-xs">
                      Close Full View
                    </Button>
                    <Button onClick={() => window.print()} className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="h-3.5 w-3.5" /> Print / Save PDF
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PHASE 4: DOCTOR-READY CONSULTATION REPORT SHARE MODAL */}
        <AnimatePresence>
          {showShareDoctorModal && result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl">
                <Card className="p-6 border-purple-300 dark:border-purple-900 shadow-2xl max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-purple-600" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase">
                        SANJIVNIAI PATIENT CONSULTATION REPORT
                      </h3>
                    </div>
                    <button onClick={() => setShowShareDoctorModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="my-4 font-mono text-[11px] bg-slate-900 text-slate-100 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {formatDoctorReportText()}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800">
                    <Button variant="ghost" onClick={() => setShowShareDoctorModal(false)} className="text-xs text-slate-500">
                      [ CANCEL ]
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setShowFullReportModal(true)} className="text-xs">
                        [ REVIEW REPORT ]
                      </Button>

                      <Button onClick={handleConfirmShareWithDoctor} disabled={shareSuccess} className="text-xs gap-1.5 bg-purple-700 hover:bg-purple-800 text-white">
                        {shareSuccess ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Shared & Sent!
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" /> [ SHARE WITH DOCTOR ]
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PHASE 5: WHATSAPP PATIENT CONFIRMATION SAFEGUARD MODAL */}
        <AnimatePresence>
          {showWhatsAppConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
                <Card className="p-6 border-emerald-500 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3 border-b pb-3 dark:border-slate-800">
                    <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">Confirm WhatsApp Consultation</h3>
                      <p className="text-[11px] text-slate-500">SanjivniAI Patient Privacy Safeguard</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 p-3 rounded-xl dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    "Your report contains health information. Please confirm that you want to share it with the doctor."
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p>• Demo Doctor Phone: <span className="font-bold text-slate-800 dark:text-slate-200">+91 7903119301</span></p>
                    <p>• WhatsApp app or WhatsApp Web will be launched with a pre-filled draft message.</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-slate-800">
                    <Button variant="secondary" onClick={() => setShowWhatsAppConfirmModal(false)} className="text-xs">
                      [ CANCEL ]
                    </Button>

                    <Button onClick={handleConfirmOpenWhatsApp} className="text-xs gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold">
                      <MessageSquare className="h-3.5 w-3.5" /> [ CONFIRM & OPEN WHATSAPP ]
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PHASE 6: DEMO DOCTOR RESPONSE EDITOR MODAL */}
        <AnimatePresence>
          {showDemoDoctorResponseModal && result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl">
                <Card className="p-6 border-indigo-500 dark:border-indigo-900 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-2xl bg-indigo-600 p-2 text-white">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase">
                          DEMO DOCTOR CONSULTATION RESPONSE PORTAL
                        </h3>
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          Demo doctor consultation — for demonstration purposes only.
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setShowDemoDoctorResponseModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Summary of Incoming Patient Intake */}
                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950 border text-xs space-y-1">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Patient Intake Context</p>
                    <p><strong>Primary Symptoms:</strong> "{symptoms}"</p>
                    <p><strong>Duration:</strong> {duration || 'Not provided'}</p>
                    <p><strong>AI Severity Assessment:</strong> {result.severity?.toUpperCase() || 'LOW'} ({result.urgency})</p>
                    {imageBase64 && <p><strong>Image Visual Uploaded:</strong> Yes ({imageFile?.name})</p>}
                  </div>

                  {/* Editable Response Form */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Doctor Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                        value={doctorForm.doctorNotes}
                        onChange={(e) => setDoctorForm({ ...doctorForm, doctorNotes: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Primary Clinical Diagnosis"
                        value={doctorForm.diagnosis}
                        onChange={(e) => setDoctorForm({ ...doctorForm, diagnosis: e.target.value })}
                      />
                      <Input
                        label="Prescription / Medications"
                        value={doctorForm.medications}
                        onChange={(e) => setDoctorForm({ ...doctorForm, medications: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Dosage & Frequency"
                        value={doctorForm.dosage}
                        onChange={(e) => setDoctorForm({ ...doctorForm, dosage: e.target.value })}
                      />
                      <Input
                        label="Follow-Up Instructions"
                        value={doctorForm.followUp}
                        onChange={(e) => setDoctorForm({ ...doctorForm, followUp: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800">
                    <Button variant="secondary" onClick={() => setShowDemoDoctorResponseModal(false)} className="text-xs">
                      [ CANCEL ]
                    </Button>

                    <Button onClick={handleSubmitDemoDoctorResponse} className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      <CheckCircle2 className="h-4 w-4" /> [ SUBMIT DOCTOR RESPONSE & SIGN ]
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {toastMessage && (
          <div className="mt-6">
            <Toast title="Health Report Action" message={toastMessage} tone="success" />
          </div>
        )}
      </div>
    </div>
  )
}
