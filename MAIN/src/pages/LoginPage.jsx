import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, User, Stethoscope, Shield, KeyRound, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { USER_ROLES } from '../constants/roles'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, profile, signIn, resetPassword, logout, error: authError } = useAuth()
  
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.PATIENT)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [permissionError, setPermissionError] = useState('')

  useEffect(() => {
    if (user && profile) {
      if (profile.role === USER_ROLES.DOCTOR) {
        navigate('/doctor/dashboard')
      } else if (profile.role === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate, user, profile])

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setPermissionError('')
    setMessage('')
  }

  const fillDemoCredentials = (role) => {
    setSelectedRole(role)
    setPermissionError('')
    if (role === USER_ROLES.DOCTOR) {
      setForm({ email: 'doctor@test.local', password: 'demo123456' })
    } else if (role === USER_ROLES.ADMIN) {
      setForm({ email: 'admin@test.local', password: 'demo123456' })
    } else {
      setForm({ email: 'patient@test.local', password: 'demo123456' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setPermissionError('')

    try {
      await signIn(form.email, form.password, selectedRole)

      // Get latest stored profile for role verification
      const localAuth = window.localStorage.getItem('sanjivni-demo-auth')
      let userRole = selectedRole
      if (localAuth) {
        try {
          const parsed = JSON.parse(localAuth)
          if (parsed.profile?.role) userRole = parsed.profile.role
        } catch {
          // Fallback to selectedRole
        }
      }

      // Strict Backend/Auth Verification Check
      if (userRole !== selectedRole) {
        await logout()
        setPermissionError('Your account does not have permission to access this portal.')
        setLoading(false)
        return
      }

      setMessage('Signed in successfully')
      if (userRole === USER_ROLES.DOCTOR) {
        navigate('/doctor/dashboard')
      } else if (userRole === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setMessage(err.message || 'Unable to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      setMessage('Enter your email address to reset your password.')
      return
    }

    try {
      await resetPassword(form.email)
      setMessage('Password reset link sent to your email inbox.')
    } catch {
      setMessage('Unable to send password reset email. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.12),_transparent_35%),#f8fafc] px-4 py-12 dark:bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.12),_transparent_35%),#020617] dark:text-slate-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card className="p-8 dark:border-slate-800 dark:bg-slate-900/80">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to SanjivniAI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your account type to access your portal</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Select Account Type</p>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => handleRoleSelect(USER_ROLES.PATIENT)}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-xs font-bold transition ${
                  selectedRole === USER_ROLES.PATIENT
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <User className="h-4 w-4 mb-1" />
                <span>👤 PATIENT</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect(USER_ROLES.DOCTOR)}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-xs font-bold transition ${
                  selectedRole === USER_ROLES.DOCTOR
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="h-4 w-4 mb-1" />
                <span>👨‍⚕️ DOCTOR</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect(USER_ROLES.ADMIN)}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-xs font-bold transition ${
                  selectedRole === USER_ROLES.ADMIN
                    ? 'bg-white text-emerald-700 shadow dark:bg-slate-800 dark:text-emerald-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4 mb-1" />
                <span>🛡️ ADMIN</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Pre-fill Bar */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Instant Evaluation Demo Fill:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials(USER_ROLES.PATIENT)}
                className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
              >
                👤 Demo Patient
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials(USER_ROLES.DOCTOR)}
                className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
              >
                👨‍⚕️ Demo Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials(USER_ROLES.ADMIN)}
                className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
              >
                🛡️ Demo Admin
              </button>
            </div>
          </div>

          {/* Role Permission Error Notice */}
          {permissionError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-950 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="mt-0.5">{permissionError}</p>
              </div>
            </div>
          )}

          {/* Role-Specific Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {selectedRole === USER_ROLES.PATIENT && (
              <>
                <Input
                  label="Patient Email or Phone"
                  type="text"
                  required
                  placeholder="patient@sanjivni.ai or +91 98765 43210"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </>
            )}

            {selectedRole === USER_ROLES.DOCTOR && (
              <>
                <Input
                  label="Email or Professional Medical ID"
                  type="text"
                  required
                  placeholder="doctor@sanjivni.ai or MED-IND-88901"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="Enter practitioner password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Licensed practitioners are verified via national medical registry IDs.
                </p>
              </>
            )}

            {selectedRole === USER_ROLES.ADMIN && (
              <>
                <Input
                  label="Admin Email or Username"
                  type="text"
                  required
                  placeholder="admin@sanjivni.ai"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                <Input
                  label="Master Admin Password"
                  type="password"
                  required
                  placeholder="Enter master admin password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  Restricted Access. Admin logins require verified platform credentials.
                </p>
              </>
            )}

            <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
              {loading ? 'Authenticating...' : <>Sign in to {selectedRole.toUpperCase()} Portal <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="mt-4 text-xs font-semibold text-[#16A34A] hover:text-emerald-700 transition cursor-pointer"
          >
            Forgot password?
          </button>

          {(message || authError) && (
            <div className="mt-4">
              <Toast title={message ? 'Notice' : 'Authentication Error'} message={message || authError} tone={message ? 'success' : 'warning'} />
            </div>
          )}

          {selectedRole === USER_ROLES.PATIENT && (
            <div className="mt-6 border-t pt-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
              Don’t have a patient account? <Link to="/signup" className="font-semibold text-[#16A34A] hover:text-[#15803D] transition">Create Patient Account</Link>
            </div>
          )}

          {selectedRole === USER_ROLES.DOCTOR && (
            <div className="mt-6 border-t pt-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
              New Medical Practitioner? <Link to="/signup?role=doctor" className="font-semibold text-[#16A34A] hover:text-[#15803D] transition">Apply for Doctor Verification</Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
