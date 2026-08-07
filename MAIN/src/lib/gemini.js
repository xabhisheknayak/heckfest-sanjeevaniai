export async function analyzeSymptoms(symptoms, duration = '', medications = '') {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms, duration, medications }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Unable to analyze symptoms right now.')
  }
  return await response.json()
}

export async function analyzeImage(imageBase64, mimeType) {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
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
    body: JSON.stringify({ message, history }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || 'Unable to chat with AI right now.')
  }
  const data = await response.json()
  return data.reply
}
