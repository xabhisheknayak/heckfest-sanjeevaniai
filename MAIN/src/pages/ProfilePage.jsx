import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Mail, Phone, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { EmergencyContactsManager } from '../components/common/EmergencyContactsManager'

export default function ProfilePage() {
  const { profile, user } = useAuth()

  const name = profile?.name || user?.displayName || 'Guest User'
  const email = profile?.email || user?.email || 'demo@sanjivni.ai'
  const createdAt = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active Member'

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Your care identity</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Keep your personal details, preferences, and care profile up to date.</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-[#DCFCE7] p-4 text-[#16A34A] dark:bg-emerald-950/40">
                <UserCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                  {profile?.role === 'doctor'
                    ? '👨‍⚕️ Doctor (Verified Practitioner)'
                    : profile?.role === 'admin'
                    ? '🛡️ System Administrator'
                    : '👤 Patient Care Member'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#16A34A]" /> {email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#16A34A]" /> +91 98765 43210 (Demo)
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#16A34A]" /> Created: {createdAt}
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Preferences</p>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Preferred contact', value: 'Email and SMS notifications' },
                { label: 'Care reminders', value: 'Enabled' },
                { label: 'Language preferences', value: 'English (US)' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-6 dark:border-slate-800">
              <Link to="/settings">
                <Button variant="secondary" className="w-full py-3">
                  Manage Account Settings <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Emergency Contacts System for Patients */}
        {profile?.role !== 'admin' && (
          <div className="mt-8">
            <EmergencyContactsManager />
          </div>
        )}
      </div>
    </div>
  )
}
