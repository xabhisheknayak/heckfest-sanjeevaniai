import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Mail, Phone, UserCircle2, Edit3, ShieldCheck, Heart, User, Droplet, Ruler, Weight, Calendar, MapPin, AlertCircle, LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Toast } from '../components/ui/Toast'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { EmergencyContactsManager } from '../components/common/EmergencyContactsManager'

export default function ProfilePage() {
  const { profile, user, loading, updateUserProfile } = useAuth()
  const navigate = useNavigate()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [fetchError, setFetchError] = useState(null)

  // Safe Date Formatter helper
  const safeFormatDate = (val) => {
    if (!val) return 'N/A'
    try {
      if (val && typeof val.toDate === 'function') {
        return val.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      const d = new Date(val)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    } catch (err) {
      console.error('Profile loading error:', err)
    }
    return String(val)
  }

  // Profile Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    age: 30,
    gender: 'Not specified',
    bloodGroup: 'O+',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    photoURL: '',
  })

  // Sync form state when profile changes
  useEffect(() => {
    if (profile || user) {
      setEditForm({
        name: profile?.name || user?.displayName || '',
        phone: profile?.phone || '',
        age: profile?.age || 30,
        gender: profile?.gender || 'Female',
        bloodGroup: profile?.bloodGroup || 'O+',
        dateOfBirth: profile?.dateOfBirth || '',
        address: profile?.address || '',
        emergencyContact: profile?.emergencyContact || '',
        photoURL: profile?.photoURL || user?.photoURL || '',
      })
    }
  }, [profile, user])

  const handleOpenEdit = () => {
    setEditForm({
      name: profile?.name || user?.displayName || '',
      phone: profile?.phone || '',
      age: profile?.age || 30,
      gender: profile?.gender || 'Female',
      bloodGroup: profile?.bloodGroup || 'O+',
      dateOfBirth: profile?.dateOfBirth || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || '',
      photoURL: profile?.photoURL || user?.photoURL || '',
    })
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      if (!user?.uid) {
        throw new Error('Your account is not authenticated.')
      }

      if (updateUserProfile) {
        await updateUserProfile({
          name: editForm.name,
          phone: editForm.phone,
          age: Number(editForm.age) || 30,
          gender: editForm.gender,
          bloodGroup: editForm.bloodGroup,
          dateOfBirth: editForm.dateOfBirth,
          address: editForm.address,
          emergencyContact: editForm.emergencyContact,
          photoURL: editForm.photoURL,
        })
      }
      setToastType('success')
      setMessage('Profile updated successfully!')
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Profile save error:', err)
      setToastType('error')
      setMessage(err.message || 'Unable to save profile changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // 1. User is Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  // 2. User is Not Authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-16 sm:px-6 lg:px-8 dark:bg-slate-950 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Not Authenticated</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please log in to view your care profile.
            </p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 py-3"
          >
            <LogIn className="h-4 w-4" /> [ Return to Login ]
          </Button>
        </Card>
      </div>
    )
  }

  const name = profile?.name || user?.displayName || 'Registered Patient'
  const email = profile?.email || user?.email || 'N/A'
  const role = profile?.role || 'patient'
  const photoURL = profile?.photoURL || user?.photoURL || ''
  const createdAtFormatted = safeFormatDate(profile?.createdAt || user?.metadata?.creationTime)

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <Toast message={message} type={toastType} onClose={() => setMessage('')} />

      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Your care identity</h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Keep your personal details, care preferences, and health profile up to date.</p>
          </div>
          <Button
            onClick={handleOpenEdit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 self-start sm:self-auto shadow-md"
          >
            <Edit3 className="h-4 w-4" /> EDIT PROFILE
          </Button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Care Identity Card */}
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 rounded-3xl">
            <div className="flex items-center gap-4">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="rounded-3xl bg-[#DCFCE7] p-4 text-[#16A34A] dark:bg-emerald-950/40">
                  <UserCircle2 className="h-10 w-10" />
                </div>
              )}
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{name}</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize mt-0.5">
                  {role === 'doctor'
                    ? '👨‍⚕️ Doctor (Verified Practitioner)'
                    : role === 'admin'
                    ? '🛡️ System Administrator'
                    : '👤 Patient Care Member'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">UID: {user?.uid?.substring(0, 12)}...</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#16A34A]" /> <span>Email: <strong>{email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#16A34A]" /> <span>Phone: <strong>{profile?.phone || 'Not specified'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#16A34A]" /> <span>Address: <strong>{profile?.address || 'Not specified'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#16A34A]" /> <span>Member since: <strong>{createdAtFormatted}</strong></span>
              </div>
            </div>

            {/* Health Metrics & Details Grid */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vitals & Personal Information</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-semibold">Age / Gender</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile?.age || 30} yrs • {profile?.gender || 'Not specified'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-semibold">Blood Group</p>
                  <p className="font-bold text-red-600 dark:text-red-400 mt-0.5">{profile?.bloodGroup || 'O+'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-semibold">Date of Birth</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile?.dateOfBirth ? safeFormatDate(profile.dateOfBirth) : 'N/A'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-semibold">Emergency Contact</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile?.emergencyContact || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Preferences Card */}
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 rounded-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Care Preferences & Account</p>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Preferred Contact Method', value: 'Email & SMS Notifications' },
                { label: 'Care & Medication Reminders', value: 'Enabled' },
                { label: 'Language Preferences', value: 'English (US)' },
                { label: 'Allergies', value: Array.isArray(profile?.allergies) ? profile.allergies.join(', ') : (profile?.allergies || 'None specified') },
                { label: 'Chronic Conditions', value: Array.isArray(profile?.chronicConditions) ? profile.chronicConditions.join(', ') : (profile?.chronicConditions || 'None specified') },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-6 dark:border-slate-800">
              <Link to="/settings">
                <Button variant="secondary" className="w-full py-3 font-bold text-xs">
                  Manage Account Settings <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Emergency Contacts System for Patients */}
        {role !== 'admin' && (
          <div className="mt-8">
            <EmergencyContactsManager />
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
            <Input
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Contact</label>
              <Input
                value={editForm.emergencyContact}
                onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                placeholder="+91 98765 00000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Age</label>
              <Input
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
              <select
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Not specified">Not specified</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
              <Input
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
              <Input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Photo URL</label>
              <Input
                type="url"
                value={editForm.photoURL}
                onChange={(e) => setEditForm({ ...editForm, photoURL: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address</label>
            <Input
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              placeholder="Full mailing address"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
              className="text-xs font-bold"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                'SAVE CHANGES'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
