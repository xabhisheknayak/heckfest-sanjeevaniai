import { motion } from 'framer-motion'
import { Camera, FileImage, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { analyzeImage } from '../lib/gemini'
import { useAuth } from '../hooks/useAuth'
import { firestoreService } from '../services/firestoreService'

export default function ImageAnalysisPage() {
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1]
      setLoading(true)
      setError('')
      try {
        const data = await analyzeImage(base64, file.type || 'image/jpeg')
        setResult(data)

        // Save image analysis results to database
        if (user) {
          try {
            const recordId = `img-${Date.now()}`
            await firestoreService.saveUserData('image_analyses', recordId, {
              uid: user.uid,
              observations: data.observations,
              possibleIssues: data.possibleIssues || [],
              confidence: data.confidence || 'Medium',
              recommendations: data.recommendations || [],
              createdAt: new Date().toISOString()
            })
          } catch (saveErr) {
            console.warn('Firestore image save failed, saving to localStorage as fallback:', saveErr)
            try {
              const key = `sanjivni-demo-db-image_analyses-img-${Date.now()}`
              const payload = {
                id: `img-${Date.now()}`,
                uid: user.uid,
                observations: data.observations,
                possibleIssues: data.possibleIssues || [],
                confidence: data.confidence || 'Medium',
                recommendations: data.recommendations || [],
                createdAt: new Date().toISOString(),
                timestamp: new Date().toISOString()
              }
              localStorage.setItem(key, JSON.stringify(payload))
            } catch (lsErr) {
              console.error('LocalStorage fallback save failed:', lsErr)
            }
          }
        }
      } catch {
        setError('Unable to analyze the uploaded image at the moment.')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Medical image analysis</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Review scans with AI-assisted structure</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Upload X-rays, lab visuals, or imaging reference files to receive a structured preview for your next consultation.</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40"><Camera className="h-6 w-6" /></div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upload medical image</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">PNG, JPG, DICOM references can be previewed here during the demo experience.</p>
              <label className="mt-6 inline-flex cursor-pointer rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D] transition">
                <span>{loading ? 'Analyzing...' : 'Choose file'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </Card>

          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">AI summary</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Preview mode</p>
              </div>
            </div>
            <div className="space-y-3">
              {error && <Toast title="Error" message={error} tone="warning" />}
              {result ? (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Observations</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-350">{result.observations}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Possible issues</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-350">{result.possibleIssues?.join(' • ')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Confidence</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.confidence}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Recommendations</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.recommendations?.join(' • ')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Medical disclaimer</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{result.disclaimer}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Observed pattern</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Anatomy appears consistent with the provided reference set, with a mild contrast variance.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Recommended action</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Share the result with your physician for confirmation and plan next steps.</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Structured output', text: 'Insights are organized into clear sections.' },
            { title: 'Fast review', text: 'Designed for quicker handoffs between visits.' },
            { title: 'Secure handling', text: 'Private experiences built for professional care.' },
          ].map((item) => (
            <Card key={item.title} className="p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-2 text-[#16A34A]"><FileImage className="h-4 w-4" /> {item.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
