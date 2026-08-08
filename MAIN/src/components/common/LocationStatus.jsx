import { MapPin, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export function LocationStatus({ status }) {
  switch (status) {
    case 'detecting':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> ⏳ Detecting location...
        </span>
      )
    case 'detected':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> ✅ Location detected
        </span>
      )
    case 'denied':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" /> ⚠️ Location permission denied
        </span>
      )
    case 'unavailable':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <XCircle className="h-3.5 w-3.5" /> ❌ Location unavailable
        </span>
      )
    case 'timeout':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5" /> ⏱️ Location request timeout
        </span>
      )
    case 'unsupported':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <XCircle className="h-3.5 w-3.5" /> 🚫 Geolocation unsupported
        </span>
      )
    case 'idle':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5" /> 📍 Location not detected
        </span>
      )
  }
}
