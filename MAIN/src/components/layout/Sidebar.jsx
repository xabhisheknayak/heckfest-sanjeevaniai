import { NavLink, useNavigate } from 'react-router-dom'
import { ShieldCheck, X, LogOut, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { getNavigationForRole } from '../../config/navigationConfig'
import { USER_ROLES } from '../../constants/roles'

export function Sidebar({ open, onClose }) {
  const { role, profile, logout } = useAuth()
  const navigate = useNavigate()

  const navConfig = getNavigationForRole(role)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      {/* Mobile Backdrop */}
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
        
        {/* Mobile close button */}
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

        {/* Brand Header & Role Badge */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">SanjivniAI</p>
              <p className="text-xs text-slate-400">{profile?.name || 'Guest User'}</p>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold border ${navConfig.badgeColor}`}>
              {navConfig.roleLabel}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1">
          {navConfig.sidebarLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#16A34A] text-white shadow-lg shadow-emerald-950/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Emergency SOS Shortcut Footer for Patients */}
        {role === USER_ROLES.PATIENT && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <AlertTriangle className="h-4 w-4 animate-pulse shrink-0" />
              <span>Emergency Assistance</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
              24/7 direct dial & location share active.
            </p>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
