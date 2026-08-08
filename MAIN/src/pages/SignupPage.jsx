import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, User, Stethoscope, FileText, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { USER_ROLES } from '../constants/roles'

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, error } = useAuth()
  
  const queryParams = new URLSearchParams(location.search)
  const initialRole = queryParams.get('role') === USER_ROLES.DOCTOR ? USER_ROLES.DOCTOR : USER_ROLES.PATIENT

  const [role, setRole] = useState(initialRole)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    licenseNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('role') === USER_ROLES.DOCTOR) {
      setRole(USER_ROLES.DOCTOR)
    }
  }, [location.search])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        specialization: role === USER_ROLES.DOCTOR ? form.specialization : '',
        licenseNumber: role === USER_ROLES.DOCTOR ? form.licenseNumber : ''
      })
      setMessage(
        role === USER_ROLES.DOCTOR
          ? 'Doctor verification application submitted successfully.'
          : 'Patient account created successfully.'
      )
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
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Create your account</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Begin your secure digital care journey</p>
            </div>
          </div>

          {/* Account Role Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Account Registration Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setRole(USER_ROLES.PATIENT)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
                  role === USER_ROLES.PATIENT
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <User className="h-4 w-4" /> 👤 Patient
              </button>
              <button
                type="button"
                onClick={() => setRole(USER_ROLES.DOCTOR)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
                  role === USER_ROLES.DOCTOR
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="h-4 w-4" /> 👨‍⚕️ Doctor
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-amber-600" /> Admin accounts require platform authorization.
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <Input
                label="Full name"
                required
                placeholder={role === USER_ROLES.DOCTOR ? 'Dr. Ananya Mehta' : 'Asha Patel'}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="Create strong password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />

            {role === USER_ROLES.DOCTOR && (
              <>
                <Input
                  label="Specialization"
                  required
                  placeholder="e.g. Cardiology"
                  value={form.specialization}
                  onChange={(event) => setForm({ ...form, specialization: event.target.value })}
                />
                <Input
                  label="Medical License Number"
                  required
                  placeholder="e.g. MED-IND-88901"
                  value={form.licenseNumber}
                  onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })}
                />
                <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-semibold text-amber-800 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-300">
                  <FileText className="h-4 w-4 inline mr-1" /> Doctor accounts are submitted for clinical verification upon creation.
                </div>
              </>
            )}

            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading
                  ? 'Creating account...'
                  : role === USER_ROLES.DOCTOR
                  ? <>Submit Doctor Registration <ArrowRight className="ml-2 h-4 w-4" /></>
                  : <>Create Patient Account <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </form>

          {(message || error) && (
            <div className="mt-4">
              <Toast title={message ? 'Notice' : 'Error'} message={message || error} tone={message ? 'success' : 'warning'} />
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already registered? <Link to="/login" className="font-semibold text-[#16A34A] hover:text-[#15803D] transition">Sign in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
