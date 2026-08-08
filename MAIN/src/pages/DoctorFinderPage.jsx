import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Globe, Navigation, ExternalLink, Stethoscope, X, ArrowRight, Phone, Clock, Building2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { doctors as defaultDoctors } from '../data/doctors'
import { searchNearbyDoctorsByLocation } from '../lib/maps'
import { UserRating } from '../components/common/UserRating'

export default function DoctorFinderPage() {
  const navigate = useNavigate()

  const [locationInput, setLocationInput] = useState('')
  const [activeLocation, setActiveLocation] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [liveDoctors, setLiveDoctors] = useState([])
  const [fetchError, setFetchError] = useState(false)

  const googleEmbedUrl = (loc) =>
    `https://maps.google.com/maps?q=${encodeURIComponent('doctors clinics near ' + loc)}&t=&z=14&ie=UTF8&iwloc=&output=embed`

  const googleFullUrl = (loc) =>
    `https://www.google.com/maps/search/doctors+clinics+near+${loc.trim().replace(/[\s,]+/g, '+')}`

  const runSearch = async (loc) => {
    setLoading(true)
    setFetchError(false)
    setLiveDoctors([])
    setActiveLocation(loc)
    setShowMap(true)

    try {
      const data = await searchNearbyDoctorsByLocation(loc)
      if (data && data.doctors && data.doctors.length > 0) {
        setLiveDoctors(data.doctors)
      } else {
        setFetchError(true)
      }
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleFindDoctors = (e) => {
    e.preventDefault()
    const loc = locationInput.trim() || 'Bengaluru'
    runSearch(loc)
  }

  const handleBook = (doctor) => {
    navigate('/appointments', {
      state: {
        doctor: { id: doctor.id, name: doctor.name, specialty: doctor.specialization },
        facility: { name: doctor.hospital }
      }
    })
  }

  const QUICK_AREAS = [
    'Indiranagar, Bengaluru',
    'Koramangala, Bengaluru',
    'Bandra, Mumbai',
    'Connaught Place, Delhi',
    'T. Nagar, Chennai',
    'Jubilee Hills, Hyderabad',
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Nearby Doctor Search</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Find Local Doctors & Clinics
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl">
            Enter your area and get live clinic and doctor details — names, addresses, phone numbers, and ratings fetched in real time.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-3xl border border-teal-200/70 bg-gradient-to-br from-teal-50 via-white to-sky-50/70 p-6 shadow-sm dark:border-teal-900/50 dark:from-slate-900 dark:to-slate-950">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Search Nearby Doctors & Clinics</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live clinic data fetched from OpenStreetMap · Google Maps visual</p>
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
                    Fetching data...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    👉 Click to know nearby doctors
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Area Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_AREAS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => { setLocationInput(loc); runSearch(loc) }}
                  className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-600 hover:text-white hover:border-teal-600 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white cursor-pointer"
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Live Results */}
        <AnimatePresence>
          {showMap && activeLocation && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="space-y-6"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Doctors & Clinics near{' '}
                    <span className="text-teal-600 dark:text-teal-400">{activeLocation}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {loading ? 'Fetching clinic data from OpenStreetMap...' : liveDoctors.length > 0 ? `${liveDoctors.length} clinics & doctors found` : 'No results found'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={googleFullUrl(activeLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                  </a>
                  <button
                    onClick={() => { setShowMap(false); setLiveDoctors([]) }}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* LIVE CLINIC CARDS fetched from OpenStreetMap */}
              {loading && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse">
                      <div className="flex gap-3 items-start">
                        <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && fetchError && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No live clinic data found for this location</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Try a more specific area (e.g. "Indiranagar, Bengaluru"). The Google Maps embed below still shows real nearby results.</p>
                  </div>
                </div>
              )}

              {!loading && liveDoctors.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {liveDoctors.map((doctor) => {
                    const isClinic = doctor.specialization?.toLowerCase().includes('general') || doctor.hospital?.toLowerCase().includes('clinic')
                    return (
                      <motion.div
                        key={doctor.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/80 hover:shadow-md transition flex flex-col h-full">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-lg ${isClinic ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400'}`}>
                              {isClinic ? <Building2 className="h-5 w-5" /> : (doctor.hospital?.charAt(0) || 'D')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">{doctor.hospital || doctor.name}</h3>
                              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{doctor.specialization}</p>
                            </div>
                            <UserRating id={doctor.id} name={doctor.hospital || doctor.name} baseRating={doctor.rating} />
                          </div>

                          <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                            {doctor.address && doctor.address !== 'Address not listed' && (
                              <div className="flex items-start gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700 dark:text-slate-300">{doctor.address}</span>
                              </div>
                            )}
                            {doctor.availability && doctor.availability !== 'Hours not listed' && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 shrink-0" /> {doctor.availability}
                              </div>
                            )}
                            {doctor.phone && doctor.phone !== '+91 80 2500 0000' && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 shrink-0" />
                                <a href={`tel:${doctor.phone}`} className="hover:text-teal-600 dark:hover:text-teal-400 transition">{doctor.phone}</a>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Navigation className="h-3 w-3 shrink-0" />
                              <span className="font-semibold text-teal-600 dark:text-teal-400">{doctor.distance}</span> from {activeLocation.split(',')[0]}
                            </div>
                          </div>

                          <div className="mt-auto pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                            <a
                              href={doctor.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((doctor.hospital || doctor.name) + ' ' + (doctor.address || activeLocation))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition"
                            >
                              <Globe className="h-3 w-3" /> Google Maps
                            </a>
                            <Button
                              className="flex-1 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                              onClick={() => handleBook(doctor)}
                            >
                              Book <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Embedded Google Maps below the cards */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 p-0 shadow-md">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Google Maps · Doctors & Clinics near <strong>{activeLocation}</strong>
                    </span>
                  </div>
                  <a href={googleFullUrl(activeLocation)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Full View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <iframe
                  key={activeLocation}
                  title={`Nearby doctors in ${activeLocation}`}
                  src={googleEmbedUrl(activeLocation)}
                  className="w-full border-0"
                  style={{ height: '420px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Card>

              <p className="text-xs text-slate-400 text-center">
                Clinic data sourced from OpenStreetMap contributors · Map powered by Google Maps
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default Doctor Directory when no search */}
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
                    <UserRating id={doctor.id} name={doctor.name} baseRating={doctor.rating} />
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
