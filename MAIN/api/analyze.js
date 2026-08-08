function generateDynamicSymptomAnalysis(symptoms = '', duration = '', medications = '') {
  const text = `${symptoms} ${duration} ${medications}`.toLowerCase()

  // Cardiac / High emergency symptoms
  if (/chest pain|shortness of breath|breathless|heart pressure|arm numbness|dizziness|fainting|stroke/i.test(text)) {
    return {
      possible_conditions: ['Acute Cardiorespiratory Stress', 'Angina or Ischemic Indicator', 'Hypertensive Episode'],
      severity: 'high',
      urgency: 'Immediate Emergency Care Required (Call 102 / 911)',
      recommended_specialist: 'Cardiologist / Emergency Medicine',
      advice: [
        'Seek immediate emergency clinical evaluation',
        'Avoid physical strain or exertion',
        'Have someone remain with you while emergency response arrives'
      ],
      warning_signs: ['Radiating arm or jaw pain', 'Severe sudden shortness of breath', 'Loss of consciousness'],
      disclaimer: 'AI assistance only, not medical diagnosis. (Emergency Triage Protocol Active)'
    }
  }

  // Respiratory / Flu / Cough symptoms
  if (/fever|cough|sore throat|flu|cold|chills|phlegm|runny nose|congestion/i.test(text)) {
    return {
      possible_conditions: ['Upper Respiratory Tract Infection', 'Seasonal Influenza', 'Viral Bronchial Irritation'],
      severity: 'medium',
      urgency: 'Medical consultation within 24-48 hours',
      recommended_specialist: 'General Physician / Pulmonologist',
      advice: [
        'Maintain high hydration with warm fluids',
        'Rest and monitor temperature fluctuations',
        duration ? `Track symptoms reported for duration: ${duration}` : 'Log temperature morning and evening'
      ],
      warning_signs: ['High persistent fever over 102°F', 'Difficulty breathing', 'Bluish lips or nails'],
      disclaimer: 'AI assistance only, not medical diagnosis. (Respiratory Triage Active)'
    }
  }

  // Dermatological / Skin symptoms
  if (/skin|rash|itch|redness|hives|swelling|bump|allergy|eczema|spot/i.test(text)) {
    return {
      possible_conditions: ['Contact Dermatitis', 'Allergic Skin Reaction', 'Urticaria / Local Inflammation'],
      severity: 'low',
      urgency: 'Routine clinical consultation',
      recommended_specialist: 'Dermatologist',
      advice: [
        'Avoid scratching or exposing skin to harsh chemicals or soaps',
        'Apply cool compresses if irritation flares',
        medications ? `Note if ${medications} preceded skin changes` : 'Document new soaps, foods, or environmental exposures'
      ],
      warning_signs: ['Rapid facial or airway swelling', 'Spreading red streaks', 'Blistering with fever'],
      disclaimer: 'AI assistance only, not medical diagnosis. (Dermatological Triage Active)'
    }
  }

  // Neurological / Headache / Migraine
  if (/headache|migraine|head pain|dizzy|nausea|light sensitivity|vertigo/i.test(text)) {
    return {
      possible_conditions: ['Tension Headache', 'Migraine Episode', 'Stress-Induced Vascular Headache'],
      severity: 'medium',
      urgency: 'Routine GP or Specialist evaluation',
      recommended_specialist: 'Neurologist / General Practitioner',
      advice: [
        'Rest in a quiet, darkened room away from screens',
        'Ensure steady fluid intake and calm breathing exercises',
        'Track food triggers and stress factors'
      ],
      warning_signs: ['Sudden worst-ever "thunderclap" headache', 'Fever with stiff neck', 'Vision changes or weakness'],
      disclaimer: 'AI assistance only, not medical diagnosis. (Neurological Triage Active)'
    }
  }

  // Gastrointestinal / Stomach symptoms
  if (/stomach|nausea|vomit|diarrhea|cramps|acid|bloating|abdominal|indigestion/i.test(text)) {
    return {
      possible_conditions: ['Acute Gastroenteritis', 'Gastric Hyperacidity', 'Dietary Indigestion / Irritation'],
      severity: 'medium',
      urgency: 'Self-care & medical review if persistent',
      recommended_specialist: 'Gastroenterologist / General Physician',
      advice: [
        'Sip oral rehydration solutions (ORS) or electrolyte fluids',
        'Follow a gentle, non-greasy diet',
        duration ? `Monitor digestive response given ${duration} timeline` : 'Rest the gastrointestinal tract'
      ],
      warning_signs: ['Inability to retain fluids for >24 hrs', 'Blood in stool or vomit', 'Severe localized abdominal pain'],
      disclaimer: 'AI assistance only, not medical diagnosis. (Gastrointestinal Triage Active)'
    }
  }

  // Musculoskeletal / Joint / Back pain
  if (/back pain|joint|muscle|knee|ankle|sprain|stiffness|bone|shoulder/i.test(text)) {
    return {
      possible_conditions: ['Musculoskeletal Strain', 'Joint Ligament Inflammation', 'Postural Muscle Fatigue'],
      severity: 'low',
      urgency: 'Routine physical therapy or GP consultation',
      recommended_specialist: 'Orthopedic Specialist / Physical Therapist',
      advice: [
        'Apply alternating ice/warmth packs to the affected area',
        'Avoid heavy lifting or sudden twisting movements',
        'Engage in gentle, painless range-of-motion stretches'
      ],
      warning_signs: ['Numbness radiating down limbs', 'Loss of bladder or bowel control', 'Inability to bear weight'],
      disclaimer: 'AI assistance only, not medical diagnosis. (Musculoskeletal Triage Active)'
    }
  }

  // Custom / General fallback dynamically incorporating user's symptoms
  const cleanedSymptoms = symptoms.trim()
  return {
    possible_conditions: [`Primary evaluation for: ${cleanedSymptoms.slice(0, 45)}`, 'General physiological stress'],
    severity: 'low',
    urgency: 'Routine general health consultation',
    recommended_specialist: 'General Practitioner',
    advice: [
      `Monitor your reported symptoms ("${cleanedSymptoms.slice(0, 30)}...") closely`,
      'Maintain steady sleep, balanced nutrition, and adequate hydration',
      medications ? `Review ${medications} usage with your healthcare provider` : 'Keep a daily log of symptom timing'
    ],
    warning_signs: ['Sudden increase in symptom severity', 'High persistent fever', 'Shortness of breath'],
    disclaimer: 'AI assistance only, not medical diagnosis. (Dynamic Intake Triage Active)'
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { symptoms, duration, medications } = req.body
  console.log('[API/ANALYZE] API request received. Symptom input:', symptoms)

  if (!symptoms) {
    console.warn('[API/ANALYZE] Bad request: Symptoms description is missing.')
    return res.status(400).json({ error: 'Symptom description is required' })
  }

  // Load backend API key strictly from environment variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-api-key' || GEMINI_API_KEY.length < 10) {
    console.warn('[API/ANALYZE] GEMINI_API_KEY missing or demo key. Returning dynamic symptom analysis.')
    const dynamicResponse = generateDynamicSymptomAnalysis(symptoms, duration, medications)
    return res.status(200).json(dynamicResponse)
  }

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  try {
    const durationStr = duration ? `Duration of symptoms: "${duration}".` : ''
    const medicationsStr = medications ? `Recent medications: "${medications}".` : ''

    const prompt = `You are a medical AI assistant. Analyze these symptoms: "${symptoms}". ${durationStr} ${medicationsStr}
Return JSON with the exact fields:
{
  "possible_conditions": ["Condition 1", "Condition 2"],
  "severity": "low | medium | high",
  "urgency": "Urgency description",
  "recommended_specialist": "Specialist specialty",
  "advice": ["Advice 1", "Advice 2"],
  "warning_signs": ["Warning sign 1", "Warning sign 2"],
  "disclaimer": "AI assistance only, not medical diagnosis"
}

Safety rule: If symptoms indicate high risk (e.g. chest pain, severe difficulty breathing, sudden severe speech issues, or face dropping), set severity to "high", urgency to "immediate emergency attention required", and advise calling emergency services (911 or local emergency) immediately. Keep your advice clinical, brief, and return only the raw JSON.`

    console.log('[API/ANALYZE] Querying Google Gemini 2.0 Flash endpoint...')
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    })

    console.log('[API/ANALYZE] Gemini request status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API/ANALYZE] Gemini API request failed:', errorText)
      console.warn('[API/ANALYZE] Using dynamic clinical triage fallback.')
      return res.status(200).json(generateDynamicSymptomAnalysis(symptoms, duration, medications))
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    try {
      const cleaned = text.replace(/```json|```/gi, '').trim()
      const parsed = JSON.parse(cleaned)
      console.log('[API/ANALYZE] Response parsing status: Success. Parsed severity:', parsed.severity)
      return res.status(200).json(parsed)
    } catch (parseError) {
      console.error('[API/ANALYZE] Response parsing status: Failed. Raw text:', text, parseError)
      return res.status(200).json(generateDynamicSymptomAnalysis(symptoms, duration, medications))
    }
  } catch (err) {
    console.error('[API/ANALYZE] Serverless function error:', err)
    return res.status(200).json(generateDynamicSymptomAnalysis(symptoms, duration, medications))
  }
}

