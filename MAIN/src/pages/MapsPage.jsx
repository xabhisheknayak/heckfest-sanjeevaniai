import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Navigation, Brain, Sparkles, ArrowRight, Star, AlertTriangle, CalendarDays } from 'lucide-react'
import { useEffect, useState, lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { Skeleton } from '../components/ui/Skeleton'
import { getNearbyPlaces } from '../lib/maps'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'

// Lazy-load HealthMap component to optimize bundle size
const HealthMap = lazy(() =>
  import('../components/maps/HealthMap').then((module) => ({
    default: module.HealthMap,
  })),
)

function MapSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_0.45fr] w-full">
      {/* Map Area Skeleton */}
      <Card className="p-0 overflow-hidden border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/80 rounded-[2rem] w-full">
        <div className="relative h-[55vh] md:h-[65vh] lg:h-[min(80vh,720px)] w-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-200/50 dark:from-slate-900 dark:to-slate-950/50 animate-pulse" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full border-4 border-[#16A34A] border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Initializing Care Map...</p>
          </div>
        </div>
      </Card>

      {/* Control Area Skeleton */}
      <div className="space-y-6">
        <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-[#16A34A]/20 dark:bg-emerald-950/40" />
            <Skeleton className="h-6 w-44" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-4">
          <Skeleton className="h-4 w-32 bg-[#16A34A]/20 dark:bg-emerald-950/40" />
          <Skeleton className="h-8 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function MapsPage() {
  const { user } = useAuth()
  
  const [places, setPlaces] = useState({
    hospitals: [],
    clinics: [],
    pharmacies: [],
    diagnostics: [],
    currentLocation: { lat: 19.0760, lng: 72.8777 },
    error: '',
  })
  
  const [loading, setLoading] = useState(true)
  const [locationResolved, setLocationResolved] = useState(false)
  const [accuracy, setAccuracy] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle') // 'idle' | 'requesting' | 'acquired' | 'denied' | 'error'
  
  // Radius settings (meters) and debounced value to limit API requests
  const [radius, setRadius] = useState(3000)
  const [debouncedRadius, setDebouncedRadius] = useState(3000)

  // Interactive bidirectional highlight selection state
  const [activePlaceId, setActivePlaceId] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Gemini symptom checker integration state
  const [latestRecord, setLatestRecord] = useState(null)
  const [loadingRecord, setLoadingRecord] = useState(true)

  const lat = places.currentLocation.lat
  const lng = places.currentLocation.lng

  // Debounce the radius slider/select input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRadius(radius)
    }, 400)

    return () => clearTimeout(handler)
  }, [radius])

  // Request browser geolocation on page mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      setPlaces((c) => ({ ...c, error: 'Geolocation is not supported by your browser.' }))
      setLocationResolved(true)
      return
    }

    setGpsLoading(true)
    setGpsStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        setPlaces((c) => ({
          ...c,
          currentLocation: { lat: latitude, lng: longitude },
          error: '',
        }))
        setAccuracy(acc)
        setGpsStatus('acquired')
        setGpsLoading(false)
        setLocationResolved(true)
      },
      (error) => {
        let errorMsg = ''
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Showing default region (Mumbai).'
          setGpsStatus('denied')
        } else {
          errorMsg = 'GPS failed to acquire position. Showing default region (Mumbai).'
          setGpsStatus('error')
        }
        setPlaces((c) => ({ ...c, error: errorMsg }))
        setGpsLoading(false)
        setLocationResolved(true)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }, [])

  // Acquire nearby places once geolocation resolves and radius debounces
  useEffect(() => {
    if (!locationResolved) return

    const load = async () => {
      setLoading(true)
      try {
        const data = await getNearbyPlaces({ lat, lng }, debouncedRadius)
        setPlaces((current) => ({
          ...current,
          hospitals: data.hospitals,
          clinics: data.clinics,
          pharmacies: data.pharmacies,
          diagnostics: data.diagnostics,
          // preserve user/geolocation error notifications if present
          error: current.error || data.error,
        }))
      } catch {
        setPlaces((current) => ({
          ...current,
          error: 'Unable to load nearby places right now.',
        }))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [lat, lng, debouncedRadius, locationResolved])

  // Retrieve the latest health analysis from Firestore/LocalStorage on mount
  useEffect(() => {
    const fetchLatestRecord = async () => {
      if (!user) {
        setLoadingRecord(false)
        return
      }
      setLoadingRecord(true)
      try {
        const record = await dataService.getLatestHealthRecord(user.uid)
        setLatestRecord(record)
      } catch (err) {
        console.error('Failed to load user symptom records:', err)
      } finally {
        setLoadingRecord(false)
      }
    }

    fetchLatestRecord()
  }, [user])

  // Scroll matching healthcare card into view when marker is clicked on map
  useEffect(() => {
    if (activePlaceId) {
      const element = document.getElementById(`place-card-${activePlaceId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [activePlaceId])

  // Trigger manual location updates
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      setPlaces((c) => ({ ...c, error: 'Geolocation is not supported by your browser.' }))
      return
    }

    setGpsLoading(true)
    setGpsStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        setPlaces((c) => ({
          ...c,
          currentLocation: { lat: latitude, lng: longitude },
          error: '',
        }))
        setAccuracy(acc)
        setGpsStatus('acquired')
        setGpsLoading(false)
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your current location.'
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location access denied. Please enable GPS permissions in your browser.'
          setGpsStatus('denied')
        } else {
          setGpsStatus('error')
        }
        setPlaces((c) => ({ ...c, error: errorMsg }))
        setAccuracy(null)
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  // Gemini recommended specialist tag
  const recommendedSpecialist = latestRecord?.ai_response?.recommended_specialist

  // Emergency Mode state computed from high severity warnings
  const isEmergencyMode = latestRecord?.severity === 'high'

  // Forced safety overrides: Switch categories to Hospitals in Emergency Mode
  useEffect(() => {
    if (isEmergencyMode) {
      setActiveTab('hospitals')
    }
  }, [isEmergencyMode])

  // AI Matching, Scoring, and Ranking Engine (Multi-Factor Analysis)
  const scoredAllPlaces = useMemo(() => {
    const all = [
      ...places.hospitals,
      ...places.clinics,
      ...places.pharmacies,
      ...places.diagnostics,
    ]

    // Fallback: sort all places by distance if no specialist recommended yet
    if (!recommendedSpecialist) {
      return all.sort((a, b) => a.distanceVal - b.distanceVal).map(p => ({
        ...p,
        aiScore: null,
        confidence: null,
      }))
    }

    const spec = recommendedSpecialist.toLowerCase()

    // Determine target categories based on the specialist requirements
    let primaryCat = 'clinic'
    let secondaryCat = 'hospital'

    if (spec.includes('pharmacy') || spec.includes('chemist') || spec.includes('pharmacist')) {
      primaryCat = 'pharmacy'
      secondaryCat = 'clinic'
    } else if (spec.includes('diagnostic') || spec.includes('lab') || spec.includes('patholog') || spec.includes('radiol')) {
      primaryCat = 'diagnostic'
      secondaryCat = 'clinic'
    } else if (spec.includes('hospital') || spec.includes('surgery') || spec.includes('emergency') || spec.includes('cardio')) {
      primaryCat = 'hospital'
      secondaryCat = 'clinic'
    }

    const scored = all.map((place) => {
      // 1. Specialty Match Score (Max 40 points)
      let specialtyScore = 0
      if (place.type === primaryCat) {
        specialtyScore = 30
      } else if (place.type === secondaryCat) {
        specialtyScore = 15
      }

      // Semantic keyword matching against facility name
      const placeName = place.name.toLowerCase()
      const keywords = []

      if (spec.includes('dentist') || spec.includes('dental')) keywords.push('dental', 'dentist', 'tooth', 'teeth')
      if (spec.includes('cardio') || spec.includes('heart')) keywords.push('heart', 'cardio', 'cardiac', 'hospital')
      if (spec.includes('child') || spec.includes('pediatric')) keywords.push('child', 'pedi', 'baby', 'kids')
      if (spec.includes('skin') || spec.includes('dermatolog')) keywords.push('skin', 'derma', 'clinic')
      if (spec.includes('eye') || spec.includes('ophthalmolog')) keywords.push('eye', 'opt', 'vision', 'laser')
      if (spec.includes('orthoped') || spec.includes('bone') || spec.includes('joint')) keywords.push('bone', 'joint', 'ortho', 'spine')

      const specWords = spec.split(/\s+/)
      specWords.forEach((word) => {
        if (word.length > 3) keywords.push(word)
      })

      let keywordMatches = 0
      keywords.forEach((kw) => {
        if (placeName.includes(kw)) {
          keywordMatches++
        }
      })
      specialtyScore += Math.min(10, keywordMatches * 5)

      // 2. Proximity Score (Max 25 points)
      // 25 points at 0km, decays by 3.5 points per km distance
      const distanceScore = Math.max(0, 25 - (place.distanceVal * 3.5))

      // 3. Emergency Score (Max 20 points)
      let emergencyScore = 0
      if (place.emergency) {
        emergencyScore = 10
        // Double weight if emergency triggers are active
        if (isEmergencyMode) {
          emergencyScore += 10
        }
      }

      // 4. Ratings Score (Max 15 points)
      // Map 3.5 - 5.0 rating tags to 0 - 15 points scale
      const ratingVal = place.rating || 4.0
      const ratingScore = Math.max(0, (ratingVal - 3.5) * 10)

      const totalScore = Math.min(100, Math.round(specialtyScore + distanceScore + emergencyScore + ratingScore))

      // Confidence indicator
      let confidence = 'Moderate Match'
      let confidenceColor = 'text-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:text-blue-400 border-blue-500/20'

      if (totalScore >= 90) {
        confidence = 'Expert Match'
        confidenceColor = 'text-[#16A34A] bg-[#DCFCE7]/70 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20'
      } else if (totalScore >= 75) {
        confidence = 'Strong Match'
        confidenceColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/25 dark:text-sky-400 border-sky-500/20'
      }

      // Explanations
      let explanation = ''
      if (keywordMatches > 0) {
        explanation = `Top match: ${place.name} explicitly references specialized services matching ${recommendedSpecialist} requirements.`
      } else if (place.type === 'hospital') {
        explanation = `High-capacity hospital matching ${recommendedSpecialist} criteria, offering advanced trauma care ${place.distance} away.`
      } else if (place.type === 'clinic') {
        explanation = `Specialized outpatient clinic suitable for ${recommendedSpecialist} consultation, located ${place.distance} from you.`
      } else if (place.type === 'pharmacy') {
        explanation = `Nearby pharmacy facility matches prescription pickup needs, located ${place.distance} away.`
      } else {
        explanation = `Clinical diagnostic center suitable for diagnostic analysis, located ${place.distance} away.`
      }

      return {
        ...place,
        aiScore: totalScore,
        aiExplanation: explanation,
        confidence,
        confidenceColor,
      }
    })

    // Sort by AI score descending
    return scored.sort((a, b) => b.aiScore - a.aiScore)
  }, [places, recommendedSpecialist, isEmergencyMode])

  // Center active map view on the nearest emergency room hospital in Emergency Mode
  useEffect(() => {
    if (isEmergencyMode && scoredAllPlaces.length > 0) {
      const targetER = scoredAllPlaces.find(p => p.type === 'hospital' && p.emergency) || scoredAllPlaces.find(p => p.type === 'hospital')
      if (targetER && activePlaceId !== targetER.id) {
        setActivePlaceId(targetER.id)
      }
    }
  }, [isEmergencyMode, scoredAllPlaces, activePlaceId])

  // Filter and sort places matching active category tab
  const sortedFilteredPlaces = useMemo(() => {
    let list = scoredAllPlaces
    if (activeTab !== 'all') {
      const typeMap = {
        hospitals: 'hospital',
        clinics: 'clinic',
        pharmacies: 'pharmacy',
        diagnostics: 'diagnostic',
      }
      const targetType = typeMap[activeTab]
      list = scoredAllPlaces.filter(p => p.type === targetType)
    }
    return list
  }, [scoredAllPlaces, activeTab])

  // AI matches deck recommendations
  const topRecommendations = useMemo(() => {
    if (!recommendedSpecialist) return []
    return scoredAllPlaces.slice(0, 3)
  }, [scoredAllPlaces, recommendedSpecialist])

  // Parsed symptom-specific first-aid guidance advisor
  const emergencyAdvice = useMemo(() => {
    if (!isEmergencyMode || !latestRecord?.symptoms) return null

    const symptomsText = latestRecord.symptoms.toLowerCase()
    let title = 'Emergency First-Aid Guidance'
    let steps = []

    if (symptomsText.includes('chest') || symptomsText.includes('heart') || symptomsText.includes('pressure') || symptomsText.includes('cardiac') || symptomsText.includes('pain')) {
      title = 'Emergency Protocol: Suspended Cardiac Distress'
      steps = [
        'Immediately stop all physical activity and sit down in a comfortable, upright position.',
        'Loosen any tight clothing around the neck and chest to aid breathing.',
        'If you have prescribed aspirin and are not allergic, chew one adult tablet (300mg) slowly.',
        'Do NOT attempt to drive yourself to the hospital. Wait for the ambulance to arrive.',
        'Stay calm and monitor breathing. If consciousness is lost, begin CPR immediately if trained.',
      ]
    } else if (symptomsText.includes('stroke') || symptomsText.includes('speech') || symptomsText.includes('numb') || symptomsText.includes('face') || symptomsText.includes('droop')) {
      title = 'Emergency Protocol: Stroke Warning FAST Check'
      steps = [
        'F - FACE: Ask the person to smile. Does one side of the face droop?',
        'A - ARMS: Ask the person to raise both arms. Does one arm drift downward?',
        'S - SPEECH: Ask the person to repeat a simple phrase. Is their speech slurred?',
        'T - TIME: If you observe any of these signs, call emergency services immediately.',
        'Keep the person lying down on their side (recovery position) if they are breathing but unresponsive.',
      ]
    } else if (symptomsText.includes('bleed') || symptomsText.includes('blood') || symptomsText.includes('hemorrhage') || symptomsText.includes('cut')) {
      title = 'Emergency Protocol: Severe Hemorrhaging Control'
      steps = [
        'Apply firm, direct pressure to the bleeding wound using a clean cloth, bandage, or gloved hand.',
        'If the wound is on a limb, elevate it above heart level while maintaining constant pressure.',
        'Do NOT remove the cloth if it gets soaked; wrap another clean layer directly on top.',
        'Keep the patient warm and lying flat to prevent clinical shock.',
        'Do NOT apply a tourniquet unless specifically trained and bleeding is completely uncontrollable.',
      ]
    } else if (symptomsText.includes('breath') || symptomsText.includes('asthma') || symptomsText.includes('suffocat') || symptomsText.includes('chok') || symptomsText.includes('dyspnea')) {
      title = 'Emergency Protocol: Acute Respiratory Distress'
      steps = [
        'Sit the person fully upright. Do NOT let them lie flat as this restricts lung capacity.',
        'Assist the person in using their rescue inhaler or bronchodilator if prescribed.',
        'Loosen any tight clothing around the chest and neck to facilitate airflow.',
        'Ensure fresh air is circulating; open windows or clear surrounding crowds.',
        'Keep the patient calm. Panic increases oxygen demands, worsening respiratory stress.',
      ]
    } else {
      title = 'Emergency Protocol: Clinical Crisis Response'
      steps = [
        'Help the patient sit or lie down in a safe, quiet, and comfortable environment.',
        'Dial local emergency response (108 / 112) immediately and describe symptoms clearly.',
        'Loosen any tight clothing and keep the patient warm to combat potential shock.',
        'Do NOT give the patient anything to eat or drink, as it can create choking hazards.',
        'Monitor breathing and pulse continuously until professional paramedics arrive.',
      ]
    }

    return { title, steps }
  }, [isEmergencyMode, latestRecord])

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Critical Emergency Banner (role="alert" for Accessibility) */}
        {isEmergencyMode && latestRecord && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            role="alert"
            aria-live="assertive"
            className="w-full rounded-[2rem] border border-red-500 bg-red-650 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 dark:bg-red-750"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/20 p-3 text-white shrink-0 animate-ping">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                  Critical: Emergency Care Activated
                  <span className="text-[9px] bg-white text-red-600 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-normal animate-pulse">Dial 108</span>
                </h2>
                <p className="text-sm font-semibold mt-1 max-w-3xl leading-relaxed text-red-100">
                  Symptom analysis indicates life-threatening risk: <span className="underline italic">"{latestRecord.symptoms}"</span>.
                  Maps are locked onto the nearest trauma facilities. Please seek immediate professional ambulance dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <a
                href="tel:108"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-red-600 px-6 py-4 text-sm font-black hover:bg-red-50 transition shadow-lg shrink-0 cursor-pointer border border-red-500/10 focus:outline-none focus:ring-4 focus:ring-red-400"
              >
                <Phone className="h-4 w-4 fill-red-600" />
                <span>Call Ambulance (108)</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Interactive Map</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Locate care quickly nearby</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 font-medium">
              See hospitals, clinics, pharmacies, and diagnostic laboratories around your location on an interactive OpenStreetMap terrain.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#DCFCE7] dark:bg-emerald-950/40 p-4 border border-[#16A34A]/10 self-start md:self-center">
            <div className="rounded-xl bg-[#16A34A] p-2 text-white shadow-md">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Service Coverage</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Mumbai Region</p>
            </div>
          </div>
        </motion.div>

        {/* Global Warnings / Notices */}
        {places.error && (
          <div className="mb-2">
            <Toast title="Maps notice" message={places.error} tone="warning" />
          </div>
        )}

        {/* Map Container Block */}
        <div className="w-full">
          {loading && !locationResolved ? (
            <MapSkeleton />
          ) : (
            <Suspense fallback={<MapSkeleton />}>
              <HealthMap
                places={places}
                accuracy={accuracy}
                gpsLoading={gpsLoading}
                gpsStatus={gpsStatus}
                onLocateMe={handleLocateMe}
                activePlaceId={activePlaceId}
                setActivePlaceId={setActivePlaceId}
                radius={radius}
                onRadiusChange={setRadius}
              />
            </Suspense>
          )}
        </div>

        {/* Emergency First-Aid Advice Block */}
        {isEmergencyMode && emergencyAdvice && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-[2rem] border border-red-500/25 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.02),_transparent_45%),#ffffff] p-6 shadow-xl dark:border-red-950/30 dark:bg-[#090505]/90"
          >
            <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
              <div className="rounded-xl bg-red-50 text-red-650 p-2 dark:bg-red-950/45 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="text-lg font-black text-red-750 dark:text-red-400">
                {emergencyAdvice.title}
              </h3>
            </div>
            
            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-semibold list-disc pl-5">
              {emergencyAdvice.steps.map((step, idx) => (
                <li key={`first-aid-step-${idx}`} className="pl-1">
                  {step}
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-3.5 border-t border-red-500/10 text-xs text-red-650 dark:text-red-400/90 font-bold italic flex items-start gap-1">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Medical Disclaimer: AI symptom triaging is for informational reference only. Always seek immediate clinical support by calling 108/112 in a medical crisis. Do not delay emergency contact.</span>
            </div>
          </motion.div>
        )}

        {/* AI Recommendations Panel */}
        {!loadingRecord && !isEmergencyMode && (
          <div className="w-full">
            {latestRecord ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="rounded-[2rem] border border-[#16A34A]/25 bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.04),_transparent_45%),#ffffff] p-6 shadow-xl dark:border-emerald-500/20 dark:bg-[#020617]/85"
              >
                {/* Panel Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#DCFCE7] p-3 text-[#16A34A] dark:bg-emerald-950/40 animate-pulse">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        AI Specialist Routing
                        <span className="text-xs bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full font-semibold border border-[#16A34A]/20">Gemini Active</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recommended specialist from your last symptom check.</p>
                    </div>
                  </div>

                  <div className="flex flex-col text-sm border-l border-slate-200 pl-4 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Required specialist</span>
                    <span className="font-bold text-[#16A34A] text-base">{recommendedSpecialist}</span>
                  </div>
                </div>

                {/* Subinfo Grid */}
                <div className="grid gap-4 md:grid-cols-2 mt-4 text-xs text-slate-600 dark:text-slate-350">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-105 dark:bg-slate-950/30 dark:border-slate-800">
                    <span className="font-bold text-slate-450 uppercase tracking-wide">Last symptoms analyzed:</span>
                    <p className="mt-1 text-slate-700 dark:text-slate-200 font-medium italic">"{latestRecord.symptoms}"</p>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-105 dark:bg-slate-950/30 dark:border-slate-800">
                    <span className="font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1">
                      Urgency Advice
                    </span>
                    <p className="mt-1 text-slate-700 dark:text-slate-200 font-semibold text-amber-600 dark:text-amber-400">{latestRecord.ai_response.urgency}</p>
                  </div>
                </div>

                {/* Ranked Recommendations List */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">AI Matches Near You</p>
                  <div className="grid gap-4 md:grid-cols-3">
                    {topRecommendations.map((place, index) => {
                      const isBestMatch = index === 0
                      const isActive = activePlaceId === place.id

                      return (
                        <div
                          key={`ai-rank-${place.id}`}
                          onClick={() => setActivePlaceId(place.id)}
                          className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-lg dark:bg-slate-900/60 select-none ${
                            isActive
                              ? 'border-[#16A34A] shadow-[0_0_15px_rgba(22,163,74,0.18)] bg-[#DCFCE7]/10 dark:bg-emerald-950/20'
                              : isBestMatch
                              ? 'border-[#16A34A]/50 bg-[#16A34A]/2'
                              : 'border-slate-200 bg-white dark:border-slate-800'
                          }`}
                        >
                          {/* Badges */}
                          <div className="flex items-center justify-between mb-3 gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                              isBestMatch
                                ? 'bg-[#16A34A] text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350'
                            }`}>
                              Rank #{index + 1}
                            </span>
                            
                            {isBestMatch && (
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[#16A34A] bg-[#DCFCE7] dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-[#16A34A]/20">
                                <Sparkles className="h-2.5 w-2.5" />
                                AI Recommended
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h3 className="font-bold text-sm text-slate-950 dark:text-white truncate">{place.name}</h3>
                              {place.aiScore && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/40 font-mono shrink-0">
                                  {place.aiScore}% Match
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                              {place.aiExplanation}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-bold text-slate-450 uppercase">{place.type}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-250">{place.distance} away</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="rounded-[2rem] border border-dashed border-slate-250 bg-white/70 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Smart AI Doctor Matchmaker</h3>
                <p className="mt-2 mx-auto max-w-xl text-sm text-slate-600 dark:text-slate-400">
                  Connect symptom checks directly to your medical locator maps. Describe what you're feeling first to find and rank specialist care points near your location.
                </p>
                <div className="mt-4">
                  <Link
                    to="/symptom-checker"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16A34A] text-white px-5 py-3 text-xs font-bold hover:bg-[#15803D] transition shadow-md"
                  >
                    <span>Check Symptoms Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Healthcare Directory List Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                {isEmergencyMode ? 'Trauma & Emergency Care' : 'Healthcare Directory'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isEmergencyMode 
                  ? 'Showing nearby emergency hospitals sorted by routing compatibility. Click a hospital card to locate its trauma ward.'
                  : recommendedSpecialist 
                  ? 'Directory is automatically ranked by AI match compatibility for your symptoms.' 
                  : 'Select a facility below to highlight and pan to its location on the map.'}
              </p>
            </div>
            
            {/* Category Tab Filters (Disabled / hidden in Emergency Mode to prevent diversion) */}
            {!isEmergencyMode && (
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'hospitals', label: 'Hospitals' },
                  { id: 'clinics', label: 'Clinics' },
                  { id: 'pharmacies', label: 'Pharmacies' },
                  { id: 'diagnostics', label: 'Diagnostics' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setActivePlaceId(null) // clear selected on filter change
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards Grid with Framer Motion layout animations */}
          {sortedFilteredPlaces.length === 0 ? (
            <div className="text-center py-12 rounded-[2rem] border border-dashed border-slate-250 bg-white dark:border-slate-800 dark:bg-slate-900/30">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No emergency hospitals found within {radius / 1000} km.</p>
              <button 
                onClick={() => setRadius((c) => Math.min(10000, c + 2000))}
                className="mt-3 text-xs font-bold text-red-600 hover:underline"
              >
                Expand Search Radius
              </button>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-[520px] overflow-y-auto pr-1 py-1"
            >
              {sortedFilteredPlaces.map((item) => {
                const isActive = activePlaceId === item.id
                
                // Color themes matching the marker icons
                const theme =
                  item.type === 'hospital'
                    ? {
                        border: isEmergencyMode ? 'border-red-500 dark:border-red-500' : 'border-emerald-500 dark:border-emerald-500/80',
                        glow: isEmergencyMode 
                          ? 'shadow-[0_0_18px_rgba(239,68,68,0.25)] ring-2 ring-red-500'
                          : 'shadow-[0_0_15px_rgba(22,163,74,0.15)] ring-2 ring-emerald-500',
                        text: isEmergencyMode ? 'text-red-650 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
                        bg: isEmergencyMode ? 'bg-red-50/15 dark:bg-red-950/20' : 'bg-emerald-50/50 dark:bg-emerald-950/20',
                        badge: isEmergencyMode
                          ? 'bg-red-600 text-white dark:bg-red-750 dark:text-white'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
                      }
                    : item.type === 'pharmacy'
                    ? {
                        border: 'border-sky-500 dark:border-sky-500/80',
                        glow: 'shadow-[0_0_15px_rgba(2,132,199,0.15)] ring-2 ring-sky-500',
                        text: 'text-sky-600 dark:text-sky-400',
                        bg: 'bg-sky-50/50 dark:bg-sky-950/20',
                        badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-350',
                      }
                    : item.type === 'diagnostic'
                    ? {
                        border: 'border-violet-500 dark:border-violet-500/80',
                        glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-2 ring-violet-500',
                        text: 'text-violet-600 dark:text-violet-450',
                        bg: 'bg-violet-50/50 dark:bg-violet-950/20',
                        badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
                      }
                    : {
                        border: 'border-blue-500 dark:border-blue-500/80',
                        glow: 'shadow-[0_0_15px_rgba(14,165,233,0.15)] ring-2 ring-blue-500',
                        text: 'text-blue-600 dark:text-blue-400',
                        bg: 'bg-blue-50/40 dark:bg-blue-950/15',
                        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                      }

                return (
                  <motion.div
                    layout
                    key={item.id}
                    id={`place-card-${item.id}`}
                    onClick={() => setActivePlaceId(item.id)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full hover:shadow-lg dark:bg-slate-900/75 select-none ${
                      isActive
                        ? `${theme.border} ${theme.glow} ${theme.bg}`
                        : 'border-slate-200 bg-white hover:-translate-y-1 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Badge and Proximity */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${theme.badge}`}>
                          {item.type}
                        </span>
                        
                        {/* Rating Stars (Ratings when available) */}
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{item.rating?.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Header and AI Score */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm leading-snug text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h3>
                        {item.aiScore && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            item.aiScore >= 90 
                              ? isEmergencyMode ? 'bg-red-100 text-red-650 dark:bg-red-950/45 dark:text-red-400' : 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/40' 
                              : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-350'
                          }`}>
                            {item.aiScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {item.address}
                      </p>

                      {/* AI Confidence and ER Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.confidence && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isEmergencyMode 
                              ? 'text-red-500 bg-red-50/50 dark:bg-red-950/20 dark:text-red-400 border-red-500/20' 
                              : item.confidenceColor
                          }`}>
                            {item.confidence}
                          </span>
                        )}
                        {item.emergency && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-500/25 bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-0.5 animate-pulse">
                            <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                            24/7 ER
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {item.phone && item.phone !== 'Phone not listed' && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-450 shrink-0" />
                          <span className="truncate">{item.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5 justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-slate-450 shrink-0" />
                          <span>{item.openingHours}</span>
                        </div>

                        {isActive && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank')
                              }}
                              className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                            >
                              <Navigation className="h-3 w-3" />
                              <span>Navigate</span>
                            </button>
                            <Link
                              to="/book-appointment"
                              state={{ facility: item }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 font-bold text-[#16A34A] hover:underline transition"
                            >
                              <CalendarDays className="h-3 w-3" />
                              <span>Book Slot</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
