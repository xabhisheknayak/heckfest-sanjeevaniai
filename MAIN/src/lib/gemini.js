// Patient AI Services
export async function generateSymptomQuestions(symptoms) {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Unable to generate symptom questionnaire.')
  }
  return await response.json()
}

export async function analyzeSymptoms(symptoms, duration = '', medications = '') {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms, duration, medications, userRole: 'patient' }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Unable to analyze symptoms right now.')
  }
  return await response.json()
}

export async function analyzeImage(imageBase64, mimeType, fileName = '') {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, fileName, userRole: 'patient' }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Unable to analyze the image right now.')
  }
  return await response.json()
}

export async function chatWithAI(message, history = []) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, userRole: 'patient' }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Unable to chat with AI right now.')
  }
  const data = await response.json()
  return data.reply
}

// Doctor AI Services (Role Restricted to Doctor and Admin)
export async function callDoctorAI(task, payload = {}, role = 'doctor') {
  const response = await fetch('/api/doctor-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role
    },
    body: JSON.stringify({ task, payload, userRole: role }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Access Denied: Unauthorized to call Doctor AI service.')
  }
  return await response.json()
}

export async function analyzePatientSummary(patientName, symptoms = '', history = '', role = 'doctor') {
  return callDoctorAI('analyzePatientSummary', { patientName, symptoms, history }, role)
}

export async function summarizeMedicalHistory(historyEntries = [], role = 'doctor') {
  return callDoctorAI('summarizeMedicalHistory', { historyEntries }, role)
}

export async function generateConsultationNotes(symptoms, notes = '', role = 'doctor') {
  return callDoctorAI('generateConsultationNotes', { symptoms, notes }, role)
}

export async function suggestQuestions(patientCondition = '', role = 'doctor') {
  return callDoctorAI('suggestQuestions', { patientCondition }, role)
}

export async function generatePrescriptionDraft(diagnosis = '', patientDetails = {}, role = 'doctor') {
  return callDoctorAI('generatePrescriptionDraft', { diagnosis, patientDetails }, role)
}

// Admin AI Services (Role Restricted Strictly to Admin)
export async function callAdminAI(task, payload = {}, role = 'admin') {
  const response = await fetch('/api/admin-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role
    },
    body: JSON.stringify({ task, payload, userRole: role }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Access Denied: Unauthorized to access Admin Telemetry AI.')
  }
  return await response.json()
}

export async function generatePlatformSummary(metrics = {}, role = 'admin') {
  return callAdminAI('generatePlatformSummary', { metrics }, role)
}

export async function analyzeAppointmentTrends(appointmentData = [], role = 'admin') {
  return callAdminAI('analyzeAppointmentTrends', { appointmentData }, role)
}

export async function summarizeEmergencyActivity(sosEvents = [], role = 'admin') {
  return callAdminAI('summarizeEmergencyActivity', { sosEvents }, role)
}

export async function generateSystemReport(systemMetrics = {}, role = 'admin') {
  return callAdminAI('generateSystemReport', { systemMetrics }, role)
}
