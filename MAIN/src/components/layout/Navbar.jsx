import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Menu, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

export function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 glass-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar} 
            aria-label="Open menu navigation drawer"
            className="rounded-2xl border border-slate-200 p-2 lg:hidden dark:border-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 focus-ring"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
          <Link to="/" className="flex items-center gap-2 group focus-ring rounded-2xl p-1">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/50 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">SanjivniAI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Healthcare</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex dark:text-slate-300">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-[#16A34A] dark:text-[#16A34A] font-bold' : 'hover:text-[#16A34A] transition'}>Home</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-[#16A34A] dark:text-[#16A34A] font-bold' : 'hover:text-[#16A34A] transition'}>Dashboard</NavLink>
          <NavLink to="/symptom-checker" className={({ isActive }) => isActive ? 'text-[#16A34A] dark:text-[#16A34A] font-bold' : 'hover:text-[#16A34A] transition'}>Symptom Checker</NavLink>
          <NavLink to="/doctor-finder" className={({ isActive }) => isActive ? 'text-[#16A34A] dark:text-[#16A34A] font-bold' : 'hover:text-[#16A34A] transition'}>Doctors</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View notifications"
            className="rounded-2xl border border-slate-200 p-2 text-slate-600 dark:border-slate-800 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 focus-ring"
          >
            <Bell className="h-5 w-5" />
          </motion.button>
          {user ? (
            <Button variant="secondary" className="hidden sm:inline-flex" onClick={handleLogout}>Logout</Button>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="hidden sm:inline-flex">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
