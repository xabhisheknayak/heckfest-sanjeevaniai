function generateDynamicChatResponse(message = '') {
  const text = (message || '').toLowerCase()

  if (/sleep|insomnia|bedtime|rest|night|tired/i.test(text)) {
    return 'For optimal sleep quality, aim for 7-9 hours of restful sleep. Try dimming screens 1 hour before bed, keeping a cool bedroom environment, and limiting caffeine intake after 2 PM.'
  }

  if (/anxious|anxiety|stress|panic|overwhelmed|nervous|worry/i.test(text)) {
    return 'When feeling anxious, try the 4-7-8 breathing technique: inhale quietly through your nose for 4 seconds, hold your breath for 7 seconds, and exhale slowly through your mouth for 8 seconds. Repeat 4 times to help settle your nervous system.'
  }

  if (/care plan|summary|record|history|appointment|doctor/i.test(text)) {
    return 'Your SanjivniAI care overview tracks your recent symptom intakes, health records, and specialist appointments. You can view your complete timeline under Medical History or schedule a consultation via Doctor Finder.'
  }

  if (/water|hydrate|hydration|drink|diet|food|nutrition/i.test(text)) {
    return 'Staying hydrated supports energy, focus, and digestion. Aim for 2.5 to 3 liters of water daily, and prioritize nutrient-dense whole foods like fresh vegetables, fruits, and lean protein.'
  }

  if (/exercise|workout|walk|fitness|movement|stretch/i.test(text)) {
    return 'Regular low-impact movement boosts mood and cardiovascular vitality. Even a 20-minute daily walk or morning stretching routine enhances joint flexibility and mental clarity.'
  }

  const cleaned = message.trim()
  return `Thank you for reaching out. Regarding "${cleaned.slice(0, 45)}...", SanjivniAI is here to assist your daily well-being. Keep tracking how you feel, maintain steady hydration and rest, and consult a qualified clinician for personalized medical advice.`
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

  const { message, history } = req.body
  if (!message) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  // Load backend API key
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-api-key' || GEMINI_API_KEY.length < 10) {
    console.warn('[API/CHAT] GEMINI_API_KEY missing or demo key. Returning dynamic chat response.')
    return res.status(200).json({ reply: generateDynamicChatResponse(message) })
  }

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  try {
    const systemInstruction = {
      role: 'user',
      parts: [{
        text: 'SYSTEM: You are SanjivniAI, a supportive healthcare and wellness advisor. Discuss healthy habits, sleep hygiene, care timelines, and general well-being. Never diagnose disease or prescribe medication. Keep feedback concise, empathetic, and clinical.'
      }]
    }

    const formattedHistory = (history || []).map(item => ({
      role: item.from === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }))

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          systemInstruction,
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ]
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API/CHAT] Gemini Chat API request failed:', errorText)
      return res.status(200).json({ reply: generateDynamicChatResponse(message) })
    }

    const data = await response.json()
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || generateDynamicChatResponse(message)
    
    return res.status(200).json({ reply: replyText })
  } catch (err) {
    console.error('[API/CHAT] Chat Serverless function error:', err)
    return res.status(200).json({ reply: generateDynamicChatResponse(message) })
  }
}

