import { motion } from 'framer-motion'
import { MoonStar, ShieldCheck, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'

export default function SettingsPage() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [glassUI, setGlassUI] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [dataSharing, setDataSharing] = useState(true)
  const [biometrics, setBiometrics] = useState(false)
  const [notificationCadence, setNotificationCadence] = useState('Weekly')
  const [message, setMessage] = useState('')

  const handleSave = () => {
    setMessage('Your configuration preferences have been saved locally.')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Personalize your care experience</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Adjust the interface, privacy controls, and communication preferences to suit your routine.</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><MoonStar className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Appearance</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Interface animation and layout preview controls</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reduced Motion</span>
                <input 
                  type="checkbox" 
                  checked={reducedMotion} 
                  onChange={(e) => { setReducedMotion(e.target.checked); handleSave(); }} 
                  className="h-4 w-4 accent-[#16A34A] cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Glassmorphism UI Engine</span>
                <input 
                  type="checkbox" 
                  checked={glassUI} 
                  onChange={(e) => { setGlassUI(e.target.checked); handleSave(); }} 
                  className="h-4 w-4 accent-[#16A34A] cursor-pointer"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Privacy & Security</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Security authorizations and HIPAA consents</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Authentication</span>
                <input 
                  type="checkbox" 
                  checked={twoFactor} 
                  onChange={(e) => { setTwoFactor(e.target.checked); handleSave(); }} 
                  className="h-4 w-4 accent-[#16A34A] cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Sharing Consent (HIPAA)</span>
                <input 
                  type="checkbox" 
                  checked={dataSharing} 
                  onChange={(e) => { setDataSharing(e.target.checked); handleSave(); }} 
                  className="h-4 w-4 accent-[#16A34A] cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Biometric Sign-In Integration</span>
                <input 
                  type="checkbox" 
                  checked={biometrics} 
                  onChange={(e) => { setBiometrics(e.target.checked); handleSave(); }} 
                  className="h-4 w-4 accent-[#16A34A] cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Smartphone className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stay informed without feeling overwhelmed</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage how frequently you receive care reminders, check-up updates, and timeline reviews.</p>
            <div className="flex items-center gap-3">
              <select 
                value={notificationCadence} 
                onChange={(e) => { setNotificationCadence(e.target.value); handleSave(); }} 
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="Daily">Daily digest</option>
                <option value="Weekly">Weekly overview</option>
                <option value="Critical">Critical alerts only</option>
              </select>
            </div>
          </div>
        </Card>

        {message && (
          <div className="mt-6 max-w-md">
            <Toast title="Settings saved" message={message} tone="success" />
          </div>
        )}
      </div>
    </div>
  )
}
