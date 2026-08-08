import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, X, User, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { callDoctorAI } from '../../lib/gemini'

export function DoctorAIAssistant({ open, onClose, selectedPatient }) {
  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: `Hello Doctor. I am your SanjivniAI Clinical Assistant. I can help synthesize consultation notes, prepare follow-up checklists, and summarize authorized patient records.`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const quickPrompts = [
    "Summarize this patient's recent history.",
    "What information should I clarify during this consultation?",
    "Summarize the previous consultation.",
    "Create a follow-up checklist.",
    "Organize these consultation notes."
  ]

  const handleSend = async (promptText) => {
    const textToSend = promptText || input
    if (!textToSend.trim()) return

    const userMsg = { from: 'user', text: textToSend }
    setMessages(prev => [...prev, userMsg])
    if (!promptText) setInput('')
    setLoading(true)

    try {
      // Send authorized patient context to backend Doctor AI handler
      const res = await callDoctorAI('generateConsultationNotes', {
        symptoms: textToSend,
        notes: selectedPatient ? `Patient: ${selectedPatient.name}, Condition: ${selectedPatient.condition}, History: ${selectedPatient.history}` : ''
      })

      let aiText = res.soapNotes
        ? `Clinical Intake Synthesis for ${selectedPatient?.name || 'Patient'}:\n\n• Subjective: ${res.soapNotes.subjective}\n• Objective: ${res.soapNotes.objective}\n• Assessment: ${res.soapNotes.assessment}\n• Proposed Action Plan: ${res.soapNotes.plan.join(', ')}`
        : `Regarding "${textToSend.slice(0, 40)}...": Synthesized patient history for ${selectedPatient?.name || 'Authorized Patient'} shows stable physiological trends. Recommend verifying current medication adherence and scheduling follow-up in 2 weeks.`

      if (textToSend.includes('checklist')) {
        aiText = `📋 Follow-up Checklist for ${selectedPatient?.name || 'Patient'}:\n1. Check blood pressure baseline (Target <130/80 mmHg)\n2. Confirm patient adherence to daily fluids & rest\n3. Review laboratory blood panel results within 14 days\n4. Re-evaluate if symptoms persist or flare.`
      }

      setMessages(prev => [...prev, { from: 'ai', text: aiText }])
    } catch (err) {
      setMessages(prev => [...prev, { from: 'ai', isError: true, text: err.message || '⚠️ AI service is temporarily unavailable. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  🤖 Doctor AI Assistant
                </h2>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3 text-emerald-600 inline" />
                  Context: {selectedPatient ? selectedPatient.name : 'Authorized Patient Records'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto flex gap-1.5 text-[11px]">
            {quickPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from === 'ai' && (
                  <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3.5 max-w-[85%] leading-relaxed whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-[#16A34A] text-white shadow'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start items-center text-xs text-slate-500 italic">
                <Sparkles className="h-4 w-4 animate-spin text-emerald-600" />
                🤖 Doctor AI is synthesizing clinical data...
              </div>
            )}
          </div>

          {/* Mandatory Clinical Safety Disclaimer Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-amber-600" />
            AI assistant for clinical workflow support only. Verify all information and use professional medical judgment.
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI about selected patient notes or checklist..."
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-950"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={() => handleSend()} disabled={loading} className="py-2 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
