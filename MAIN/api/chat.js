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
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-api-key') {
    console.warn('[API/CHAT] GEMINI_API_KEY missing or demo key. Providing conversational fallback response.')
    return res.status(200).json({
      reply: `Hello! I am SanjivniAI assistant. I received your message: "${message}". Make sure to stay hydrated, get sufficient rest, and monitor how you feel. (Tip: Set your GEMINI_API_KEY in .env.local for live Gemini model responses)`
    })
  }

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  try {
    const systemInstruction = {
      role: 'user',
      parts: [{
        text: 'SYSTEM: You are SanjivniAI, a supportive wellness advisor. Discuss healthy choices, sleep quality, and care timelines. Never diagnose disease or prescribe therapy. Keep feedback concise, helpful, and empathetic.'
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
      console.error('Gemini Chat API request failed:', errorText)
      return res.status(502).json({ error: 'Gemini API returned an error response.' })
    }

    const data = await response.json()
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
    
    return res.status(200).json({ reply: replyText })
  } catch (err) {
    console.error('Chat Serverless function error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
