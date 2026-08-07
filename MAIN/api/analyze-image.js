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

  const { imageBase64, mimeType } = req.body
  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'Image base64 content and mime type are required' })
  }

  // Load backend API key
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    console.error('Server Configuration Error: GEMINI_API_KEY is not defined.')
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' })
  }

  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: 'Analyze this medical image. Return JSON with fields: observations (string), possibleIssues (array of strings), confidence (string), recommendations (array of strings), disclaimer (string). Keep it concise, cautious, and return only raw JSON.' },
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini Image API request failed:', errorText)
      return res.status(502).json({ error: 'Gemini API returned an error response.' })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    try {
      const cleaned = text.replace(/```json|```/gi, '').trim()
      const parsed = JSON.parse(cleaned)
      return res.status(200).json(parsed)
    } catch (parseError) {
      console.error('Failed to parse Gemini output text:', text, parseError)
      return res.status(502).json({ error: 'Gemini model returned a malformed response.' })
    }
  } catch (err) {
    console.error('Image Analysis Serverless function error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
