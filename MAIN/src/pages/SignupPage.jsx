import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp, error } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await signUp(form)
      setMessage('Account created successfully')
      navigate('/dashboard')
    } catch {
      setMessage('Unable to create your account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.12),_transparent_35%),#f8fafc] px-4 py-12 dark:bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.12),_transparent_35%),#020617] dark:text-slate-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card className="p-8 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Create your account</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Begin your secure digital care journey</p>
            </div>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="Full name" placeholder="Asha Patel" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <div className="md:col-span-2">
              <Button type="submit" className="w-full py-3" disabled={loading}>{loading ? 'Creating account...' : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </div>
          </form>

          {(message || error) && <div className="mt-4"><Toast title={message ? 'Success' : 'Error'} message={message || error} tone={message ? 'success' : 'warning'} /></div>}

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already registered? <Link to="/login" className="font-semibold text-[#16A34A] hover:text-[#15803D] transition">Sign in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
