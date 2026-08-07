import { motion } from 'framer-motion'
import { ClipboardList, HeartPulse, Brain, CalendarDays, Camera, FileText, Search, Download, Plus } from 'lucide-react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Toast } from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { Skeleton } from '../components/ui/Skeleton'

export default function MedicalHistoryPage() {
  const { 
    user,
    fetchMedicalHistory, 
    createMedicalHistory,
    fetchAppointments,
    fetchHealthRecords,
    fetchImageAnalyses,
    fetchReports
  } = useAuth()

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Custom manual record add state
  const [newTitle, setNewTitle] = useState('')
  const [newDetail, setNewDetail] = useState('')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  // Search & Filtering states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const loadHistory = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Parallel loading of all medical records to ensure fast performance
      const [notes, symptoms, reports, appointments, images] = await Promise.all([
        fetchMedicalHistory(),
        fetchHealthRecords(),
        fetchReports(),
        fetchAppointments(),
        fetchImageAnalyses()
      ])

      const timeline = []

      // 1. Patient Personal Notes
      notes.forEach((item) => {
        timeline.push({
          id: item.id || `note-${Math.random()}`,
          title: item.title,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'note',
          details: item.detail || 'Personal journal details.',
          badge: 'Patient Note',
          badgeStyle: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border-slate-200/50 dark:border-slate-850',
          icon: <ClipboardList className="h-4.5 w-4.5" />,
          iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-300'
        })
      })

      // 2. Symptom Check Analyses (Gemini)
      symptoms.forEach((item) => {
        timeline.push({
          id: item.id,
          title: `Symptom Check: ${item.ai_response?.recommended_specialist || 'General Triaging'}`,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'symptom',
          details: `Symptoms: "${item.symptoms}". Advice: ${item.ai_response?.advice?.join(' • ') || 'Monitor carefully.'}`,
          badge: `Severity: ${item.severity || 'low'}`,
          badgeStyle: item.severity === 'high' 
            ? 'bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/40 dark:text-red-400 dark:border-red-950/30' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-950/30',
          icon: <Brain className="h-4.5 w-4.5" />,
          iconBg: item.severity === 'high' ? 'bg-red-100 text-red-650 dark:bg-red-950/50 dark:text-red-400' : 'bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/50 dark:text-emerald-400'
        })
      })

      // 3. AI Reports
      reports.forEach((item) => {
        timeline.push({
          id: item.id,
          title: `AI Health Summary: ${item.title || 'Summary report'}`,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'report',
          details: item.summary || 'Clinical details and report findings.',
          badge: 'Clinical Summary',
          badgeStyle: 'bg-violet-50 text-violet-750 border-violet-200/50 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-950/30',
          icon: <FileText className="h-4.5 w-4.5" />,
          iconBg: 'bg-violet-100 text-violet-650 dark:bg-violet-950/50 dark:text-violet-400'
        })
      })

      // 4. Appointments Scheduled
      appointments.forEach((item) => {
        timeline.push({
          id: item.id,
          title: `Appointment: ${item.doctor || 'Care Practitioner'}`,
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'appointment',
          details: `Facility: ${item.facility || 'Sanjivni Facility'} at ${item.time}. Reason: ${item.title}`,
          badge: 'Appointment Log',
          badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-950/30',
          icon: <CalendarDays className="h-4.5 w-4.5" />,
          iconBg: 'bg-blue-100 text-blue-650 dark:bg-blue-950/50 dark:text-blue-400'
        })
      })

      // 5. Image Scans (Gemini)
      images.forEach((item) => {
        timeline.push({
          id: item.id,
          title: 'Imaging Scan Assessment',
          date: new Date(item.createdAt || item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(item.createdAt || item.timestamp),
          type: 'image',
          details: `Observations: "${item.observations}". Recommendations: ${item.recommendations?.join(' • ')}`,
          badge: `Scan Match: ${item.confidence || 'High'}`,
          badgeStyle: 'bg-sky-50 text-sky-750 border-sky-200/50 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-950/30',
          icon: <Camera className="h-4.5 w-4.5" />,
          iconBg: 'bg-sky-100 text-sky-650 dark:bg-sky-950/50 dark:text-sky-400'
        })
      })

      // Sort timeline from newest to oldest
      timeline.sort((a, b) => b.timestamp - a.timestamp)
      setHistory(timeline)
    } catch (err) {
      console.error('Failed to load timeline records:', err)
    } finally {
      setLoading(false)
    }
  }, [user, fetchMedicalHistory, fetchAppointments, fetchHealthRecords, fetchImageAnalyses, fetchReports])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleAddEntry = async () => {
    if (!newTitle.trim()) {
      setToastType('warning')
      setMessage('Please enter a title for the medical record.')
      return
    }

    setAdding(true)
    setMessage('')

    try {
      await createMedicalHistory({
        title: newTitle.trim(),
        detail: newDetail.trim() || 'Record entered by patient'
      })
      setNewTitle('')
      setNewDetail('')
      setToastType('success')
      setMessage('Medical history entry added successfully!')
      loadHistory()
    } catch {
      setToastType('warning')
      setMessage('Failed to save your medical entry.')
    } finally {
      setAdding(false)
    }
  }

  // Filtered & Searched Timeline Lists
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 1. Filter Category match
      if (activeFilter !== 'all' && item.type !== activeFilter) return false

      // 2. Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchDetails = item.details.toLowerCase().includes(query)
        const matchBadge = item.badge.toLowerCase().includes(query)
        return matchTitle || matchDetails || matchBadge
      }

      return true
    })
  }, [history, activeFilter, searchQuery])

  // PDF Export Preparation Dialogue Print
  const handleExport = () => {
    const records = filteredHistory.length ? filteredHistory : history

    const printWindow = window.open('', '_blank', 'width=900,height=800')
    if (!printWindow) {
      setToastType('warning')
      setMessage('Your browser blocked the export window.')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical History Report</title>
          <style>
            body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 36px; line-height: 1.6; color: #1e293b; background-color: #fcfcfc; }
            h1 { color: #15803d; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 4px; font-size: 24px; }
            .meta { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
            .item { border-left: 3px solid #16a34a; padding-left: 16px; margin-bottom: 24px; page-break-inside: avoid; }
            .item-title { font-weight: bold; font-size: 15px; color: #0f172a; }
            .item-meta { font-size: 11px; font-weight: bold; color: #475569; margin-top: 2px; }
            .item-details { font-size: 13px; color: #334155; margin-top: 6px; }
            @media print {
              body { padding: 0; }
              h1 { font-size: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>SanjivniAI Patient Record Report</h1>
          <div class="meta">Account owner: Clinical Patient Profile | Count: ${records.length} Timeline Elements</div>
          <div>
            ${records.map(item => `
              <div class="item">
                <div class="item-title">${item.title}</div>
                <div class="item-meta">${item.date} &bull; ${item.badge}</div>
                <div class="item-details">${item.details}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
    
    setToastType('success')
    setMessage('PDF timeline export dialog opened.')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Medical history</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Clinical Care Timeline</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 font-medium">
              A comprehensive chronological overview of your symptom checks, appointments, image scans, and AI reports in one unified dashboard.
            </p>
          </div>
          
          <Button 
            variant="secondary" 
            onClick={handleExport} 
            disabled={history.length === 0}
            className="self-start md:self-center bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </motion.div>

        {/* Global Notifications */}
        {message && (
          <div className="max-w-md">
            <Toast title={toastType === 'success' ? 'Confirmed' : 'Alert'} message={message} tone={toastType} />
          </div>
        )}

        {/* Dashboard Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search symptoms, diagnoses, doctor names, reference IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent dark:border-slate-850 dark:bg-slate-950/40 dark:text-slate-200"
            />
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'symptom', label: 'Symptom Checks' },
              { id: 'appointment', label: 'Appointments' },
              { id: 'image', label: 'Image Scans' },
              { id: 'report', label: 'AI Summaries' },
              { id: 'note', label: 'Personal Notes' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer select-none ${
                  activeFilter === pill.id
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950'
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr] items-start">
          
          {/* Chronological Timeline Container */}
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#16A34A]" />
              Timeline History
            </h2>

            {loading ? (
              <div className="space-y-6 pl-4">
                {[1, 2, 3].map((n) => (
                  <div key={`skel-timeline-${n}`} className="flex gap-4 items-start">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-16">
                <HeartPulse className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-355 text-sm">No medical records matching active filters.</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing searches or filtering for other records.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-850 space-y-8 py-2">
                {filteredHistory.map((item, idx) => {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                      className="relative group"
                    >
                      {/* Timeline Icon Node */}
                      <div className={`absolute -left-[45px] top-1 h-9 w-9 rounded-full border border-white dark:border-slate-900 flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.iconBg}`}>
                        {item.icon}
                      </div>

                      {/* Content Card */}
                      <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100 dark:border-slate-850/60">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-snug text-sm sm:text-base">
                              {item.title}
                            </h3>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 block">{item.date}</span>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border max-w-max self-start sm:self-center ${item.badgeStyle}`}>
                            {item.badge}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                          {item.details}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Add Personal Medical Note Form Side Panel */}
          <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-5 h-max lg:sticky lg:top-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Plus className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Add Record Note</p>
                <p className="text-sm text-slate-550 dark:text-slate-400">Save a wellness update locally</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input 
                label="Record Title" 
                placeholder="Dentist consultation, annual blood draw" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
              />
              <Input 
                label="Detailed Notes" 
                placeholder="Prescribed cleaning, vit-D values in normal limits" 
                value={newDetail} 
                onChange={(e) => setNewDetail(e.target.value)} 
              />
              <Button className="w-full shadow-sm" onClick={handleAddEntry} disabled={adding}>
                {adding ? 'Saving...' : 'Add Note to Timeline'}
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
