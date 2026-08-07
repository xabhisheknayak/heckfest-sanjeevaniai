import { motion } from 'framer-motion'
import { Activity, ArrowRight, HeartPulse, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Toast } from '../components/ui/Toast'
import { analyzeSymptoms } from '../lib/gemini'
import { useAuth } from '../hooks/useAuth'
import { firestoreService } from '../services/firestoreService'

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('')
  const [medications, setMedications] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await analyzeSymptoms(symptoms, duration, medications)
      setResult(data)

      // Save interaction details to Firestore health records with local storage fallback
      if (user) {
        try {
          const recordId = `record-${Date.now()}`
          await firestoreService.saveUserData('health_records', recordId, {
            uid: user.uid,
            symptoms: symptoms + (duration ? ` (duration: ${duration})` : '') + (medications ? ` (meds: ${medications})` : ''),
            ai_response: data,
            severity: data.severity || 'low',
            createdAt: new Date().toISOString()
          })
        } catch (saveErr) {
          console.warn('Firestore save failed, saving to localStorage as fallback:', saveErr)
          try {
            const key = `sanjivni-demo-db-health_records-record-${Date.now()}`
            const payload = {
              id: `record-${Date.now()}`,
              uid: user.uid,
              symptoms: symptoms + (duration ? ` (duration: ${duration})` : '') + (medications ? ` (meds: ${medications})` : ''),
              ai_response: data,
              severity: data.severity || 'low',
              createdAt: new Date().toISOString(),
              timestamp: new Date().toISOString()
            }
            localStorage.setItem(key, JSON.stringify(payload))
          } catch (lsErr) {
            console.error('LocalStorage fallback save failed:', lsErr)
          }
        }
      }
    } catch (err) {
      console.error('Symptom checker analysis failure:', err)
      setError('Unable to analyze symptoms right now. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">AI symptom checker</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Understand your symptoms with calm guidance</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Describe what you are experiencing and receive a structured, supportive overview designed for your next steps.</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><HeartPulse className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Symptom intake</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">A private, guided overview</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Describe your symptoms" placeholder="Headache, fatigue, mild fever" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} />
              <Input label="How long have you had them?" placeholder="2 days" value={duration} onChange={(event) => setDuration(event.target.value)} />
              <Input label="Any recent medications?" placeholder="Paracetamol, vitamin D" value={medications} onChange={(event) => setMedications(event.target.value)} />
              <Button className="w-full" onClick={handleAnalyze} disabled={loading}>{loading ? 'Analyzing...' : <>Analyze symptoms <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </div>
          </Card>

          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Suggested guidance</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Based on your input</p>
              </div>
            </div>
            <div className="space-y-3">
              {error && <Toast title="Error" message={error} tone="warning" />}
              {result ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Possible conditions</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.possible_conditions?.join(', ')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Severity</p>
                    <p className={`mt-2 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                      result.severity === 'high' ? 'bg-red-50 text-red-700 dark:bg-red-950/35 dark:text-red-400' :
                      result.severity === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400'
                    }`}>{result.severity}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Urgency level</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.urgency}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Recommended specialist</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.recommended_specialist}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Care advice</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.advice?.join(' • ')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Warning signs to monitor</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.warning_signs?.join(' • ')}</p>
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-red-50/15 p-4 dark:border-red-950/20 dark:bg-red-950/5">
                    <p className="font-semibold text-red-800 dark:text-red-400">Medical disclaimer</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{result.disclaimer}</p>
                  </div>
                </>
              ) : (
                [
                  { title: 'Possible causes', text: 'Mild viral illness or fatigue from sleep disruption.' },
                  { title: 'Recommended next step', text: 'Hydrate well and monitor symptoms for 24–48 hours.' },
                  { title: 'Escalate if', text: 'Shortness of breath, chest pain, or persistent fever occurs.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Personalized', text: 'Adaptive suggestions based on common patterns.' },
            { title: 'Secure', text: 'Designed to support your privacy and clarity.' },
            { title: 'Actionable', text: 'Next steps are simple and easy to follow.' },
          ].map((item) => (
            <Card key={item.title} className="p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-2 text-[#16A34A]"><Activity className="h-4 w-4" /> {item.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
