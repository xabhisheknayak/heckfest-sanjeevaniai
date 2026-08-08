import { firestoreService } from './firestoreService.js'

const STORAGE_KEY_CONVERSATIONS = 'sanjivni-demo-db-conversations'
const STORAGE_KEY_MESSAGES = 'sanjivni-demo-db-messages'
const STORAGE_KEY_REPORTS = 'sanjivni-demo-db-reports'
const CHANNEL_NAME = 'sanjivni-realtime-chat-channel'

let realTimeChannel = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    realTimeChannel = new BroadcastChannel(CHANNEL_NAME)
  } catch (err) {
    console.warn('BroadcastChannel initialization fallback:', err)
  }
}

export const AUTHORIZED_DOCTORS = [
  { id: 'doc-1', name: 'Dr. Rahul Sharma', specialization: 'General Physician', hospital: 'Apollo Clinics', photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80', status: 'Online' },
  { id: 'doc-2', name: 'Dr. Ananya Singh', specialization: 'Dermatologist', hospital: 'Global Hospital', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80', status: 'Online' },
  { id: 'doc-3', name: 'Dr. Amit Kumar', specialization: 'ENT Specialist', hospital: 'Fortis Healthcare', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', status: 'Available' }
]

export const AUTHORIZED_PATIENTS = [
  { id: 'pat-101', name: 'Aarav Sharma', age: 32, gender: 'Male', condition: 'Viral Fever & Cough', lastVisit: 'Today' },
  { id: 'pat-102', name: 'Asha Patel', age: 34, gender: 'Female', condition: 'Migraine Triage', lastVisit: 'Yesterday' },
  { id: 'pat-103', name: 'Rajesh Sharma', age: 52, gender: 'Male', condition: 'Exertional Chest Pain', lastVisit: '2 days ago' }
]

function getLocalStore(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setLocalStore(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (err) {
    console.error('Storage save error:', err)
  }
}

const localSubscribers = new Set()

function broadcastEvent(type, payload) {
  const eventData = { type, payload, timestamp: Date.now() }
  if (realTimeChannel) {
    realTimeChannel.postMessage(eventData)
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sanjivni-chat-event', { detail: eventData }))
  }
  localSubscribers.forEach(callback => {
    try { callback(eventData) } catch (err) { console.warn('Subscriber listener error:', err) }
  })
}

// Initial default consultation report for demo patient pat-101
function createDefaultReport(patientId) {
  return {
    patientId: patientId || 'pat-101',
    patientName: 'Aarav Sharma',
    patientAge: 32,
    patientGender: 'Male',
    version: 1,
    status: 'Pending Doctor Review', // 'Pending Doctor Review' | '✓ Reviewed' | 'Updated — Doctor Review Required'
    isUpdatedAfterReview: false,
    originalComplaint: 'I have fever, dry cough and headache.',
    symptoms: 'Fever (101°F), Dry cough, Frontal headache, General body aches',
    duration: '3 days',
    questionnaire: [
      { id: 1, text: 'When did your symptoms first begin?', category: 'onset' },
      { id: 2, text: 'What is your current body temperature reading?', category: 'severity' },
      { id: 3, text: 'Is your cough dry, or do you produce sputum/phlegm?', category: 'respiratory' },
      { id: 4, text: 'Do you experience shortness of breath or difficulty breathing?', category: 'warning' },
      { id: 5, text: 'How would you rate the severity of your headache (1-10)?', category: 'severity' },
      { id: 6, text: 'Do you have sore throat or difficulty swallowing?', category: 'ent' },
      { id: 7, text: 'Have you had recent close contact with anyone having viral infection?', category: 'exposure' },
      { id: 8, text: 'Do you have any pre-existing medical conditions (e.g. Asthma, Diabetes)?', category: 'history' },
      { id: 9, text: 'Are you currently taking any prescription or OTC medications?', category: 'meds' },
      { id: 10, text: 'Are you experiencing any nausea, vomiting, or loss of appetite?', category: 'systemic' }
    ],
    answers: {
      1: '3 days ago (Sudden onset)',
      2: '101.2 °F measured this morning',
      3: 'Dry cough without phlegm',
      4: 'No shortness of breath',
      5: 'Moderate headache (5 out of 10)',
      6: 'Mild scratchiness in throat',
      7: 'Yes, colleague at work had flu',
      8: 'None (No chronic illness)',
      9: 'Took Paracetamol 500mg once yesterday',
      10: 'Mild loss of appetite'
    },
    questionnaireSummary: '32-year-old male with 3-day history of acute fever (101.2°F), dry cough, and headache following known workplace viral exposure.',
    imageAnalysis: {
      uploaded: true,
      result: 'IMAGE ANALYSIS: Visual inspection shows mild pharyngeal mucosa erythema without purulent exudates or skin lesions. Preliminary AI safety assessment: Non-acute presentation.'
    },
    aiPreliminaryAnalysis: 'Preliminary AI Observation: Acute viral upper respiratory tract infection (URTI) / influenza-like illness.',
    warningSigns: '⚠️ Red Flag Warning Signs: Temperature > 103°F, severe shortness of breath, chest pressure, persistent confusion, or blue lips require immediate emergency care.',
    aiAssistedUrgency: 'Moderate — Non-Emergency Consultation Recommended within 24 Hours',
    recommendedSpecialist: 'General Physician',
    doctorReview: null
  }
}

export const chatService = {
  getAuthorizedDoctorsForPatient(patientId) {
    return AUTHORIZED_DOCTORS
  },

  getAuthorizedPatientsForDoctor(doctorId) {
    return AUTHORIZED_PATIENTS
  },

  getConversationId(doctorId, patientId) {
    return `conv-${doctorId}-${patientId}`
  },

  getOrCreateConversation({ doctorId, patientId, doctorName, doctorSpec, patientName }) {
    const convId = this.getConversationId(doctorId, patientId)
    const store = getLocalStore(STORAGE_KEY_CONVERSATIONS)

    if (!store[convId]) {
      const newConv = {
        id: convId,
        doctorId,
        patientId,
        doctorName: doctorName || 'Practitioner',
        doctorSpec: doctorSpec || 'General Medicine',
        patientName: patientName || 'Patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Pending Doctor Review',
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0
      }
      store[convId] = newConv
      setLocalStore(STORAGE_KEY_CONVERSATIONS, store)
    }

    return store[convId]
  },

  getUserConversations(currentUser) {
    if (!currentUser) return []
    const store = getLocalStore(STORAGE_KEY_CONVERSATIONS)
    const convs = Object.values(store)

    const isDoc = currentUser.role === 'doctor' || currentUser.isDoctor
    const userId = currentUser.uid || currentUser.id

    return convs.filter(c => {
      if (isDoc) {
        return c.doctorId === userId || userId === 'doc-1' || userId === 'doctor'
      }
      return c.patientId === userId || userId === 'pat-101' || userId === 'patient' || !userId
    })
  },

  getConversationMessages(conversationId, currentUser) {
    if (!conversationId || !currentUser) {
      throw new Error('Authentication required to load conversation messages.')
    }

    const storeConvs = getLocalStore(STORAGE_KEY_CONVERSATIONS)
    const conv = storeConvs[conversationId]

    if (!conv) {
      throw new Error('Conversation not found.')
    }

    const currentUid = currentUser.uid || currentUser.id
    const isDoc = currentUser.role === 'doctor' || currentUser.isDoctor

    const isAuthorizedPatient = !isDoc && (conv.patientId === currentUid || currentUid === 'pat-101' || currentUid === 'patient' || !currentUid)
    const isAuthorizedDoctor = isDoc && (conv.doctorId === currentUid || currentUid === 'doc-1' || currentUid === 'doctor')

    if (!isAuthorizedPatient && !isAuthorizedDoctor) {
      console.warn(`[SECURITY DENIED] User ${currentUid} attempted to access conversation ${conversationId}`)
      throw new Error('Access Denied: You are not authorized to view this private doctor-patient conversation.')
    }

    const storeMsgs = getLocalStore(STORAGE_KEY_MESSAGES)
    const msgs = storeMsgs[conversationId] || []
    return msgs
  },

  sendMessage({ conversationId, text, senderId, senderRole, senderName }, currentUser) {
    if (!text || !text.trim()) return null

    this.getConversationMessages(conversationId, currentUser)

    const storeMsgs = getLocalStore(STORAGE_KEY_MESSAGES)
    const storeConvs = getLocalStore(STORAGE_KEY_CONVERSATIONS)

    const currentMsgs = storeMsgs[conversationId] || []
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      senderId,
      senderRole,
      senderName,
      message: text.trim(),
      createdAt: new Date().toISOString(),
      readAt: null,
      status: 'delivered'
    }

    const updatedMsgs = [...currentMsgs, newMsg]
    storeMsgs[conversationId] = updatedMsgs
    setLocalStore(STORAGE_KEY_MESSAGES, storeMsgs)

    if (storeConvs[conversationId]) {
      storeConvs[conversationId].lastMessage = text.trim()
      storeConvs[conversationId].lastMessageTime = new Date().toISOString()
      storeConvs[conversationId].updatedAt = new Date().toISOString()
      setLocalStore(STORAGE_KEY_CONVERSATIONS, storeConvs)
    }

    broadcastEvent('NEW_MESSAGE', { conversationId, message: newMsg })
    return newMsg
  },

  markAsRead(conversationId, readerId) {
    const storeMsgs = getLocalStore(STORAGE_KEY_MESSAGES)
    const msgs = storeMsgs[conversationId]
    if (!msgs || msgs.length === 0) return

    let updated = false
    const now = new Date().toISOString()
    const updatedMsgs = msgs.map(m => {
      if (m.senderId !== readerId && !m.readAt) {
        updated = true
        return { ...m, readAt: now, status: 'read' }
      }
      return m
    })

    if (updated) {
      storeMsgs[conversationId] = updatedMsgs
      setLocalStore(STORAGE_KEY_MESSAGES, storeMsgs)
      broadcastEvent('MESSAGES_READ', { conversationId, readerId })
    }
  },

  // GET PATIENT DETAILED CONSULTATION REPORT
  getPatientReport(patientId) {
    const pid = patientId || 'pat-101'
    const reportsStore = getLocalStore(STORAGE_KEY_REPORTS)

    if (!reportsStore[pid]) {
      reportsStore[pid] = createDefaultReport(pid)
      setLocalStore(STORAGE_KEY_REPORTS, reportsStore)
    }

    return reportsStore[pid]
  },

  // SUBMIT DOCTOR REVIEW & UPDATE CONVERSATION STATUS TO '✓ Reviewed'
  submitDoctorReview(conversationId, patientId, doctorName, reviewData) {
    const pid = patientId || 'pat-101'
    const reportsStore = getLocalStore(STORAGE_KEY_REPORTS)
    const convsStore = getLocalStore(STORAGE_KEY_CONVERSATIONS)

    const currentReport = reportsStore[pid] || createDefaultReport(pid)

    const updatedReview = {
      doctorName: doctorName || 'Dr. Rahul Sharma',
      doctorNotes: reviewData.notes || '',
      doctorAssessment: reviewData.assessment || '',
      treatmentPrescription: reviewData.treatment || '',
      followUpInstructions: reviewData.followUp || '',
      reviewedAt: new Date().toISOString()
    }

    currentReport.doctorReview = updatedReview
    currentReport.status = '✓ Reviewed'
    currentReport.isUpdatedAfterReview = false
    reportsStore[pid] = currentReport
    setLocalStore(STORAGE_KEY_REPORTS, reportsStore)

    if (convsStore[conversationId]) {
      convsStore[conversationId].status = '✓ Reviewed'
      convsStore[conversationId].updatedAt = new Date().toISOString()
      setLocalStore(STORAGE_KEY_CONVERSATIONS, convsStore)
    }

    broadcastEvent('DOCTOR_REVIEW_SUBMITTED', { conversationId, patientId, review: updatedReview })
    return currentReport
  },

  // UPDATE PATIENT ANSWERS & TRIGGER VERSIONING STATUS ('Updated — Doctor Review Required')
  updatePatientReportAnswers(patientId, newAnswers, newSymptoms) {
    const pid = patientId || 'pat-101'
    const reportsStore = getLocalStore(STORAGE_KEY_REPORTS)
    const convsStore = getLocalStore(STORAGE_KEY_CONVERSATIONS)

    const report = reportsStore[pid] || createDefaultReport(pid)

    const wasReviewed = report.status === '✓ Reviewed' || report.doctorReview !== null

    report.answers = { ...report.answers, ...newAnswers }
    if (newSymptoms) report.symptoms = newSymptoms
    report.version = (report.version || 1) + 1

    if (wasReviewed) {
      report.status = 'Updated — Doctor Review Required'
      report.isUpdatedAfterReview = true
    }

    reportsStore[pid] = report
    setLocalStore(STORAGE_KEY_REPORTS, reportsStore)

    // Update matching active conversations
    Object.keys(convsStore).forEach(convId => {
      if (convId.includes(pid)) {
        convsStore[convId].status = wasReviewed ? 'Updated — Doctor Review Required' : convsStore[convId].status
        convsStore[convId].updatedAt = new Date().toISOString()
      }
    })
    setLocalStore(STORAGE_KEY_CONVERSATIONS, convsStore)

    broadcastEvent('REPORT_UPDATED', { patientId, report })
    return report
  },

  sendTypingIndicator(conversationId, senderId, senderName, isTyping) {
    broadcastEvent('TYPING_STATUS', { conversationId, senderId, senderName, isTyping })
  },

  subscribeToConversation(conversationId, currentUser, onMessageCallback) {
    const handleEvent = (data) => {
      if (data?.payload?.conversationId === conversationId || data?.type === 'DOCTOR_REVIEW_SUBMITTED' || data?.type === 'REPORT_UPDATED') {
        try {
          const msgs = this.getConversationMessages(conversationId, currentUser)
          onMessageCallback(msgs)
        } catch (err) {
          console.warn('Real-time subscription auth error:', err.message)
        }
      }
    }

    localSubscribers.add(handleEvent)

    const channelHandler = (event) => {
      if (event?.data) handleEvent(event.data)
    }
    if (realTimeChannel) {
      realTimeChannel.addEventListener('message', channelHandler)
    }

    const customHandler = (e) => handleEvent(e.detail)
    if (typeof window !== 'undefined') {
      window.addEventListener('sanjivni-chat-event', customHandler)
    }

    const storageHandler = (e) => {
      if (e.key === STORAGE_KEY_MESSAGES || e.key === STORAGE_KEY_REPORTS || e.key === STORAGE_KEY_CONVERSATIONS) {
        try {
          const msgs = this.getConversationMessages(conversationId, currentUser)
          onMessageCallback(msgs)
        } catch {}
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', storageHandler)
    }

    return () => {
      localSubscribers.delete(handleEvent)
      if (realTimeChannel) {
        realTimeChannel.removeEventListener('message', channelHandler)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('sanjivni-chat-event', customHandler)
        window.removeEventListener('storage', storageHandler)
      }
    }
  },

  subscribeToTyping(conversationId, currentUserId, onTypingCallback) {
    const handleEvent = (eventData) => {
      if (
        eventData?.type === 'TYPING_STATUS' &&
        eventData?.payload?.conversationId === conversationId &&
        eventData?.payload?.senderId !== currentUserId
      ) {
        onTypingCallback(eventData.payload)
      }
    }

    localSubscribers.add(handleEvent)

    const channelHandler = (e) => handleEvent(e.data)
    if (realTimeChannel) {
      realTimeChannel.addEventListener('message', channelHandler)
    }

    const customHandler = (e) => handleEvent(e.detail)
    if (typeof window !== 'undefined') {
      window.addEventListener('sanjivni-chat-event', customHandler)
    }

    return () => {
      localSubscribers.delete(handleEvent)
      if (realTimeChannel) {
        realTimeChannel.removeEventListener('message', channelHandler)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('sanjivni-chat-event', customHandler)
      }
    }
  }
}
