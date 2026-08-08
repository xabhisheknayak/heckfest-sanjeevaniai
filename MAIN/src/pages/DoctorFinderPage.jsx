import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Globe, Compass, Navigation, ExternalLink, Stethoscope, X, ArrowRight, Phone, Clock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { doctors as defaultDoctors } from '../data/doctors'

export default function DoctorFinderPage() {
  const navigate = useNavigate()

  const [locationInput, setLocationInput] = useState('')
  const [activeLocation, setActiveLocation] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFindDoctors = (e) => {
    e.preventDefault()
    const loc = locationInput.trim() || 'Bengaluru'
    setLoading(true)
    setActiveLocation(loc)
    setTimeout(() => {
      setShowMap(true)
      setLoading(false)
    }, 600)
  }

  // Format location for Google Maps embed
  const formatQuery = (loc) => encodeURIComponent(`doctors near ${loc}`)

  const googleEmbedUrl = (loc) =>
    `https://maps.google.com/maps?q=${formatQuery(loc)}&t=&z=14&ie=UTF8&iwloc=&output=embed`

  const googleFullUrl = (loc) =>
    `https://www.google.com/maps/search/doctors+near+${loc.trim().replace(/[\s,]+/g, '+')}`

  const handleBook = (doctor) => {
    navigate('/appointments', {
      state: {
        doctor: { id: doctor.id, name: doctor.name, specialty: doctor.specialization },
        facility: { name: doctor.hospital }
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Find Nearby Doctors</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Doctors Near You — Powered by Google Maps
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl">
            Enter your area or city and get instant live results from Google Maps showing nearby doctors and clinics.
          </p>
        </motion.div>

        {/* Location Search + "Click to know nearby doctors" */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-3xl border border-teal-200/70 bg-gradient-to-br from-teal-50 via-white to-sky-50/70 p-6 shadow-sm dark:border-teal-900/50 dark:from-slate-900 dark:to-slate-950">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Search Nearby Doctors</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live results directly from Google Maps</p>
              </div>
            </div>

            <form onSubmit={handleFindDoctors} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input
                  id="location-input"
                  type="text"
                  placeholder="Enter your area (e.g. Indiranagar, Bengaluru)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="pl-9 rounded-xl border-teal-200 focus:border-teal-500 dark:border-teal-800 text-sm"
                />
              </div>
              <Button
                id="find-doctors-btn"
                type="submit"
                disabled={loading}
                className="shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 text-sm shadow-md transition cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Loading Google Maps...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    👉 Click to know nearby doctors
                  </span>
                )}
              </Button>
            </form>

            {/* Quick area shortcut chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Indiranagar, Bengaluru', 'Koramangala, Bengaluru', 'Bandra, Mumbai', 'Connaught Place, Delhi', 'T. Nagar, Chennai', 'Jubilee Hills, Hyderabad'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setLocationInput(loc)
                    setActiveLocation(loc)
                    setLoading(true)
                    setTimeout(() => { setShowMap(true); setLoading(false) }, 600)
                  }}
                  className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-600 hover:text-white hover:border-teal-600 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white cursor-pointer"
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Google Maps Nearby Doctors Result */}
        <AnimatePresence>
          {showMap && activeLocation && (
            <motion.div
              key="map-result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="space-y-4"
            >
              {/* Map Header */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Nearby Doctors in <span className="text-teal-600 dark:text-teal-400">{activeLocation}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fetching real-time data from Google Maps ·{' '}
                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-teal-700 dark:text-teal-300">
                      doctors+near+{activeLocation.replace(/[\s,]+/g, '+')}
                    </code>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={googleFullUrl(activeLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                  </a>
                  <button
                    onClick={() => setShowMap(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                    aria-label="Close map"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Embedded Google Maps Frame */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 p-0 shadow-md">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Google Maps · Live Doctor Results near <strong>{activeLocation}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Real-Time</span>
                </div>
                <iframe
                  key={activeLocation}
                  title={`Nearby doctors in ${activeLocation}`}
                  src={googleEmbedUrl(activeLocation)}
                  className="w-full border-0"
                  style={{ height: '520px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Card>

              {/* Tip bar */}
              <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                <Globe className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <p>
                  <strong>Tip:</strong> The map above shows real verified doctors from Google Maps. Click any pin on the map to see doctor details, ratings, opening hours, and directions.
                  Use <a href={googleFullUrl(activeLocation)} target="_blank" rel="noreferrer" className="underline font-semibold">Open in Google Maps</a> to explore full details in a new tab.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default Doctor Directory (when no live search active) */}
        {!showMap && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">Featured Doctors</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {defaultDoctors.map((doctor) => (
                <Card key={doctor.id} className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/80 hover:shadow-md transition flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-bold text-lg">
                      {doctor.name.replace(/^Dr\.\s*/, '').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{doctor.name}</h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{doctor.specialization}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0">★ {doctor.rating}</span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-teal-500 shrink-0" /> {doctor.hospital}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" /> {doctor.availability}
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" /> {doctor.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.name + ' ' + doctor.hospital)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition"
                    >
                      <Globe className="h-3 w-3" /> Google Maps
                    </a>
                    <Button className="flex-1 text-xs bg-teal-600 hover:bg-teal-700 text-white" onClick={() => handleBook(doctor)}>
                      Book <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
