import { motion } from 'framer-motion'
import { Brain, CheckCircle2, ShieldCheck, AlertTriangle, MessageSquare, Clock, Users, ArrowRight } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Link } from 'react-router-dom'
import { SEO } from '../components/common/SEO'

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.08),_transparent_45%),linear-gradient(120deg,_#f8fafc_0%,_#f1f5f9_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.12),_transparent_40%),linear-gradient(120deg,_#020617_0%,_#090d16_100%)] dark:text-slate-100">
      <SEO title="SanjivniAI | Premium AI-Guided Digital Care" description="Navigate your medical symptoms, track wellness trends, and schedule specialist care securely." />
      <Navbar />

      <main className="overflow-hidden">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8 lg:py-28">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400"
            >
              <Brain className="h-4 w-4" /> Next-Gen AI Health Nav
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white leading-tight"
            >
              Healthcare guidance,
              <span className="block text-[#16A34A] bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">made calm and clear.</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl"
            >
              SanjivniAI parses medical logs, triages symptoms, and maps diagnostic options to direct you to the right care paths, skipping the search fatigue.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/signup">
                <Button className="px-8 py-4 text-sm font-bold shadow-lg shadow-emerald-500/10">Launch Secure Hub</Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" className="px-8 py-4 text-sm font-bold">See How It Works</Button>
              </a>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex flex-wrap gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> HIPAA Compliant Architecture</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Direct Clinic Scheduling</div>
            </motion.div>
          </motion.div>

          {/* Futuristic Interactive Hero Image Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative mt-12 lg:mt-0 flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-[3rem] bg-emerald-400/10 blur-3xl opacity-40 dark:bg-emerald-950/20" />
            <div className="relative z-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-w-[500px]">
              <img 
                src="/hero_healthcare_ai.png" 
                loading="lazy" 
                alt="SanjivniAI Medical Neural Network" 
                className="w-full h-auto rounded-[1.5rem] object-cover aspect-[4/3]"
              />
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: PROBLEM STATEMENT (THE GAP COMPARISON) */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#16A34A]">The Diagnostic Gap</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl dark:text-white">Why internet search leads to anxiety</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">Standard search engines list worst-case condition warnings, generating diagnostics confusion without providing clear doctor paths.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* The Old Way */}
            <motion.div 
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-red-200/50 bg-red-50/10 p-8 dark:border-red-950/20 dark:bg-red-950/5 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[4rem]" />
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-6">
                  <div className="rounded-2xl bg-red-100 dark:bg-red-950/50 p-2.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Traditional Health Search</h3>
                </div>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-350">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5">•</span>
                    Conflicting suggestions from outdated forums.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5">•</span>
                    Unregulated ads prioritizing commercial targets over symptom logic.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5">•</span>
                    Generates unnecessary panic without clear local care references.
                  </li>
                </ul>
              </Card>
            </motion.div>

            {/* The SanjivniAI Way */}
            <motion.div 
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-emerald-200/50 bg-emerald-50/10 p-8 dark:border-emerald-950/20 dark:bg-emerald-950/5 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[4rem]" />
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-6">
                  <div className="rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 p-2.5">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">The SanjivniAI Solution</h3>
                </div>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-350">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#16A34A] font-bold">✓</span>
                    Structured conversational guides designed to collect symptoms calmly.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#16A34A] font-bold">✓</span>
                    Gemini AI algorithms parsing severity guidelines.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#16A34A] font-bold">✓</span>
                    Immediate routing to verified specialists and nearby map facilities.
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="how-it-works" className="bg-slate-50/50 dark:bg-slate-900/10 py-20 border-y border-slate-200/60 dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#16A34A]">Care Pathway</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl dark:text-white">How SanjivniAI coordinates your health</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', title: 'Intake Symptoms', desc: 'Describe how you feel using natural conversational language.', icon: MessageSquare },
                { step: '02', title: 'AI Analysis', desc: 'Gemini structures possible scenarios and maps recovery plans.', icon: Brain },
                { step: '03', title: 'Wellness Diary', desc: 'Saves summaries, logs activity milestones, and updates scores.', icon: Clock },
                { step: '04', title: 'Clinic Connect', desc: 'Handoff clinical notes and schedule checkups with specialists.', icon: Users },
              ].map((item, idx) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="relative group"
                >
                  <Card hover={true} className="p-6 h-full flex flex-col justify-between dark:border-slate-800 dark:bg-slate-950/40 relative overflow-hidden">
                    <div className="absolute -top-4 -right-2 text-6xl font-extrabold text-slate-100 dark:text-slate-900 select-none opacity-40 group-hover:scale-105 transition">
                      {item.step}
                    </div>
                    <div>
                      <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-3 text-[#16A34A]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: CORE FEATURES */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#16A34A]">Intelligence Suite</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl dark:text-white">Built for modern digital health</h2>
            </div>
            <Link to="/signup">
              <Button className="gap-2">Explore platform features <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { title: 'AI Symptom Intelligence', desc: 'Calm intake systems evaluate symptom duration and active medications using Gemini models.', icon: Brain, bg: 'from-emerald-500/5 to-teal-500/5' },
                { title: 'Verified Doctor Finder', desc: 'Sort nearby medical specialists by experience, distance ratings, and open schedules.', icon: Users, bg: 'from-sky-500/5 to-indigo-500/5' },
                { title: 'Unified Care Dashboard', desc: 'Track your health score benchmarks, check upcoming bookings, and store medical history timelines.', icon: Clock, bg: 'from-emerald-500/5 to-indigo-500/5' },
                { title: 'Conversational Care Support', desc: 'Chat directly with our digital assistant to clarify wellness metrics and safety guidelines.', icon: MessageSquare, bg: 'from-teal-500/5 to-cyan-500/5' },
              ].map((feature, idx) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card hover={true} className={`p-6 bg-gradient-to-br ${feature.bg} dark:border-slate-800 dark:bg-slate-900/30 h-full`}>
                    <div className="mb-4 inline-flex rounded-2xl bg-white dark:bg-slate-950 p-3 text-[#16A34A] shadow-sm">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-450">{feature.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Dashboard Mockup card preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center"
            >
              <Card className="p-3 border-slate-200 bg-slate-50/50 shadow-2xl dark:border-slate-800 dark:bg-slate-900/40 w-full">
                <img 
                  src="/digital_health_dashboard.png" 
                  loading="lazy" 
                  alt="SanjivniAI Analytics Dashboard" 
                  className="w-full h-auto rounded-2xl object-cover aspect-[4/3] shadow-md"
                />
              </Card>
            </motion.div>
          </div>
        </section>

        {/* SECTION 5: TRUST, RESPONSIBLE AI & HIPAA */}
        <section className="bg-slate-950 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_35%)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#10B981]">Clinical Trust</p>
                <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl leading-tight">Patient privacy is our code.</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  SanjivniAI is designed with standard medical software safety, incorporating end-to-end data encryption and strict HIPAA-aligned design rules.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { title: 'Responsible AI Checks', desc: 'Gemini parameters focus strictly on triages, omitting speculative medical diagnoses.', icon: ShieldCheck },
                  { title: 'Secure Vault Logs', desc: 'All medical timelines and local database files are encrypted at rest inside device nodes.', icon: CheckCircle2 },
                  { title: 'Transparent Disclaimer', desc: 'All suggestions display safety notifications indicating the necessity of doctor reviews.', icon: AlertTriangle },
                  { title: 'No Third-Party Shares', desc: 'We never sell clinical details or diagnostic logs to third-party ad networks.', icon: Users },
                ].map((trust) => (
                  <div key={trust.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                    <div className="mb-3 inline-flex rounded-xl bg-[#10B981]/15 p-2 text-[#10B981]">
                      <trust.icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">{trust.title}</h4>
                    <p className="text-xs leading-relaxed text-slate-400">{trust.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FINAL CTA */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-gradient-to-r from-[#16A34A] to-[#0D9488] p-10 text-white sm:p-16 dark:border-slate-800"
          >
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">Ready to begin?</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">Start your secure digital health logs</h2>
              <p className="mt-4 text-sm leading-relaxed text-emerald-50">Create your account in under 2 minutes, analyze symptoms with Gemini guidance, and organize scheduling.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <Button variant="white" className="font-bold px-8 py-4">Create Free Account</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline-white" className="font-bold px-8 py-4">Explore Demo Hub</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
