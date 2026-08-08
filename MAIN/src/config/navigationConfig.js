import { Activity, CalendarDays, Camera, HeartPulse, Home, Hospital, Pill, Settings, Shield, Stethoscope, UserCircle2, FileText } from 'lucide-react'
import { USER_ROLES } from '../constants/roles'

export function getNavigationForRole(role) {
  switch (role) {
    case USER_ROLES.DOCTOR:
      return {
        roleLabel: 'Doctor Portal (Verified)',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        greetingTitle: (name) => `Good morning, Dr. ${name || 'Practitioner'}`,
        greetingSubtitle: 'Here is your clinical dashboard.',
        mainDashboardPath: '/doctor/dashboard',
        sidebarLinks: [
          { to: '/doctor/dashboard', label: 'Clinical Overview', icon: Home },
          { to: '/appointments', label: 'Patient Consultations', icon: CalendarDays },
          { to: '/medical-history', label: 'Patient Records', icon: Activity },
          { to: '/profile', label: 'Practitioner Profile', icon: UserCircle2 },
          { to: '/settings', label: 'Settings', icon: Settings },
        ],
        navbarLinks: [
          { to: '/doctor/dashboard', label: 'Clinical Hub' },
          { to: '/appointments', label: 'Consultations' },
          { to: '/medical-history', label: 'Patient Records' },
        ]
      }

    case USER_ROLES.ADMIN:
      return {
        roleLabel: 'Admin Console',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        greetingTitle: (name) => `Welcome, ${name || 'Admin'}`,
        greetingSubtitle: 'Here is your SanjivniAI system overview.',
        mainDashboardPath: '/admin/dashboard',
        sidebarLinks: [
          { to: '/admin/dashboard', label: 'Admin Command Center', icon: Shield },
          { to: '/doctor-finder', label: 'Manage Doctors', icon: Stethoscope },
          { to: '/medical-history', label: 'Audit Trail Logs', icon: FileText },
          { to: '/settings', label: 'System Settings', icon: Settings },
        ],
        navbarLinks: [
          { to: '/admin/dashboard', label: 'Command Center' },
          { to: '/doctor-finder', label: 'Manage Practitioners' },
          { to: '/settings', label: 'System Settings' },
        ]
      }

    case USER_ROLES.PATIENT:
    default:
      return {
        roleLabel: 'Patient Care Hub',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        greetingTitle: (name) => `Good morning, ${name || 'Patient'}`,
        greetingSubtitle: 'How can SanjivniAI help you today?',
        mainDashboardPath: '/dashboard',
        sidebarLinks: [
          { to: '/dashboard', label: 'Dashboard', icon: Home },
          { to: '/symptom-checker', label: 'Symptom Checker', icon: HeartPulse },
          { to: '/image-analysis', label: 'Image Analysis', icon: Camera },
          { to: '/doctor-finder', label: 'Find Doctor', icon: Hospital },
          { to: '/pharmacy', label: 'Find Hospital/Pharmacy', icon: Pill },
          { to: '/appointments', label: 'Appointments', icon: CalendarDays },
          { to: '/medical-history', label: 'Medical History', icon: Activity },
          { to: '/profile', label: 'Profile', icon: UserCircle2 },
          { to: '/settings', label: 'Settings', icon: Settings },
        ],
        navbarLinks: [
          { to: '/', label: 'Home' },
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/symptom-checker', label: 'Symptom Checker' },
          { to: '/doctor-finder', label: 'Doctors' },
        ]
      }
  }
}
