import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, Send, User, ArrowLeft, ShieldCheck, Lock, AlertTriangle, Clock, Activity, FileText, Check, CheckCheck, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { chatService, AUTHORIZED_PATIENTS } from '../services/chatService'

export default function DoctorChatPage() {
  const { user, profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [typingUser, setTypingUser] = useState('')
  const [showDetailedReportModal, setShowDetailedReportModal] = useState(false)
  const [patientReport, setPatientReport] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    sec1: true, sec2: true, sec3: true, sec4: true, sec5: true, sec6: true,
    sec7: true, sec8: true, sec9: true, sec10: true, sec11: true, sec12: true, sec13: true
  })

  // Doctor Review Form state
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAssessment, setReviewAssessment] = useState('')
  const [reviewTreatment, setReviewTreatment] = useState('')
  const [reviewFollowUp, setReviewFollowUp] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const messagesEndRef = useRef(null)

  const doctorId = user?.uid || 'doc-1'
  const doctorName = profile?.name || 'Dr. Rahul Sharma'
  const doctorSpec = profile?.specialization || 'General Physician'

  const filteredPatients = AUTHORIZED_PATIENTS.filter(pat =>
    pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pat.condition.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadReport = (patientId) => {
    const report = chatService.getPatientReport(patientId || selectedPatient?.id || 'pat-101')
    setPatientReport(report)
    if (report.doctorReview) {
      setReviewNotes(report.doctorReview.doctorNotes || '')
      setReviewAssessment(report.doctorReview.doctorAssessment || '')
      setReviewTreatment(report.doctorReview.treatmentPrescription || '')
      setReviewFollowUp(report.doctorReview.followUpInstructions || '')
    }
  }

  const handleOpenChat = (patient) => {
    setSelectedPatient(patient)
    setAuthError('')
    try {
      const conv = chatService.getOrCreateConversation({
        doctorId: doctorId,
        patientId: patient.id,
        doctorName: doctorName,
        doctorSpec: doctorSpec,
        patientName: patient.name
      })
      setActiveConv(conv)

      const msgs = chatService.getConversationMessages(conv.id, { uid: doctorId, role: 'doctor' })
      setMessages(msgs)
      chatService.markAsRead(conv.id, doctorId)
      loadReport(patient.id)
    } catch (err) {
      console.error('Doctor Chat Authorization Error:', err.message)
      setAuthError(err.message)
      setMessages([])
    }
  }

  // Real-time listener subscription for active conversation
  useEffect(() => {
    if (!activeConv) return

    const unsubMsg = chatService.subscribeToConversation(activeConv.id, { uid: doctorId, role: 'doctor' }, (updatedMsgs) => {
      setMessages(updatedMsgs)
      chatService.markAsRead(activeConv.id, doctorId)
      loadReport(selectedPatient?.id)
    })

    const unsubTyping = chatService.subscribeToTyping(activeConv.id, doctorId, (typingData) => {
      if (typingData?.isTyping) {
        setTypingUser(typingData.senderName || 'Patient')
      } else {
        setTypingUser('')
      }
    })

    return () => {
      unsubMsg()
      unsubTyping()
    }
  }, [activeConv, doctorId, selectedPatient])

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputMessage(text)
    if (activeConv) {
      chatService.sendTypingIndicator(activeConv.id, doctorId, doctorName, text.length > 0)
    }
  }

  const handleSendMessage = (e) => {
    e?.preventDefault()
    if (!inputMessage.trim() || !activeConv || !selectedPatient) return

    try {
      chatService.sendTypingIndicator(activeConv.id, doctorId, doctorName, false)
      const newMsg = chatService.sendMessage(
        {
          conversationId: activeConv.id,
          text: inputMessage,
          senderId: doctorId,
          senderRole: 'doctor',
          senderName: doctorName
        },
        { uid: doctorId, role: 'doctor' }
      )

      if (newMsg) {
        setMessages(prev => [...prev, newMsg])
        setInputMessage('')
      }
    } catch (err) {
      console.error('Doctor Send Error:', err.message)
      setAuthError(err.message)
    }
  }

  // Submit Doctor Review
  const handleSubmitReview = (e) => {
    e?.preventDefault()
    if (!selectedPatient || !activeConv) return

    const updatedReport = chatService.submitDoctorReview(
      activeConv.id,
      selectedPatient.id,
      doctorName,
      {
        notes: reviewNotes,
        assessment: reviewAssessment,
        treatment: reviewTreatment,
        followUp: reviewFollowUp
      }
    )

    setPatientReport(updatedReport)
    setReviewSuccess('✓ Doctor Review and Prescription Plan successfully submitted!')
    setTimeout(() => setReviewSuccess(''), 4000)
  }

  const toggleAll = (expand) => {
    const newState = {}
    for (let i = 1; i <= 13; i++) {
      newState[`sec${i}`] = expand
    }
    setExpandedSections(newState)
  }

  const toggleSection = (secKey) => {
    setExpandedSections(prev => ({ ...prev, [secKey]: !prev[secKey] }))
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2.5">
                💬 MY PATIENTS
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Direct real-time clinical messaging threads with your assigned patients
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              <Lock className="h-3.5 w-3.5" /> Clinical Real-Time Encrypted Portal
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* PATIENT DIRECTORY PANEL */}
            <div className={`lg:col-span-5 space-y-4 ${selectedPatient ? 'hidden lg:block' : 'block'}`}>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search patients by name or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="space-y-3">
                {filteredPatients.map(patient => {
                  const convId = chatService.getConversationId(doctorId, patient.id)
                  let lastMsgSnippet = ''
                  let lastMsgTime = ''
                  let convStatus = 'Pending Doctor Review'
                  try {
                    const convStore = JSON.parse(localStorage.getItem('sanjivni-demo-db-conversations') || '{}')
                    if (convStore[convId]) {
                      lastMsgSnippet = convStore[convId].lastMessage
                      lastMsgTime = convStore[convId].lastMessageTime ? new Date(convStore[convId].lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                      convStatus = convStore[convId].status || 'Pending Doctor Review'
                    }
                  } catch {}

                  const isSelected = selectedPatient?.id === patient.id

                  return (
                    <Card
                      key={patient.id}
                      className={`p-4 transition cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 ${
                        isSelected
                          ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40'
                          : 'dark:border-slate-800 dark:bg-slate-900/80'
                      }`}
                      onClick={() => handleOpenChat(patient)}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <div className="rounded-2xl bg-indigo-100 dark:bg-indigo-950 p-3 text-indigo-700 dark:text-indigo-300 font-bold text-base flex items-center justify-center">
                            <User className="h-6 w-6" />
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {patient.name}
                            </h3>
                            {lastMsgTime && (
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {lastMsgTime}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                            <Activity className="h-3.5 w-3.5" /> {patient.condition}
                          </p>
                          <div className="mt-1">
                            {convStatus.includes('Updated') ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                ⚠️ {convStatus}
                              </span>
                            ) : convStatus.includes('Reviewed') ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                ✓ Reviewed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {convStatus}
                              </span>
                            )}
                          </div>

                          {lastMsgSnippet ? (
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                              💬 "{lastMsgSnippet}"
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic mt-2">
                              No messages yet. Click Chat to respond.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          className="text-xs py-1.5 px-4 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenChat(patient)
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> [ CHAT ]
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* CHAT CONVERSATION WINDOW */}
            <div className={`lg:col-span-7 ${!selectedPatient ? 'hidden lg:flex' : 'flex'} flex-col h-[75vh]`}>
              {selectedPatient ? (
                <Card className="flex-1 flex flex-col p-0 overflow-hidden dark:border-slate-800 dark:bg-slate-900/90 shadow-lg">
                  {/* CONSULTATION CONTEXT TOP BAR */}
                  <div className="p-3 bg-indigo-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-indigo-200">Patient:</span> <span className="font-black">{selectedPatient.name}</span>
                    </div>
                    <div>
                      <span className="text-indigo-200">Consultation ID:</span> <span className="font-mono font-bold bg-indigo-950 px-2 py-0.5 rounded">{activeConv?.id}</span>
                    </div>
                    <div>
                      {patientReport?.isUpdatedAfterReview ? (
                        <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] animate-pulse">
                          ⚠️ Updated — Doctor Review Required
                        </span>
                      ) : patientReport?.status === '✓ Reviewed' ? (
                        <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px]">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <span className="bg-slate-700 text-indigo-100 font-bold px-2 py-0.5 rounded text-[11px]">
                          Pending Doctor Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-slate-100/70 dark:bg-slate-950/80 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <div className="rounded-full bg-indigo-600 p-2 text-white font-bold text-xs">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {selectedPatient.name} <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">🟢 Online</span>
                        </h3>
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {selectedPatient.condition} • {selectedPatient.age} yrs ({selectedPatient.gender})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          loadReport(selectedPatient.id)
                          setShowDetailedReportModal(true)
                        }}
                        className="text-xs py-1.5 px-3 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                      >
                        <FileText className="h-3.5 w-3.5" /> [ 📋 VIEW DETAILED REPORT ]
                      </Button>
                    </div>
                  </div>

                  {/* Authorization Error Notice */}
                  {authError && (
                    <div className="m-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border-2 border-red-500 text-red-900 dark:text-red-200 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <MessageSquare className="h-10 w-10 mb-2 opacity-40 text-indigo-600" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No messages yet in this consultation thread.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Send a clinical response to {selectedPatient.name} below.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderRole === 'doctor' || msg.senderId === doctorId
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold">
                              <span>{isMe ? 'You (Doctor)' : msg.senderName}</span>
                              <span>•</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (
                                <span className="text-indigo-500 flex items-center gap-0.5 ml-1">
                                  {msg.readAt ? <CheckCheck className="h-3.5 w-3.5 text-indigo-400" /> : <Check className="h-3.5 w-3.5" />}
                                  {msg.readAt ? 'Read' : 'Delivered'}
                                </span>
                              )}
                            </div>
                            <div
                              className={`max-w-[82%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        )
                      })
                    )}

                    {/* Typing Indicator */}
                    {typingUser && (
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl w-max border border-indigo-300">
                        <User className="h-3.5 w-3.5" />
                        <span>{typingUser} is typing...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t bg-white dark:bg-slate-900 dark:border-slate-800 flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Type clinical response to ${selectedPatient.name}...`}
                      value={inputMessage}
                      onChange={handleInputChange}
                      className="flex-1 text-xs"
                      disabled={!!authError}
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || !!authError}
                      className="text-xs px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" /> Send
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 border-dashed border-2 dark:border-slate-800 dark:bg-slate-900/40">
                  <User className="h-12 w-12 text-indigo-600 mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Select a Patient to Chat</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Choose an authorized patient from your list on the left to open their real-time clinical thread.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* VIEW DETAILED PATIENT CONSULTATION REPORT MODAL */}
          <Modal
            isOpen={showDetailedReportModal}
            onClose={() => setShowDetailedReportModal(false)}
            title="📋 SANJIVNIAI DETAILED PATIENT CONSULTATION REPORT"
          >
            {patientReport && (
              <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
                {/* Status Notice */}
                {patientReport.isUpdatedAfterReview && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-500 text-amber-900 dark:text-amber-100 font-bold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                      <span>⚠️ Patient Information Updated — Doctor Re-Review Required</span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black">v{patientReport.version}</span>
                  </div>
                )}

                {/* Controls: Expand / Collapse All */}
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300">13 Detailed Report Sections</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleAll(true)} className="text-[11px] py-1 px-2.5">
                      <ChevronDown className="h-3 w-3 mr-1" /> Expand All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleAll(false)} className="text-[11px] py-1 px-2.5">
                      <ChevronUp className="h-3 w-3 mr-1" /> Collapse All
                    </Button>
                  </div>
                </div>

                {/* 13 REPORT SECTIONS */}
                <div className="space-y-2.5">
                  {/* Sec 1 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec1')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>1. Patient Information</span>
                      {expandedSections.sec1 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec1 && (
                      <div className="p-3 bg-white dark:bg-slate-950 space-y-1">
                        <p><span className="font-bold">Name:</span> {patientReport.patientName}</p>
                        <p><span className="font-bold">Age / Gender:</span> {patientReport.patientAge} yrs, {patientReport.patientGender}</p>
                        <p><span className="font-bold">Consultation ID:</span> {activeConv?.id}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 2 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec2')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>2. Original Complaint</span>
                      {expandedSections.sec2 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec2 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.originalComplaint}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 3 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec3')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>3. Symptoms</span>
                      {expandedSections.sec3 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec3 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.symptoms}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 4 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec4')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>4. Duration</span>
                      {expandedSections.sec4 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec4 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.duration}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 5 & 6 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec5')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>5 & 6. Complete Questionnaire & Every Answer</span>
                      {expandedSections.sec5 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec5 && (
                      <div className="p-3 bg-white dark:bg-slate-950 space-y-2">
                        {patientReport.questionnaire.map(q => (
                          <div key={q.id} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-[11px]">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Q{q.id}: {q.text}</p>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Answer: {patientReport.answers[q.id] || 'Not answered'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sec 7 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec7')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>7. Questionnaire Summary</span>
                      {expandedSections.sec7 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec7 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.questionnaireSummary}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 8 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec8')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>8. Image Analysis</span>
                      {expandedSections.sec8 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec8 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.imageAnalysis?.result || 'No image uploaded'}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 9 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec9')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>9. AI Preliminary Analysis</span>
                      {expandedSections.sec9 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec9 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.aiPreliminaryAnalysis}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 10 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec10')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>10. Warning Signs</span>
                      {expandedSections.sec10 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec10 && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200">
                        <p>{patientReport.warningSigns}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 11 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec11')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>11. AI-Assisted Urgency</span>
                      {expandedSections.sec11 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec11 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.aiAssistedUrgency}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 12 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleSection('sec12')} className="w-full p-3 bg-slate-100 dark:bg-slate-900 flex justify-between items-center font-bold">
                      <span>12. Recommended Specialist</span>
                      {expandedSections.sec12 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec12 && (
                      <div className="p-3 bg-white dark:bg-slate-950">
                        <p>{patientReport.recommendedSpecialist}</p>
                      </div>
                    )}
                  </div>

                  {/* Sec 13: DOCTOR REVIEW FORM */}
                  <div className="border-2 border-indigo-500 rounded-2xl overflow-hidden">
                    <button onClick={() => toggleSection('sec13')} className="w-full p-3 bg-indigo-900 text-white flex justify-between items-center font-bold">
                      <span>13. Doctor Clinical Review & Treatment Submission</span>
                      {expandedSections.sec13 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.sec13 && (
                      <form onSubmit={handleSubmitReview} className="p-4 bg-indigo-50/70 dark:bg-indigo-950/60 space-y-3">
                        {reviewSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2 border border-emerald-400">
                            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                            <span>{reviewSuccess}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Doctor Notes</label>
                          <textarea
                            rows={2}
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Enter clinical notes based on patient symptoms..."
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Doctor Assessment</label>
                          <Input
                            type="text"
                            value={reviewAssessment}
                            onChange={(e) => setReviewAssessment(e.target.value)}
                            placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
                            className="text-xs"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Treatment / Prescription Plan</label>
                          <textarea
                            rows={2}
                            value={reviewTreatment}
                            onChange={(e) => setReviewTreatment(e.target.value)}
                            placeholder="e.g. Tab Paracetamol 500mg TDS x 3 days, Steam inhalation, Hydration"
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Follow-up Instructions</label>
                          <Input
                            type="text"
                            value={reviewFollowUp}
                            onChange={(e) => setReviewFollowUp(e.target.value)}
                            placeholder="e.g. Review in OPD if fever persists beyond 72 hours"
                            className="text-xs"
                            required
                          />
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Button type="submit" className="text-xs px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> [ SUBMIT DOCTOR REVIEW ]
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="secondary" onClick={() => setShowDetailedReportModal(false)} className="text-xs">
                    Close Detailed Report
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  )
}
