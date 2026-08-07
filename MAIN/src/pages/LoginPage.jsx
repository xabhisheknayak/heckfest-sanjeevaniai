import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, signIn, resetPassword, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [navigate, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await signIn(form.email, form.password)
      setMessage('Signed in successfully')
      navigate('/dashboard')
    } catch {
      setMessage('Unable to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      setMessage('Enter your email to reset your password.')
      return
    }

    try {
      await resetPassword(form.email)
      setMessage('Password reset email sent. Check your inbox.')
    } catch {
      setMessage('We could not send a password reset email. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.12),_transparent_35%),#f8fafc] px-4 py-12 dark:bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.12),_transparent_35%),#020617] dark:text-slate-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-8 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Welcome back</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Access your SanjivniAI care hub</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <Button type="submit" className="w-full py-3" disabled={loading}>{loading ? 'Signing in...' : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>

          <button type="button" onClick={handleForgotPassword} className="mt-3 text-sm font-semibold text-[#16A34A] hover:text-emerald-700 transition cursor-pointer">Forgot password?</button>

          {(message || error) && <div className="mt-4"><Toast title={message ? 'Success' : 'Error'} message={message || error} tone={message ? 'success' : 'warning'} /></div>}

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don’t have an account? <Link to="/signup" className="font-semibold text-[#16A34A] hover:text-[#15803D] transition">Create one</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
