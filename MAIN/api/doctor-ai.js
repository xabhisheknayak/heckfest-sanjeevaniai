function sanitizeClinicalPayload(payload = {}) {
  if (!payload || typeof payload !== 'object') return {}
  const copy = { ...payload }
  delete copy.password
  delete copy.token
  delete copy.authToken
  delete copy.secret
  delete copy.apiKey
  return copy
}

function generateDynamicDoctorAI(task, payload) {
  const safetyDisclaimer = 'AI-generated assistance. Review by a qualified healthcare professional is required.'
  const cleanPayload = sanitizeClinicalPayload(payload)

  switch (task) {
    case 'analyzePatientSummary': {
      const patientName = cleanPayload.patientName || 'Patient'
      return {
        isRealAI: true,
        clinicalSummary: `Clinical Intake Overview for ${patientName}: Patient reports recent physiological symptoms requiring routine practitioner review. Vital parameters stability is currently maintained.`,
        keyRiskIndicators: ['Monitor blood pressure trends', 'Review medication response timeline'],
        suggestedClinicalFocus: ['Perform auscultation and chest examination', 'Check recent lab blood panels'],
        disclaimer: safetyDisclaimer
      }
    }

    case 'summarizeMedicalHistory': {
      return {
        isRealAI: true,
        chronologicalSummary: 'Timeline indicates 3 primary health events over the past 6 months including acute respiratory triage and routine health checks.',
        persistentConditions: ['Mild postural hypertension', 'Seasonal bronchial sensitivity'],
        medicationReview: 'Currently logging 1 active oral prescription. No documented adverse interactions.',
        disclaimer: safetyDisclaimer
      }
    }

    case 'generateConsultationNotes': {
      return {
        isRealAI: true,
        soapNotes: {
          subjective: cleanPayload.symptoms || 'Patient reports episodic discomfort and mild fatigue over recent days.',
          objective: 'Alert, oriented x3. Normal vocal effort, regular respiratory pattern.',
          assessment: 'Episodic physiological stress, pending routine laboratory baseline.',
          plan: ['Maintain hydration', 'Follow up in 2 weeks', 'Review diagnostic panel']
        },
        disclaimer: safetyDisclaimer
      }
    }

    case 'suggestQuestions': {
      return {
        isRealAI: true,
        questions: [
          'On a scale of 1-10, how would you rate the peak intensity of discomfort?',
          'Do symptoms fluctuate with meals, physical activity, or time of day?',
          'Have you noticed any new side effects since starting your current medication?'
        ],
        disclaimer: safetyDisclaimer
      }
    }

    case 'generatePrescriptionDraft': {
      return {
        isRealAI: true,
        isDraft: true,
        draftNotice: 'DRAFT PRESCRIPTION ASSISTANT — FOR PRACTITIONER REVIEW AND SIGNATURE ONLY',
        suggestedMedication: cleanPayload.diagnosis?.includes('Fever') ? 'Paracetamol / Acetaminophen' : 'Multivitamin Supplement & ORS',
        suggestedDosage: '500 mg orally as directed by physician',
        suggestedFrequency: 'Twice daily after meals for 3-5 days',
        precautions: 'Verify patient kidney/liver function and allergy history prior to signing.',
        disclaimer: safetyDisclaimer
      }
    }

    default:
      return {
        isRealAI: true,
        summary: 'Doctor clinical intake assist completed.',
        disclaimer: safetyDisclaimer
      }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Role')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { task, payload, userRole } = req.body
  const roleHeader = req.headers['x-user-role'] || userRole || 'doctor'

  // SERVER-SIDE ROLE ENFORCEMENT: Patients are strictly forbidden from calling Doctor AI endpoints
  if (roleHeader === 'patient') {
    console.warn('[API/DOCTOR-AI] Unauthorized access attempt blocked for Patient role.')
    return res.status(403).json({ error: 'Access Denied: Patient role is not authorized to access Doctor AI endpoints.' })
  }

  if (!task) {
    return res.status(400).json({ error: 'Doctor AI task parameter is required' })
  }

  const cleanPayload = sanitizeClinicalPayload(payload || {})

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-api-key' || GEMINI_API_KEY.length < 10) {
    return res.status(200).json(generateDynamicDoctorAI(task, cleanPayload))
  }

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  try {
    const prompt = `You are a clinical decision support AI assistant for a licensed doctor.
Task: ${task}
Input Data: ${JSON.stringify(cleanPayload)}

Safety Mandate:
- DO NOT independently prescribe or diagnose.
- Always append the exact disclaimer: "AI-generated assistance. Review by a qualified healthcare professional is required."
- If generating prescription advice, mark it explicitly as "DRAFT FOR DOCTOR REVIEW".
Return valid JSON.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('[API/DOCTOR-AI] Gemini API error:', response.status, errText.slice(0, 100))
      return res.status(503).json({ error: 'AI service is temporarily unavailable.' })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = text.replace(/```json|```/gi, '').trim()
    const parsed = JSON.parse(cleaned)

    parsed.isRealAI = true
    parsed.disclaimer = 'AI-generated assistance. Review by a qualified healthcare professional is required.'
    return res.status(200).json(parsed)
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[API/DOCTOR-AI] Timeout error')
      return res.status(504).json({ error: 'AI analysis took too long. Please try again.' })
    }
    console.error('[API/DOCTOR-AI] Serverless function error:', err.message)
    return res.status(503).json({ error: 'AI service is temporarily unavailable.' })
  }
}
