import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'
import { chatWithAI } from '../../lib/gemini'

const starterMessages = [
  'How do I improve my sleep quality tonight?',
  'What should I do if I feel anxious?',
  'Can you summarize my current care plan?'
]

export function AIChatAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'assistant', text: 'I can help with wellness guidance, reminders, and simple care suggestions.' }
  ])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (customText = '') => {
    const textToSend = (customText || draft).trim()
    if (!textToSend || loading) return

    const userMessage = { id: Date.now(), from: 'user', text: textToSend }
    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setDraft('')
    setLoading(true)

    try {
      const history = currentMessages.slice(1)
      const reply = await chatWithAI(textToSend, history)
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'assistant', text: reply }])
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'assistant', text: 'Sorry, I am unable to connect to the AI chat model right now.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-[#16A34A]">
        <img src="/ai_healthcare_assistant.png" alt="AI Avatar" className="h-6 w-6 rounded-xl object-cover border border-emerald-100 dark:border-slate-800" />
        <h3 className="font-semibold dark:text-slate-100">AI care assistant</h3>
      </div>
      <div className="mt-4 max-h-72 overflow-y-auto space-y-3 pr-1">
        {messages.map((message) => (
          <div key={message.id} className={`rounded-2xl px-4 py-3 text-sm ${message.from === 'assistant' ? 'bg-[#F0FDF4] text-slate-700 dark:bg-emerald-950/40 dark:text-slate-200' : 'bg-slate-900 text-white dark:bg-slate-800'}`}>
            {message.text}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#F0FDF4] px-4 py-3 text-sm text-slate-500 dark:bg-emerald-950/20 dark:text-slate-400">
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {starterMessages.map((item) => (
          <button key={item} onClick={() => handleSend(item)} className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input 
          value={draft} 
          onChange={(e) => setDraft(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your well-being" 
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200" 
        />
        <button onClick={() => handleSend()} className="rounded-2xl bg-[#16A34A] p-3 text-white hover:bg-[#15803D] transition">
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
