import { Link } from 'react-router-dom'
import { Sparkles, Mail, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 py-16 dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand block */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">SanjivniAI</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Healthcare Companion</p>
              </div>
            </Link>
            <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
              Empowering clinics and patients with smart symptom navigation, automated medical histories, and digital care triages.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> HIPAA Compliance Standard Design
            </div>
          </div>

          {/* Column 1 - Care Hub */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] mb-4">Care Hub</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/symptom-checker" className="hover:text-[#16A34A] transition">Symptom Checker</Link></li>
              <li><Link to="/doctor-finder" className="hover:text-[#16A34A] transition">Doctor Finder</Link></li>
              <li><Link to="/image-analysis" className="hover:text-[#16A34A] transition">Image Analysis</Link></li>
              <li><Link to="/maps" className="hover:text-[#16A34A] transition">Nearby Facilities</Link></li>
            </ul>
          </div>

          {/* Column 2 - Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-[#16A34A] transition">Care Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-[#16A34A] transition">Patient Profile</Link></li>
              <li><Link to="/settings" className="hover:text-[#16A34A] transition">Integrations</Link></li>
              <li><a href="#" className="hover:text-[#16A34A] transition">Developer API</a></li>
            </ul>
          </div>

          {/* Column 3 - Newsletter/Updates */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] mb-2">Subscribe to Care Insights</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Stay informed with secure digital health newsletters.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-xs text-slate-800 outline-none transition focus:border-[#16A34A] dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
                />
              </div>
              <button className="rounded-2xl bg-[#16A34A] px-4 py-3 text-xs font-semibold text-white hover:bg-[#15803D] transition cursor-pointer">Join</button>
            </div>
          </div>
        </div>

        {/* Disclaimer / Bottom bar */}
        <div className="mt-16 border-t border-slate-200/50 pt-8 dark:border-slate-800/80">
          <p className="text-xs leading-6 text-slate-400 dark:text-slate-500 mb-6">
            <strong>Disclaimer:</strong> SanjivniAI provides supportive medical informational guidance based on AI patterns. It does not replace professional clinical evaluation, diagnosis, or emergency response workflows. In the event of a medical emergency, please call your local emergency service (e.g. 102 / 911) immediately.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-600">
            <p>© 2026 SanjivniAI Startup. Secure HIPAA Design Standards. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#16A34A] transition">Privacy Policy</a>
              <a href="#" className="hover:text-[#16A34A] transition">Terms of Service</a>
              <a href="#" className="hover:text-[#16A34A] transition">Clinical Safety</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
