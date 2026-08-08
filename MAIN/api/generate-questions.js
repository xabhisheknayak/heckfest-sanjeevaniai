function generateDynamicQuestions(symptoms = '') {
  const text = (symptoms || '').toLowerCase()

  // Chest / Cardiac / Respiratory Emergency
  if (/chest pain|shortness of breath|breathless|heart pressure|arm numbness|dizziness|fainting|stroke/i.test(text)) {
    return [
      { id: 1, question: "Is the chest discomfort continuous, crushing, or radiating down your left arm/jaw?", options: ["Yes, continuous/radiating", "No, localized/sharp", "Not sure"] },
      { id: 2, question: "How long have you experienced these symptoms?", options: ["Less than 1 hour", "1–6 hours", "12–24 hours", "More than 24 hours"] },
      { id: 3, question: "Are you experiencing shortness of breath while resting?", options: ["Yes, severe at rest", "Only during physical exertion", "No breathing difficulty"] },
      { id: 4, question: "Do you have a personal or family history of heart disease or hypertension?", options: ["Yes", "No", "Uncertain"] },
      { id: 5, question: "Are you sweating heavily or feeling lightheaded/dizzy?", options: ["Yes", "No", "Mildly"] },
      { id: 6, question: "Does taking deep breaths or changing position change the pain intensity?", options: ["Yes", "No", "Not sure"] },
      { id: 7, question: "Have you experienced any previous similar cardiac or pressure episodes?", options: ["Yes, previously diagnosed", "First time experiencing this", "Not sure"] },
      { id: 8, question: "Are you currently taking any prescribed blood pressure or heart medications?", options: ["Yes", "No"] },
      { id: 9, question: "Do you have any swelling in your lower legs or feet?", options: ["Yes", "No", "Mild swelling"] },
      { id: 10, question: "Are you able to speak full sentences without catching your breath?", options: ["Yes", "No", "With difficulty"] }
    ]
  }

  // Fever / Flu / Cough / Respiratory
  if (/fever|cough|sore throat|flu|cold|chills|phlegm|runny nose|congestion/i.test(text)) {
    return [
      { id: 1, question: "Do you currently have a measured fever?", options: ["Yes (Above 100.4°F / 38°C)", "Mild warmth / No thermometer", "No fever"] },
      { id: 2, question: "How long have you had these symptoms?", options: ["Less than 1 day", "1–3 days", "4–7 days", "More than 7 days"] },
      { id: 3, question: "Is your cough dry or producing mucus/phlegm?", options: ["Dry cough", "Coughing up clear mucus", "Coughing up yellow/green mucus", "No cough"] },
      { id: 4, question: "Are you experiencing any difficulty breathing or chest tightness?", options: ["Yes, noticeable difficulty", "Mild tightness when coughing", "No breathing difficulty"] },
      { id: 5, question: "Do you have body aches, fatigue, or chills?", options: ["Severe chills and body pain", "Moderate tiredness", "None"] },
      { id: 6, question: "Are you experiencing a sore throat or difficulty swallowing?", options: ["Yes, severe sore throat", "Mild tickle", "No throat discomfort"] },
      { id: 7, question: "Have you been exposed to anyone with a known viral infection recently?", options: ["Yes", "No", "Not sure"] },
      { id: 8, question: "Are you currently taking any fever reducers (e.g. Paracetamol / Ibuprofen)?", options: ["Yes, symptoms improve temporarily", "Yes, but no improvement", "No medication taken"] },
      { id: 9, question: "Do you have any sinus pressure, headache, or nasal congestion?", options: ["Yes, severe headache/sinus pain", "Mild congestion", "None"] },
      { id: 10, question: "Are you able to stay hydrated with fluids and retain light meals?", options: ["Yes, drinking fluids easily", "Nauseous / Low fluid intake", "Inability to retain fluids"] }
    ]
  }

  // Stomach / GI / Digestive
  if (/stomach|nausea|vomit|diarrhea|cramps|acid|bloating|abdominal|indigestion/i.test(text)) {
    return [
      { id: 1, question: "Where is the abdominal discomfort most intense?", options: ["Upper stomach", "Lower right side", "Around belly button / Generalized", "Not localized"] },
      { id: 2, question: "How long have you experienced digestive symptoms?", options: ["Less than 12 hours", "1–2 days", "3–5 days", "More than a week"] },
      { id: 3, question: "Have you experienced nausea or vomiting?", options: ["Multiple episodes of vomiting", "Nausea without vomiting", "No nausea"] },
      { id: 4, question: "Are you experiencing loose stools or diarrhea?", options: ["Yes, frequent loose stools", "Occasional diarrhea", "No diarrhea / Constipated"] },
      { id: 5, question: "Do you have a fever or cold sweats accompanying stomach pain?", options: ["Yes", "No", "Uncertain"] },
      { id: 6, question: "Does eating food worsen or relieve the discomfort?", options: ["Worsens after eating", "Relieved after eating", "No relation to food"] },
      { id: 7, question: "Are you able to keep oral fluids down?", options: ["Yes, drinking water fine", "Struggling to keep liquids down", "Unable to retain any liquids"] },
      { id: 8, question: "Have you noticed any blood in stool or vomit?", options: ["Yes", "No"] },
      { id: 9, question: "Did these symptoms begin after eating specific or outside food?", options: ["Yes, suspected food trigger", "No", "Not sure"] },
      { id: 10, question: "Is the stomach pain sharp/cramping or a dull persistent ache?", options: ["Sharp / Cramping episodes", "Dull constant ache", "Mild bloating"] }
    ]
  }

  // Headache / Migraine / Neurological
  if (/headache|migraine|head pain|dizzy|light sensitivity|vertigo/i.test(text)) {
    return [
      { id: 1, question: "How would you describe the headache pain?", options: ["Throbbing / Pulsating on one side", "Dull tight pressure across forehead/neck", "Sharp sudden thunderclap pain", "Mild aching"] },
      { id: 2, question: "How long has the headache lasted?", options: ["Less than 2 hours", "Few hours to 1 day", "2–3 days", "Persistent for days"] },
      { id: 3, question: "Are you sensitive to light or loud sounds?", options: ["Yes, both light and sound irritate", "Light sensitivity only", "Neither"] },
      { id: 4, question: "Do you feel nausea or dizziness with the headache?", options: ["Yes, noticeable nausea/dizziness", "Mild lightheadedness", "No nausea"] },
      { id: 5, question: "Did the headache start suddenly or build up gradually?", options: ["Sudden intense onset", "Gradual increase over hours", "Constant tension"] },
      { id: 6, question: "Do you have any vision changes, such as flickering lights or blurry spots?", options: ["Yes, visual aura/spots", "Blurry vision", "Normal vision"] },
      { id: 7, question: "Is there neck stiffness or fever accompanying the headache?", options: ["Yes, stiff neck and fever", "Fever only", "Neither"] },
      { id: 8, question: "Have you been under high stress, lack of sleep, or missed meals?", options: ["Yes, high stress/poor sleep", "Missed meals/Dehydration", "None of these"] },
      { id: 9, question: "Have you taken any pain relief medication today?", options: ["Yes, Paracetamol/NSAIDs with partial relief", "Yes, no relief", "No medication taken"] },
      { id: 10, question: "Does physical activity like walking or bending over worsen the pain?", options: ["Yes, worsens with movement", "No change with movement", "Not sure"] }
    ]
  }

  // Default / General Intake Questions dynamically tailored
  const cleaned = symptoms.trim().slice(0, 35) || 'reported symptoms'
  return [
    { id: 1, question: `How long have you been experiencing ${cleaned}?`, options: ["Less than 24 hours", "1–3 days", "4–7 days", "More than a week"] },
    { id: 2, question: "On a scale of 1 to 10, how would you rate the overall discomfort?", options: ["1–3 (Mild)", "4–6 (Moderate)", "7–8 (Severe)", "9–10 (Extremely Severe)"] },
    { id: 3, question: "Are your symptoms getting progressively worse, staying the same, or improving?", options: ["Worsening over time", "Staying the same", "Gradually improving", "Fluctuating in episodes"] },
    { id: 4, question: "Do you currently have a fever or chills?", options: ["Yes, fever over 100°F", "Chills / Feeling feverish", "No fever"] },
    { id: 5, question: "Are you experiencing any shortness of breath, chest pressure, or sudden weakness?", options: ["Yes (Requires immediate medical evaluation)", "Mild shortness of breath on exertion", "No breathing or chest issues"] },
    { id: 6, question: "Have you noticed any associated skin rashes, joint pain, or swelling?", options: ["Yes, skin rash/hives", "Joint or muscle aches", "No skin or joint symptoms"] },
    { id: 7, question: "Does resting or lying down make your symptoms better or worse?", options: ["Improves with rest", "Worsens when lying down", "No difference"] },
    { id: 8, question: "Are you currently taking any daily prescribed or over-the-counter medications?", options: ["Yes, daily prescription meds", "OTC pain/cold medicine", "No active medications"] },
    { id: 9, question: "Do you have any existing chronic health conditions (e.g. Asthma, Diabetes, Hypertension)?", options: ["Hypertension / Heart condition", "Asthma / Respiratory condition", "Diabetes", "No chronic conditions"] },
    { id: 10, question: "Are you able to perform your normal daily activities and maintain fluid intake?", options: ["Yes, fully active", "Slightly limited activity", "Resting in bed / Low fluids", "Unable to perform daily tasks"] }
  ]
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { symptoms } = req.body
  if (!symptoms || !symptoms.trim()) {
    return res.status(400).json({ error: 'Symptom description is required to generate questionnaire.' })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-api-key' || GEMINI_API_KEY.length < 10) {
    return res.status(200).json({ questions: generateDynamicQuestions(symptoms) })
  }

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  try {
    const prompt = `You are a clinical intake AI assistant. A patient reports: "${symptoms}".
Generate approximately 10 factual, observable follow-up questions to better understand their symptoms (duration, severity, progression, warning signs, associated symptoms).
Return ONLY valid JSON in the format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}`

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
      return res.status(200).json({ questions: generateDynamicQuestions(symptoms) })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = text.replace(/```json|```/gi, '').trim()
    const parsed = JSON.parse(cleaned)

    if (parsed.questions && Array.isArray(parsed.questions)) {
      return res.status(200).json(parsed)
    }
    return res.status(200).json({ questions: generateDynamicQuestions(symptoms) })
  } catch (err) {
    console.error('[API/GENERATE-QUESTIONS] Fallback to dynamic questions generator:', err.message)
    return res.status(200).json({ questions: generateDynamicQuestions(symptoms) })
  }
}
