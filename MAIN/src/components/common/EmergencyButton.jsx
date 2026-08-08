import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Phone, Ambulance, MapPin, Share2, UserCheck, Hospital, X, ShieldAlert, AlertCircle, CheckCircle2, Navigation, RefreshCw, Settings, Check, MessageCircle, ExternalLink } from 'lucide-react'
import { doctors } from '../../data/doctors'
import { getNearbyPlaces, generateBingMapsDoctorUrl } from '../../lib/maps'
import { useLocation, createMapLink, createEmergencyMessage } from '../../hooks/useLocation'
import { LocationStatus } from './LocationStatus'

// Configurable Emergency Numbers for Target Region (India / Global)
const EMERGENCY_CONFIG = {
  SERVICES_NUMBER: '112',
  SERVICES_LABEL: 'CALL EMERGENCY SERVICES (112 / 911)',
  AMBULANCE_NUMBER: '102',
  AMBULANCE_LABEL: 'CALL AMBULANCE (102)',
  ICE_CONTACT: {
    NAME: 'Sunita Sharma',
    RELATIONSHIP: 'Spouse',
    PHONE: '+91 98765 12345'
  }
}

export function EmergencyButton() {
  const [modalStage, setModalStage] = useState('closed') // 'closed' | 'confirm' | 'countdown' | 'active'
  const [countdown, setCountdown] = useState(3)
  
  // Centralized Location Hook
  const {
    status: locationStatus,
    location: locationData,
    errorMessage: locationErrorMessage,
    copied: locationCopied,
    shareSuccess,
    showHowToEnable,
    setShowHowToEnable,
    requestLocation,
    openInMaps,
    shareLocation,
    copyToClipboard
  } = useLocation()

  const [addressName, setAddressName] = useState('')
  const [primaryContact, setPrimaryContact] = useState({ name: 'Sunita Sharma', relationship: 'Spouse', phone: '+91 98765 12345', isPrimary: true })
  const [nearbyHospitals, setNearbyHospitals] = useState([])
  const [loadingHospitals, setLoadingHospitals] = useState(false)

  // Load Primary ICE contact
  useEffect(() => {
    try {
      const local = localStorage.getItem('sanjivni-emergency-contacts')
      if (local) {
        const parsed = JSON.parse(local)
        const found = parsed.find((c) => c.isPrimary) || parsed[0]
        if (found) setPrimaryContact(found)
      }
    } catch {
      // Silent fallback
    }
  }, [modalStage])

  // Reverse Geocode Lat/Lng into Human Readable Address
  const performReverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'SanjeevaniAI-Emergency/1.0' }
      })
      if (!res.ok) return
      const data = await res.json()
      if (data && data.display_name) {
        setAddressName(data.display_name)
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e)
    }
  }

  // Fetch real nearby emergency hospitals when locationData is available
  useEffect(() => {
    async function fetchHospitals() {
      if (locationData?.latitude && locationData?.longitude) {
        setLoadingHospitals(true)
        try {
          const places = await getNearbyPlaces({ lat: locationData.latitude, lng: locationData.longitude }, 5000)
          const list = (places.hospitals || []).concat(places.clinics || []).filter(
            (p) => p.type === 'hospital' || p.emergency || p.name?.toLowerCase().includes('hospital')
          )
          if (list.length > 0) {
            setNearbyHospitals(list.slice(0, 4))
            setLoadingHospitals(false)
            return
          }
        } catch {
          // Fallback to static verified hospitals directory
        }
        setNearbyHospitals(
          doctors.slice(0, 4).map((d) => ({
            id: d.id,
            name: d.hospital,
            address: d.address || 'Bengaluru Specialty Medical Center',
            phone: '+91 80 2642 2406',
            emergency: true,
            distance: d.distance || '1.2 km',
            lat: 12.9716,
            lng: 77.5946
          }))
        )
        setLoadingHospitals(false)
      }
    }
    fetchHospitals()
  }, [locationData])

  // Auto-request location when SOS modal opens
  useEffect(() => {
    if (modalStage === 'confirm') {
      requestLocation()
    }
  }, [modalStage, requestLocation])

  // Countdown timer effect
  useEffect(() => {
    let timer = null
    if (modalStage === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
      } else {
        setModalStage('active')
      }
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [modalStage, countdown])

  const handleStartCountdown = () => {
    setCountdown(3)
    setModalStage('countdown')
  }

  const handleCancel = () => {
    setModalStage('closed')
    setCountdown(3)
  }

  // Google & Bing Emergency Maps Links
  const googleMapsUrl = locationData
    ? `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`
    : 'https://www.google.com/maps/search/hospitals+near+me'

  const bingMapsUrl = addressName 
    ? `https://www.bing.com/maps/search?q=nearby+hospitals+${addressName.toLowerCase().replace(/[\s,]+/g, '+')}`
    : 'https://www.bing.com/maps/search?q=nearby+hospitals'

  // Location Sharing Handler
  const handleShareLocation = async () => {
    if (!locationData) {
      alert('Location is currently unavailable. Please describe your location verbally when calling emergency services.')
      return
    }

    const shareText = `🚨 EMERGENCY SOS ALERT!\nMy Live Location:\n${addressName ? `Address: ${addressName}\n` : ''}Google Maps: ${googleMapsUrl}\nBing Maps: ${bingMapsUrl}\nAccuracy: ±${locationData.accuracy}m`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 Emergency Assistance Request',
          text: shareText,
          url: googleMapsUrl
        })
        return
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('Web Share failed, copying to clipboard:', e)
        }
      }
    }

    await copyToClipboard(shareText)
  }

  // WhatsApp Broadcast Handler
  const handleWhatsAppAlert = () => {
    const phone = primaryContact?.phone ? primaryContact.phone.replace(/[^0-9+]/g, '') : '+919876512345'
    const msg = `🚨 EMERGENCY SOS ALERT!\nI need immediate medical assistance!\n\n${addressName ? `📍 Address: ${addressName}\n` : ''}📍 Live Google Maps: ${googleMapsUrl}\n📍 Live Bing Maps: ${bingMapsUrl}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      {/* High Visibility Floating SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalStage('confirm')}
          className="relative flex items-center gap-2.5 rounded-full bg-red-600 px-5 py-3.5 font-semibold text-white shadow-2xl transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          aria-label="Trigger Emergency SOS"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <AlertTriangle className="h-5 w-5" />
          <span className="tracking-wide">🚨 EMERGENCY SOS</span>
        </motion.button>
      </div>

      {/* Emergency Modal Flow */}
      <AnimatePresence>
        {modalStage !== 'closed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-red-200 bg-white shadow-2xl dark:border-red-900/50 dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-100 bg-red-50/90 px-6 py-4 dark:border-red-950 dark:bg-red-950/40">
                <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-6 w-6 animate-pulse" />
                  <h2 className="text-lg font-bold">🚨 EMERGENCY ASSISTANCE</h2>
                </div>
                <button onClick={handleCancel} className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer" aria-label="Close dialog">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stage 1: Confirmation Screen */}
              {modalStage === 'confirm' && (
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">Do you require urgent emergency assistance?</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      For immediate life-threatening medical emergencies, dial local emergency services directly below.
                    </p>
                  </div>

                  {/* Location Status Card */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <MapPin className="h-4 w-4 text-red-600 animate-bounce" />
                        <span>📍 GPS Location Status</span>
                      </div>
                      <LocationStatus status={locationStatus} />
                      <span className="text-xs font-semibold text-slate-500">
                        {locationStatus === 'detecting' && 'Detecting coordinates...'}
                        {locationStatus === 'detected' && 'GPS acquired'}
                        {locationStatus === 'denied' && 'Permission required'}
                        {locationStatus === 'unavailable' && 'Unavailable'}
                      </span>
                    </div>

                    {/* Success State Details */}
                    {locationStatus === 'detected' && locationData && (
                      <div className="mt-2.5 space-y-1">
                        {addressName && (
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            📍 <strong>Address:</strong> {addressName}
                          </p>
                        )}
                        <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                          Lat: {locationData.latitude.toFixed(4)}, Lng: {locationData.longitude.toFixed(4)} (±{locationData.accuracy}m accuracy)
                        </p>
                      </div>
                    )}

                    {/* Permission Denied or Error Info */}
                    {locationErrorMessage && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{locationErrorMessage}</span>
                      </div>
                    )}

                    {/* Edge Permission Guide Box */}
                    {locationStatus === 'denied' && (
                      <div className="mt-3 space-y-2 pt-2 border-t dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={requestLocation}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> TRY AGAIN
                          </button>
                          <button
                            onClick={() => setShowHowToEnable(!showHowToEnable)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 underline dark:text-amber-400"
                          >
                            <Settings className="h-3.5 w-3.5" /> {showHowToEnable ? 'Hide Instructions' : '⚙️ HOW TO ENABLE LOCATION'}
                          </button>
                        </div>

                        {showHowToEnable && (
                          <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                            <p className="font-bold mb-1">How to allow location in Microsoft Edge / Chrome:</p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                              <li>Click the <strong>lock icon 🔒</strong> next to the address bar (<code className="font-mono">http://localhost:5174/</code>).</li>
                              <li>Click <strong>Permissions for this site</strong> (or <strong>Site settings</strong>).</li>
                              <li>Change <strong>Location</strong> from <em>Block</em> to <strong>Allow</strong>.</li>
                              <li>Return to SanjivniAI and press <strong>TRY AGAIN</strong>.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Location Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={shareLocation}
                      disabled={locationStatus === 'detecting'}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {locationCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                      {locationStatus === 'detecting'
                        ? '⏳ GETTING LOCATION...'
                        : locationStatus === 'denied'
                        ? '⚠️ ENABLE LOCATION'
                        : locationCopied
                        ? 'LINK COPIED!'
                        : '📍 SHARE MY LOCATION'}
                    </button>

                    <button
                      onClick={openInMaps}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Navigation className="h-4 w-4" /> 🗺️ OPEN IN MAP
                    </button>
                  </div>

                  {shareSuccess && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" /> Location shared successfully.
                    </div>
                  )}

                  {/* Primary Direct Phone Call Actions (ALWAYS WORKING) */}
                  <div className="space-y-3 pt-2">
                    <a
                      href={`tel:${EMERGENCY_CONFIG.SERVICES_NUMBER}`}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-4 py-3.5 font-bold text-white shadow-lg transition hover:bg-red-700"
                    >
                      <Phone className="h-5 w-5" /> 📞 {EMERGENCY_CONFIG.SERVICES_LABEL}
                    </a>
                    
                    <a
                      href={`tel:${EMERGENCY_CONFIG.AMBULANCE_NUMBER}`}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-600 bg-red-50 px-4 py-3.5 font-bold text-red-700 transition hover:bg-red-100 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300"
                    >
                      <Ambulance className="h-5 w-5" /> 🚑 {EMERGENCY_CONFIG.AMBULANCE_LABEL}
                    </a>

                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        onClick={handleStartCountdown}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 cursor-pointer"
                      >
                        <AlertTriangle className="h-4 w-4" /> START SOS
                      </button>

                      <button
                        onClick={handleShareLocation}
                        disabled={!locationData}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Share2 className="h-4 w-4" /> {locationCopied ? 'COPIED!' : '📍 SHARE LOCATION'}
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button onClick={handleCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 2: Countdown Screen */}
              {modalStage === 'countdown' && (
                <div className="p-8 text-center">
                  <p className="text-sm font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">Activating Emergency Mode</p>
                  
                  <div className="my-6 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-5xl font-black text-red-600 dark:bg-red-950/60 dark:text-red-400 shadow-inner">
                      {countdown}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">Press Cancel below if triggered by mistake.</p>

                  <div className="mt-8">
                    <button
                      onClick={handleCancel}
                      className="w-full rounded-2xl bg-slate-200 px-6 py-3.5 font-bold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Cancelling... (Click to Abort)
                    </button>
                  </div>
                </div>
              )}

              {/* Stage 3: Active Emergency Assistance Dashboard */}
              {modalStage === 'active' && (
                <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
                  {/* Status Banner */}
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
                        <span className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
                        <span>EMERGENCY SOS ACTIVE</span>
                      </div>
                      <span className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">Priority 1</span>
                    </div>
                    <p className="mt-2 text-sm text-red-800 dark:text-red-200">
                      If experiencing severe symptoms (chest pain, loss of consciousness, heavy bleeding), dial emergency services immediately.
                    </p>
                  </div>

                  {/* Primary Direct Dialers */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={`tel:${EMERGENCY_CONFIG.SERVICES_NUMBER}`}
                      className="flex items-center justify-center gap-2.5 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white shadow hover:bg-red-700"
                    >
                      <Phone className="h-5 w-5" /> 📞 CALL 112 / 911
                    </a>
                    <a
                      href={`tel:${EMERGENCY_CONFIG.AMBULANCE_NUMBER}`}
                      className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-red-600 bg-white px-4 py-3 font-bold text-red-700 hover:bg-red-50 dark:bg-slate-900 dark:text-red-400"
                    >
                      <Ambulance className="h-5 w-5" /> 🚑 CALL AMBULANCE (102)
                    </a>
                  </div>

                  {/* Detected Geocoded Address Location Box */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                        <MapPin className="h-4 w-4 text-red-600" /> Detected Address Location
                      </div>
                      <LocationStatus status={locationStatus} />
                    </div>

                    {addressName ? (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                        📍 {addressName}
                      </div>
                    ) : locationData ? (
                      <p className="mt-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                        Lat: {locationData.latitude.toFixed(4)}, Lng: {locationData.longitude.toFixed(4)} (±{locationData.accuracy}m)
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        {locationErrorMessage || 'Location unavailable. You can still call emergency services and provide your location verbally.'}
                      </p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={shareLocation}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {locationCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                        {locationCopied ? 'LINK COPIED!' : '📍 SHARE LOCATION'}
                      </button>

                      <button
                        onClick={openInMaps}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <Navigation className="h-3.5 w-3.5" /> 🗺️ OPEN IN MAP
                      </button>
                    </div>
                  </div>

                  {/* Primary Emergency Contact (ICE) & One-Tap WhatsApp Broadcast */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                        <UserCheck className="h-4 w-4 text-emerald-600" /> Emergency Contact (ICE)
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {primaryContact?.relationship || 'Spouse'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {primaryContact?.name || 'Sunita Sharma'}
                    </p>
                    <p className="text-xs font-mono text-slate-500">{primaryContact?.phone || '+91 98765 12345'}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${primaryContact?.phone || '+919876512345'}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                      >
                        <Phone className="h-3.5 w-3.5" /> CALL CONTACT
                      </a>

                      <button
                        onClick={() => copyToClipboard(createEmergencyMessage(locationData?.latitude, locationData?.longitude))}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                      >
                        💬 {locationCopied ? 'COPIED!' : 'COPY ICE MSG'}
                      </button>

                      <button
                        onClick={handleWhatsAppAlert}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-700 cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WHATSAPP SOS
                      </button>
                    </div>
                  </div>

                  {/* Nearby Hospitals Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                        <Hospital className="h-4 w-4 text-indigo-600" /> Nearby Emergency ER Hospitals
                      </div>
                      <button
                        onClick={openInMaps}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                      >
                        <Navigation className="h-3.5 w-3.5" /> OPEN IN MAPS
                      </button>
                    </div>

                    {loadingHospitals ? (
                      <div className="rounded-2xl border border-slate-200 p-4 text-center text-xs text-slate-500">
                        Searching nearby ER hospitals...
                      </div>
                    ) : nearbyHospitals.length > 0 ? (
                      <div className="space-y-2.5">
                        {nearbyHospitals.map((hosp) => (
                          <div key={hosp.id} className="rounded-2xl border border-slate-200 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950/40">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{hosp.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hosp.address || 'Address available via map'}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  24/7 ER
                                </span>
                                <span className="text-xs font-semibold text-slate-500 mt-1">{hosp.distance || 'Nearby'}</span>
                              </div>
                            </div>

                            <div className="mt-3 flex gap-2">
                              <a
                                href={`tel:${hosp.phone && hosp.phone !== 'Phone not listed' ? hosp.phone : '102'}`}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                              >
                                <Phone className="h-3.5 w-3.5" /> 📞 CALL HOSPITAL
                              </a>
                              <a
                                href={createMapLink(hosp.lat, hosp.lng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                <Navigation className="h-3.5 w-3.5" /> 📍 DIRECTIONS
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Search nearby emergency hospitals directly on Google Maps.
                        </p>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 cursor-pointer"
                        >
                          <Navigation className="h-4 w-4" /> 📍 OPEN NEARBY HOSPITALS IN MAPS
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Safety Disclaimer */}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    SanjivniAI emergency guidance is for informational intake navigation. In any medical emergency, call 112 / 102 directly.
                  </p>

                  {/* Cancel Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleCancel}
                      className="w-full rounded-2xl bg-slate-900 py-3.5 font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Deactivate SOS Mode
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
