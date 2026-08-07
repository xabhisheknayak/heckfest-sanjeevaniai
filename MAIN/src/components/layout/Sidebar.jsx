import { NavLink } from 'react-router-dom'
import { Activity, CalendarDays, Camera, HeartPulse, Home, Hospital, Pill, Settings, ShieldCheck, UserCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/dashboard', label: 'Overview', icon: Home },
  { to: '/symptom-checker', label: 'Symptom Checker', icon: HeartPulse },
  { to: '/image-analysis', label: 'Image Analysis', icon: Camera },
  { to: '/doctor-finder', label: 'Doctor Finder', icon: Hospital },
  { to: '/pharmacy', label: 'Pharmacy Finder', icon: Pill },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/medical-history', label: 'Medical History', icon: Activity },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop overlay for mobile viewport */}
      <AnimatePresence>
        {open && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200/70 bg-slate-950/95 p-5 text-slate-100 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile close button wrapper */}
        <div className="flex justify-end lg:hidden mb-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onClose} 
            type="button"
            className="rounded-2xl border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">SanjivniAI</p>
            <p className="text-xs text-slate-400">Secure care companion</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#16A34A] text-white shadow-lg shadow-emerald-950/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-300">AI triage online now</p>
          <p className="mt-2 text-xs text-slate-350 leading-relaxed">Get a guided clinical overview in under 2 minutes.</p>
        </div>
      </aside>
    </>
  )
}
