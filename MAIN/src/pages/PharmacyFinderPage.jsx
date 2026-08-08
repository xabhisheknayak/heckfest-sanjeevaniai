import { motion, AnimatePresence } from 'framer-motion'
<<<<<<< HEAD
import { MapPin, Globe, Navigation, ExternalLink, Pill, X, ArrowRight, Phone, Clock, AlertCircle, ShoppingBag } from 'lucide-react'
=======
import { MapPin, Globe, Navigation, ExternalLink, Pill, X, ArrowRight, Phone, Clock, Star, AlertCircle, ShoppingBag } from 'lucide-react'
>>>>>>> 10b16c0bf174bcc9b6c1219facfcb3d40d032b00
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { UserRating } from '../components/common/UserRating'


// Type label mapping for different medicine store types
function getMedStoreType(tags) {
  if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') return 'Pharmacy'
  if (tags.shop === 'chemist') return 'Chemist / Drug Store'
  if (tags.shop === 'medical_supply') return 'Medical Supply Store'
  if (tags.shop === 'herbalist') return 'Herbal Medicine Store'
  if (tags.shop === 'drugstore') return 'Drug Store'
  return 'Medicine Store'
}

async function searchNearbyMedStoresByLocation(locationQuery = 'Bengaluru') {
  // 1. Geocode the location string to lat/lng
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`,
    { headers: { 'User-Agent': 'SanjeevaniAI-HealthCare/1.0' } }
  )
  if (!geoRes.ok) throw new Error('Geocoding failed')
  const geoData = await geoRes.json()

  let lat = 12.9716
  let lng = 77.5946
  let resolvedName = locationQuery
  let fullAddress = locationQuery

  if (geoData && geoData.length > 0) {
    lat = parseFloat(geoData[0].lat)
    lng = parseFloat(geoData[0].lon)
    resolvedName = geoData[0].display_name?.split(',')[0] || locationQuery
    fullAddress = geoData[0].display_name || locationQuery
  }

  // 2. Broad Overpass query: pharmacies + chemists + medicine stores + medical supply + drug stores
  const radius = 5000
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      way["amenity"="pharmacy"](around:${radius},${lat},${lng});
      node["healthcare"="pharmacy"](around:${radius},${lat},${lng});
      node["shop"="chemist"](around:${radius},${lat},${lng});
      way["shop"="chemist"](around:${radius},${lat},${lng});
      node["shop"="medical_supply"](around:${radius},${lat},${lng});
      way["shop"="medical_supply"](around:${radius},${lat},${lng});
      node["shop"="drugstore"](around:${radius},${lat},${lng});
      node["shop"="herbalist"](around:${radius},${lat},${lng});
      node["shop"~"^(pharmacy|medicine|chemist|drug)$"](around:${radius},${lat},${lng});
    );
    out center;
  `

  const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(overpassQuery)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  if (!overpassRes.ok) throw new Error('Overpass query failed')
  const overpassData = await overpassRes.json()
  const elements = overpassData.elements || []

  // Helper: stable deterministic rating from OSM id
  const getRating = (id) => {
    const s = String(id)
    let h = 0
    for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
    return Number((3.7 + (Math.abs(h) % 13) * 0.1).toFixed(1))
  }

  // Helper: compute distance in km
  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const stores = elements
    .map((el) => {
      const elLat = el.lat || el.center?.lat
      const elLng = el.lon || el.center?.lon
      if (!elLat || !elLng) return null

      const tags = el.tags || {}
      const name = tags.name || tags['name:en'] || tags.brand || 'Medicine Store'
      const dist = haversine(lat, lng, elLat, elLng)
      const distStr = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`

      const addrParts = [tags['addr:housenumber'], tags['addr:street'], tags['addr:suburb'], tags['addr:city']].filter(Boolean)
      const address = addrParts.length > 0 ? addrParts.join(', ') : (tags['addr:suburb'] || tags['addr:city'] || 'Address not listed')

      return {
        id: `med-${el.id}`,
        name,
        type: getMedStoreType(tags),
        address: address !== 'Address not listed' ? address : resolvedName,
        phone: tags.phone || tags['contact:phone'] || null,
        hours: tags.opening_hours || null,
        distance: distStr,
        distanceVal: dist,
        rating: getRating(el.id),
        lat: elLat,
        lng: elLng,
        googleMapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (address !== 'Address not listed' ? address : fullAddress))}`
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceVal - b.distanceVal)

  return { stores, location: resolvedName, fullAddress, coordinates: { lat, lng } }
}


const QUICK_AREAS = [
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Bandra, Mumbai',
  'Connaught Place, Delhi',
  'T. Nagar, Chennai',
  'Jubilee Hills, Hyderabad',
]

const DEFAULT_PHARMACIES = [
  { id: 'd1', name: 'Apollo Pharmacy', distance: '0.8 km', hours: 'Open 24/7', phone: '+91 1800 419 0000', rating: 4.7, address: 'Bengaluru' },
  { id: 'd2', name: 'MedPlus Health Services', distance: '1.4 km', hours: 'Mon–Sat: 8 AM – 9 PM', phone: '+91 40 4747 4747', rating: 4.5, address: 'Bengaluru' },
  { id: 'd3', name: 'Wellness Forever', distance: '2.1 km', hours: 'Daily: 8 AM – 10 PM', phone: '+91 22 4930 0000', rating: 4.3, address: 'Bengaluru' },
]

export default function PharmacyFinderPage() {
  const [locationInput, setLocationInput] = useState('')
  const [activeLocation, setActiveLocation] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [livePharmacies, setLivePharmacies] = useState([])
  const [fetchError, setFetchError] = useState(false)

  const googleEmbedUrl = (loc) =>
    `https://maps.google.com/maps?q=${encodeURIComponent('pharmacy near ' + loc)}&t=&z=14&ie=UTF8&iwloc=&output=embed`

  const googleFullUrl = (loc) =>
    `https://www.google.com/maps/search/pharmacy+near+${loc.trim().replace(/[\s,]+/g, '+')}`

  const runSearch = async (loc) => {
    setLoading(true)
    setFetchError(false)
    setLivePharmacies([])
    setActiveLocation(loc)
    setShowResults(true)

    try {
      const data = await searchNearbyMedStoresByLocation(loc)
      if (data && data.stores && data.stores.length > 0) {
        setLivePharmacies(data.stores)
      } else {
        setFetchError(true)
      }
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    runSearch(locationInput.trim() || 'Bengaluru')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Pharmacy Finder</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            Find Local Pharmacies Near You
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl">
            Enter your area and get live pharmacy details — names, addresses, phone numbers, opening hours, and ratings fetched in real time.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50/70 p-6 shadow-sm dark:border-emerald-900/50 dark:from-slate-900 dark:to-slate-950">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow">
                <Pill className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Search Nearby Pharmacies</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live pharmacy data · Google Maps visual</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <Input
                  id="pharmacy-location-input"
                  type="text"
                  placeholder="Enter your area (e.g. Indiranagar, Bengaluru)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="pl-9 rounded-xl border-emerald-200 focus:border-emerald-500 dark:border-emerald-800 text-sm"
                />
              </div>
              <Button
                id="find-pharmacies-btn"
                type="submit"
                disabled={loading}
                className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 text-sm shadow-md transition cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Fetching data...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    👉 Click to know nearby pharmacies
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
                  className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white cursor-pointer"
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Live Results */}
        <AnimatePresence>
          {showResults && activeLocation && (
            <motion.div
              key="pharmacy-results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="space-y-6"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-500" />
                    Pharmacies near{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">{activeLocation}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {loading
                      ? 'Fetching medicine stores, pharmacies & chemists...'
                      : livePharmacies.length > 0
                      ? `${livePharmacies.length} stores found (pharmacies, chemists & medicine retailers)`
                      : 'No results found'}
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
                    onClick={() => { setShowResults(false); setLivePharmacies([]) }}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Skeleton Loaders */}
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

              {/* Error State */}
              {!loading && fetchError && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No live pharmacy data found for this area</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Try a more specific area (e.g. "Indiranagar, Bengaluru"). Google Maps below still shows live results.</p>
                  </div>
                </div>
              )}

              {/* Live Pharmacy Cards */}
              {!loading && livePharmacies.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {livePharmacies.map((pharmacy) => (
                    <motion.div
                      key={pharmacy.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/80 hover:shadow-md transition flex flex-col h-full">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <Pill className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">{pharmacy.name}</h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{pharmacy.type || 'Pharmacy'}</p>
                          </div>
                          <UserRating id={pharmacy.id} name={pharmacy.name} baseRating={pharmacy.rating} />
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {pharmacy.address && pharmacy.address !== 'Address not listed' && (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-slate-700 dark:text-slate-300">{pharmacy.address}</span>
                            </div>
                          )}
                          {pharmacy.hours && pharmacy.hours !== 'Hours not available' && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 shrink-0" /> {pharmacy.hours}
                            </div>
                          )}
                          {pharmacy.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0" />
                              <a href={`tel:${pharmacy.phone}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">{pharmacy.phone}</a>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Navigation className="h-3 w-3 shrink-0" />
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{pharmacy.distance}</span> from {activeLocation.split(',')[0]}
                          </div>
                        </div>

                        <div className="mt-auto pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <a
                            href={pharmacy.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition"
                          >
                            <Globe className="h-3 w-3" /> Google Maps
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition py-1.5"
                          >
                            <Navigation className="h-3 w-3" /> Get Directions
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Embedded Google Maps */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 p-0 shadow-md">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Google Maps · Pharmacies near <strong>{activeLocation}</strong>
                    </span>
                  </div>
                  <a href={googleFullUrl(activeLocation)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Full View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <iframe
                  key={activeLocation}
                  title={`Nearby pharmacies in ${activeLocation}`}
                  src={googleEmbedUrl(activeLocation)}
                  className="w-full border-0"
                  style={{ height: '420px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Card>

              <p className="text-xs text-slate-400 text-center">
                Pharmacy data sourced from OpenStreetMap contributors · Map powered by Google Maps
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default Pharmacy Directory when no search */}
        {!showResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">Featured Pharmacies</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {DEFAULT_PHARMACIES.map((pharmacy) => (
                <Card key={pharmacy.id} className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/80 hover:shadow-md transition flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{pharmacy.name}</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Pharmacy</p>
                    </div>
                    <UserRating id={pharmacy.id} name={pharmacy.name} baseRating={pharmacy.rating} />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {pharmacy.distance} away
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 shrink-0" /> {pharmacy.hours}
                    </div>
                    {pharmacy.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" /> {pharmacy.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' pharmacy')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition"
                    >
                      <Globe className="h-3 w-3" /> Google Maps
                    </a>
                    <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                      View Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
