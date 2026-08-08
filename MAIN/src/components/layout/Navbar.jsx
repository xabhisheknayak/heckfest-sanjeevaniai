import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Menu, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { getNavigationForRole } from '../../config/navigationConfig'
import { motion } from 'framer-motion'

export function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()

  const navConfig = getNavigationForRole(role)

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
          <Link to={navConfig.mainDashboardPath} className="flex items-center gap-2 group focus-ring rounded-2xl p-1">
            <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/50 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">SanjivniAI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{navConfig.roleLabel}</p>
            </div>
          </Link>
        </div>

        {/* Dynamic Role-Aware Nav Links */}
        <nav className="hidden items-center gap-6 text-xs font-bold text-slate-600 md:flex dark:text-slate-300">
          {navConfig.navbarLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-[#16A34A] dark:text-[#16A34A] font-extrabold' : 'hover:text-[#16A34A] transition'
              }
            >
              {item.label}
            </NavLink>
          ))}
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
            <Button variant="secondary" className="hidden sm:inline-flex text-xs py-2" onClick={handleLogout}>Logout</Button>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="hidden sm:inline-flex text-xs py-2">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
