import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, Send, User, Stethoscope, ArrowLeft, ShieldCheck, Lock, AlertTriangle, CheckCheck, Clock, FileText, X, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { chatService, AUTHORIZED_DOCTORS } from '../services/chatService'

export default function ChatPage() {
  const { user, profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [typingUser, setTypingUser] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [patientReport, setPatientReport] = useState(null)
  const messagesEndRef = useRef(null)

  const patientId = user?.uid || 'pat-101'
  const patientName = profile?.name || user?.email || 'Aarav Sharma'

  const filteredDoctors = AUTHORIZED_DOCTORS.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadReport = () => {
    const report = chatService.getPatientReport(patientId)
    setPatientReport(report)
  }

  const handleOpenChat = (doctor) => {
    setSelectedDoctor(doctor)
    setAuthError('')
    try {
      const conv = chatService.getOrCreateConversation({
        doctorId: doctor.id,
        patientId: patientId,
        doctorName: doctor.name,
        doctorSpec: doctor.specialization,
        patientName: patientName
      })
      setActiveConv(conv)

      const msgs = chatService.getConversationMessages(conv.id, { uid: patientId, role: 'patient' })
      setMessages(msgs)
      chatService.markAsRead(conv.id, patientId)
      loadReport()
    } catch (err) {
      console.error('Chat Authorization Error:', err.message)
      setAuthError(err.message)
      setMessages([])
    }
  }

  // Real-time listener subscription for active conversation and report updates
  useEffect(() => {
    if (!activeConv) return

    const unsubMsg = chatService.subscribeToConversation(activeConv.id, { uid: patientId, role: 'patient' }, (updatedMsgs) => {
      setMessages(updatedMsgs)
      chatService.markAsRead(activeConv.id, patientId)
      loadReport()
    })

    const unsubTyping = chatService.subscribeToTyping(activeConv.id, patientId, (typingData) => {
      if (typingData?.isTyping) {
        setTypingUser(typingData.senderName || 'Doctor')
      } else {
        setTypingUser('')
      }
    })

    return () => {
      unsubMsg()
      unsubTyping()
    }
  }, [activeConv, patientId])

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputMessage(text)
    if (activeConv) {
      chatService.sendTypingIndicator(activeConv.id, patientId, patientName, text.length > 0)
    }
  }

  const handleSendMessage = (e) => {
    e?.preventDefault()
    if (!inputMessage.trim() || !activeConv || !selectedDoctor) return

    try {
      chatService.sendTypingIndicator(activeConv.id, patientId, patientName, false)
      const newMsg = chatService.sendMessage(
        {
          conversationId: activeConv.id,
          text: inputMessage,
          senderId: patientId,
          senderRole: 'patient',
          senderName: patientName
        },
        { uid: patientId, role: 'patient' }
      )

      if (newMsg) {
        setMessages(prev => [...prev, newMsg])
        setInputMessage('')
      }
    } catch (err) {
      console.error('Send Error:', err.message)
      setAuthError(err.message)
    }
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
                💬 MY DOCTORS
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Direct real-time consultation messaging with your assigned medical practitioners
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <Lock className="h-3.5 w-3.5" /> End-to-End Real-Time Encrypted Thread
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* DOCTOR DIRECTORY PANEL */}
            <div className={`lg:col-span-5 space-y-4 ${selectedDoctor ? 'hidden lg:block' : 'block'}`}>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="space-y-3">
                {filteredDoctors.map(doctor => {
                  const convId = chatService.getConversationId(doctor.id, patientId)
                  let lastMsgSnippet = ''
                  let lastMsgTime = ''
                  try {
                    const convStore = JSON.parse(localStorage.getItem('sanjivni-demo-db-conversations') || '{}')
                    if (convStore[convId]) {
                      lastMsgSnippet = convStore[convId].lastMessage
                      lastMsgTime = convStore[convId].lastMessageTime ? new Date(convStore[convId].lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                    }
                  } catch {}

                  const isSelected = selectedDoctor?.id === doctor.id

                  return (
                    <Card
                      key={doctor.id}
                      className={`p-4 transition cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 ${
                        isSelected
                          ? 'border-2 border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/40'
                          : 'dark:border-slate-800 dark:bg-slate-900/80'
                      }`}
                      onClick={() => handleOpenChat(doctor)}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative">
                          <img
                            src={doctor.photo}
                            alt={doctor.name}
                            className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500/30"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {doctor.name}
                            </h3>
                            {lastMsgTime && (
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {lastMsgTime}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {doctor.specialization} • <span className="text-emerald-700 dark:text-emerald-300 font-bold">🟢 Online</span>
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {doctor.hospital}
                          </p>

                          {lastMsgSnippet ? (
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                              💬 "{lastMsgSnippet}"
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic mt-2">
                              No messages yet. Click Chat to begin.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          className="text-xs py-1.5 px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenChat(doctor)
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
            <div className={`lg:col-span-7 ${!selectedDoctor ? 'hidden lg:flex' : 'flex'} flex-col h-[75vh]`}>
              {selectedDoctor ? (
                <Card className="flex-1 flex flex-col p-0 overflow-hidden dark:border-slate-800 dark:bg-slate-900/90 shadow-lg">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-4 border-b bg-slate-100/70 dark:bg-slate-950/80 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedDoctor(null)}
                        className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <img
                          src={selectedDoctor.photo}
                          alt={selectedDoctor.name}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {selectedDoctor.name} <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">🟢 Online</span>
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {selectedDoctor.specialization} • {selectedDoctor.hospital}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          loadReport()
                          setShowReportModal(true)
                        }}
                        className="text-xs py-1.5 px-3 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <FileText className="h-3.5 w-3.5" /> [ 📋 VIEW MY REPORT ]
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
                        <MessageSquare className="h-10 w-10 mb-2 opacity-40 text-emerald-600" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No messages yet. Start your consultation chat below.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Real-time messaging active for {selectedDoctor.name}.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderRole === 'patient' || msg.senderId === patientId
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold">
                              <span>{isMe ? 'You' : msg.senderName}</span>
                              <span>•</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (
                                <span className="text-emerald-500 flex items-center gap-0.5 ml-1">
                                  {msg.readAt ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Check className="h-3.5 w-3.5" />}
                                  {msg.readAt ? 'Read' : 'Delivered'}
                                </span>
                              )}
                            </div>
                            <div
                              className={`max-w-[82%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-tr-none'
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
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl w-max border border-emerald-300">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>{typingUser} is typing...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t bg-white dark:bg-slate-900 dark:border-slate-800 flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Type message to ${selectedDoctor.name}...`}
                      value={inputMessage}
                      onChange={handleInputChange}
                      className="flex-1 text-xs"
                      disabled={!!authError}
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || !!authError}
                      className="text-xs px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" /> Send
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 border-dashed border-2 dark:border-slate-800 dark:bg-slate-900/40">
                  <Stethoscope className="h-12 w-12 text-emerald-600 mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Select a Doctor to Chat</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Choose an authorized doctor from your list on the left to open your real-time consultation thread.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* PATIENT CONSULTATION REPORT MODAL */}
          <Modal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            title="📋 SANJIVNIAI PATIENT CONSULTATION REPORT"
          >
            {patientReport && (
              <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
                {/* Status & Warning Notice */}
                {patientReport.isUpdatedAfterReview && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-400 text-amber-900 dark:text-amber-200 font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>⚠️ Patient Information Updated — Pending Doctor Re-Review</span>
                  </div>
                )}

                <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/60 border border-emerald-300">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Patient: {patientReport.patientName} ({patientReport.patientAge} yrs, {patientReport.patientGender})</p>
                  <p className="text-emerald-700 dark:text-emerald-400">Assigned Practitioner: {selectedDoctor?.name || 'Dr. Rahul Sharma'}</p>
                  <p className="text-slate-500 text-[11px] mt-1">Report Version: v{patientReport.version || 1} • Status: <span className="font-bold text-emerald-600">{patientReport.status}</span></p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">1. Original Complaint</h4>
                    <p className="text-slate-600 dark:text-slate-300">{patientReport.originalComplaint}</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">2. Symptoms & Duration</h4>
                    <p className="text-slate-600 dark:text-slate-300">Symptoms: {patientReport.symptoms}</p>
                    <p className="text-slate-600 dark:text-slate-300">Duration: {patientReport.duration}</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-2">3. Complete AI Questionnaire & Answers</h4>
                    <div className="space-y-2">
                      {patientReport.questionnaire.map(q => (
                        <div key={q.id} className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-[11px]">
                          <p className="font-bold text-slate-800 dark:text-slate-200">Q{q.id}: {q.text}</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Answer: {patientReport.answers[q.id] || 'Not answered'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">4. Questionnaire Summary</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{patientReport.questionnaireSummary}</p>
                  </div>

                  {patientReport.imageAnalysis?.uploaded && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">5. Image Analysis</h4>
                      <p className="text-slate-600 dark:text-slate-300">{patientReport.imageAnalysis.result}</p>
                    </div>
                  )}

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-1">6. AI Preliminary Analysis</h4>
                    <p className="text-slate-600 dark:text-slate-300">{patientReport.aiPreliminaryAnalysis}</p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                    <h4 className="font-bold text-red-900 dark:text-red-200 uppercase text-[11px] mb-1">7. Warning Signs & Urgency</h4>
                    <p className="text-red-700 dark:text-red-300">{patientReport.warningSigns}</p>
                    <p className="font-bold text-red-800 dark:text-red-200 mt-1">Urgency: {patientReport.aiAssistedUrgency}</p>
                  </div>

                  {/* Doctor Review Response Section */}
                  {patientReport.doctorReview ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 rounded-2xl border-2 border-emerald-500 space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                        <h4 className="font-black text-emerald-900 dark:text-emerald-100 uppercase text-xs">
                          👨‍⚕️ DOCTOR VERIFIED TREATMENT PLAN
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          Reviewed: {new Date(patientReport.doctorReview.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p><span className="font-bold">Practitioner:</span> {patientReport.doctorReview.doctorName}</p>
                      <p><span className="font-bold">Clinical Notes:</span> {patientReport.doctorReview.doctorNotes}</p>
                      <p><span className="font-bold">Assessment:</span> {patientReport.doctorReview.doctorAssessment}</p>
                      <p className="p-2.5 bg-white dark:bg-slate-900 rounded-xl font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-400">
                        💊 Prescription / Treatment: {patientReport.doctorReview.treatmentPrescription}
                      </p>
                      <p><span className="font-bold">Follow-up:</span> {patientReport.doctorReview.followUpInstructions}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 text-amber-900 dark:text-amber-200 italic">
                      Pending Practitioner Clinical Review. The assigned doctor will submit treatment recommendations after reviewing this intake.
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="secondary" onClick={() => setShowReportModal(false)} className="text-xs">
                    Close Report
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
