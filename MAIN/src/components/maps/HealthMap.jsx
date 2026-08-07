import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, useMap, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Compass } from 'lucide-react'
import { Card } from '../ui/Card'
import { LocationMarker } from './LocationMarker'
import { MapControls } from './MapControls'

function ResetCenter({ center, zoom, recenterTrigger }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 })
  }, [center, zoom, map, recenterTrigger])

  return null
}

function CenterActiveMarker({ activePlace, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (activePlace && activePlace.lat && activePlace.lng) {
      map.setView([activePlace.lat, activePlace.lng], Math.max(zoom, 14), {
        animate: true,
        duration: 0.6,
      })
    }
  }, [activePlace, map, zoom])

  return null
}

export function HealthMap({
  places,
  accuracy,
  gpsLoading,
  gpsStatus,
  onLocateMe,
  activePlaceId,
  setActivePlaceId,
  radius,
  onRadiusChange,
}) {
  const [zoom, setZoom] = useState(13)
  const [showHospitals, setShowHospitals] = useState(true)
  const [showClinics, setShowClinics] = useState(true)
  const [showPharmacies, setShowPharmacies] = useState(true)
  const [showDiagnostics, setShowDiagnostics] = useState(true)
  const [recenterTrigger, setRecenterTrigger] = useState(0)

  const center = useMemo(
    () => [places.currentLocation.lat, places.currentLocation.lng],
    [places.currentLocation.lat, places.currentLocation.lng],
  )

  const hospitals = useMemo(
    () => (showHospitals ? places.hospitals : []),
    [places.hospitals, showHospitals],
  )

  const clinics = useMemo(
    () => (showClinics ? places.clinics : []),
    [places.clinics, showClinics],
  )

  const pharmacies = useMemo(
    () => (showPharmacies ? places.pharmacies : []),
    [places.pharmacies, showPharmacies],
  )

  const diagnostics = useMemo(
    () => (showDiagnostics ? places.diagnostics : []),
    [places.diagnostics, showDiagnostics],
  )

  // Find the selected active place object to center the map on it
  const activePlace = useMemo(() => {
    if (!activePlaceId) return null
    return (
      places.hospitals.find((p) => p.id === activePlaceId) ||
      places.clinics.find((p) => p.id === activePlaceId) ||
      places.pharmacies.find((p) => p.id === activePlaceId) ||
      places.diagnostics.find((p) => p.id === activePlaceId)
    )
  }, [places, activePlaceId])

  const handleRecenter = () => {
    setZoom(13)
    setRecenterTrigger((prev) => prev + 1)
  }

  const handleFloatingLocate = () => {
    onLocateMe()
    setRecenterTrigger((prev) => prev + 1)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="grid gap-6 lg:grid-cols-[1.55fr_0.45fr] w-full"
    >
      <Card className="p-0 overflow-hidden border border-slate-200/80 bg-slate-100 shadow-xl dark:border-slate-800 dark:bg-slate-950/80 rounded-[2rem] w-full">
        {/* isolated stacking context (isolate z-0) prevents leaflet z-indices from overlapping page sidebars or headers */}
        <div className="relative h-[55vh] md:h-[65vh] lg:h-[min(80vh,720px)] w-full rounded-[2rem] isolate z-0 overflow-hidden">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom
            zoomControl={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <ResetCenter center={center} zoom={zoom} recenterTrigger={recenterTrigger} />
            <CenterActiveMarker activePlace={activePlace} zoom={zoom} />
            
            {/* GPS Accuracy boundary circle overlay */}
            {accuracy && (
              <Circle
                center={center}
                radius={accuracy}
                pathOptions={{
                  fillColor: '#16A34A',
                  fillOpacity: 0.12,
                  color: '#16A34A',
                  weight: 1.5,
                  dashArray: '5, 5',
                }}
              />
            )}

            <LocationMarker position={center} label="Your location" details="Current location" type="current" />
            
            {hospitals.map((hospital) => (
              <LocationMarker
                key={`hospital-${hospital.id}`}
                position={[hospital.lat, hospital.lng]}
                label={hospital.name}
                details={`${hospital.distance} • Hospital`}
                type="hospital"
                isActive={activePlaceId === hospital.id}
                onClick={() => setActivePlaceId(hospital.id)}
              />
            ))}

            {clinics.map((clinic) => (
              <LocationMarker
                key={`clinic-${clinic.id}`}
                position={[clinic.lat, clinic.lng]}
                label={clinic.name}
                details={`${clinic.distance} • Clinic`}
                type="clinic"
                isActive={activePlaceId === clinic.id}
                onClick={() => setActivePlaceId(clinic.id)}
              />
            ))}
            
            {pharmacies.map((pharmacy) => (
              <LocationMarker
                key={`pharmacy-${pharmacy.id}`}
                position={[pharmacy.lat, pharmacy.lng]}
                label={pharmacy.name}
                details={`${pharmacy.distance} • Pharmacy`}
                type="pharmacy"
                isActive={activePlaceId === pharmacy.id}
                onClick={() => setActivePlaceId(pharmacy.id)}
              />
            ))}

            {diagnostics.map((diagnostic) => (
              <LocationMarker
                key={`diagnostic-${diagnostic.id}`}
                position={[diagnostic.lat, diagnostic.lng]}
                label={diagnostic.name}
                details={`${diagnostic.distance} • Diagnostic Lab`}
                type="diagnostic"
                isActive={activePlaceId === diagnostic.id}
                onClick={() => setActivePlaceId(diagnostic.id)}
              />
            ))}
          </MapContainer>

          {/* Floating Locate Me Trigger */}
          <div className="absolute bottom-6 right-6 z-[1000]">
            <button
              onClick={handleFloatingLocate}
              disabled={gpsLoading}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xl hover:bg-slate-50 hover:text-[#16A34A] dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Locate Me"
            >
              {gpsLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin" />
              ) : (
                <Compass className="h-5.5 w-5.5 transition-transform group-hover:rotate-45" />
              )}
            </button>
          </div>

          {/* Acquiring GPS Signal Loader Overlay */}
          {gpsLoading && (
            <div className="absolute inset-x-0 bottom-6 mx-auto flex w-fit justify-center z-[1000]">
              <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xl border border-slate-100 dark:bg-slate-950/95 dark:text-slate-200 dark:border-slate-850 backdrop-blur-md">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin" />
                <span>Acquiring GPS Signal...</span>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex w-full max-w-7xl justify-center px-4 pt-4 lg:px-6 z-[1000]">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85 dark:text-slate-200 text-center">
              <p className="font-semibold text-slate-900 dark:text-white">OpenStreetMap interactive care terrain</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smooth marker interaction for hospitals, pharmacies, and nearby care points.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <MapControls
          currentLocation={center}
          zoom={zoom}
          onZoomChange={setZoom}
          onRecenter={handleRecenter}
          hospitals={places.hospitals.length}
          clinics={places.clinics.length}
          pharmacies={places.pharmacies.length}
          diagnostics={places.diagnostics.length}
          showHospitals={showHospitals}
          showClinics={showClinics}
          showPharmacies={showPharmacies}
          showDiagnostics={showDiagnostics}
          setShowHospitals={setShowHospitals}
          setShowClinics={setShowClinics}
          setShowPharmacies={setShowPharmacies}
          setShowDiagnostics={setShowDiagnostics}
          gpsStatus={gpsStatus}
          radius={radius}
          onRadiusChange={onRadiusChange}
        />

        <Card className="space-y-4 p-6 dark:border-slate-800 dark:bg-slate-900/80">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Care map insights</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Smart location intelligence</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p>View your care footprint on OpenStreetMap with hospital and pharmacy markers keyed for faster decision making.</p>
            <p>Use the controls to focus the map, toggle nearby care layers, and keep the experience seamless across desktop, tablet, and mobile.</p>
            <p>The map module lazy-loads Leaflet assets so the core SanjivniAI app stays fast and lightweight.</p>
          </div>
        </Card>
      </div>
    </motion.section>
  )
}
