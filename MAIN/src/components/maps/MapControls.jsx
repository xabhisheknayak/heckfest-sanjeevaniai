import { ZoomIn, ZoomOut, Compass, Hospital, ClipboardList, Eye, EyeOff, FlaskConical, Stethoscope } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function MapControls({
  currentLocation,
  zoom,
  onZoomChange,
  onRecenter,
  hospitals,
  clinics,
  pharmacies,
  diagnostics,
  showHospitals,
  showClinics,
  showPharmacies,
  showDiagnostics,
  setShowHospitals,
  setShowClinics,
  setShowPharmacies,
  setShowDiagnostics,
  gpsStatus,
  radius,
  onRadiusChange,
}) {
  const handleZoomIn = () => {
    if (zoom < 18) {
      onZoomChange(zoom + 1)
    }
  }

  const handleZoomOut = () => {
    if (zoom > 3) {
      onZoomChange(zoom - 1)
    }
  }

  return (
    <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Map Controls</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Customize view</h2>
        </div>

        {/* GPS Status Indicator Badge */}
        {gpsStatus && (
          <div className="flex items-center shrink-0">
            {gpsStatus === 'acquired' && (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#16A34A] dark:bg-emerald-950/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                <span>GPS Active</span>
              </div>
            )}
            {gpsStatus === 'requesting' && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-amber-500 dark:bg-amber-950/30">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>Acquiring</span>
              </div>
            )}
            {gpsStatus === 'denied' && (
              <div className="flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-rose-500 dark:bg-rose-950/30">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>GPS Blocked</span>
              </div>
            )}
            {gpsStatus === 'error' && (
              <div className="flex items-center gap-1.5 rounded-full border border-slate-300/40 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>GPS Error</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configurable Search Radius */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Search Radius</p>
        <select
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-[#16A34A] transition"
        >
          <option value={1000}>1 Kilometer (Local)</option>
          <option value={2000}>2 Kilometers</option>
          <option value={3000}>3 Kilometers (Default)</option>
          <option value={5000}>5 Kilometers</option>
          <option value={10000}>10 Kilometers (Regional)</option>
        </select>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Toggle Layers</p>
        
        <div className="flex flex-col gap-2.5">
          {/* Hospitals */}
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              showHospitals
                ? 'border-[#16A34A]/30 bg-[#16A34A]/5 text-[#15803D] dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Hospital className={`h-4 w-4 ${showHospitals ? 'text-[#16A34A]' : 'text-slate-400'}`} />
              <span>Hospitals ({hospitals})</span>
            </div>
            {showHospitals ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Clinics */}
          <button
            onClick={() => setShowClinics(!showClinics)}
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              showClinics
                ? 'border-[#0E87CC]/30 bg-[#0E87CC]/5 text-[#0A6B9C] dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className={`h-4 w-4 ${showClinics ? 'text-[#0E87CC]' : 'text-slate-400'}`} />
              <span>Clinics ({clinics})</span>
            </div>
            {showClinics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Pharmacies */}
          <button
            onClick={() => setShowPharmacies(!showPharmacies)}
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              showPharmacies
                ? 'border-[#0284C7]/30 bg-[#0284C7]/5 text-[#0369A1] dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className={`h-4 w-4 ${showPharmacies ? 'text-[#0284C7]' : 'text-slate-400'}`} />
              <span>Pharmacies ({pharmacies})</span>
            </div>
            {showPharmacies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Diagnostic Centers */}
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              showDiagnostics
                ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[#6D28D9] dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-500/20'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <FlaskConical className={`h-4 w-4 ${showDiagnostics ? 'text-[#8B5CF6]' : 'text-slate-400'}`} />
              <span>Diagnostics ({diagnostics})</span>
            </div>
            {showDiagnostics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Viewport Control Buttons */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Navigation</p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={handleZoomIn}
            disabled={zoom >= 18}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Zoom +</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleZoomOut}
            disabled={zoom <= 3}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Zoom -</span>
          </Button>

          <Button
            variant="primary"
            onClick={onRecenter}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
            title="Recenter Map"
          >
            <Compass className="h-4 w-4 text-white" />
            <span className="text-[10px] font-semibold text-white">Recenter</span>
          </Button>
        </div>
      </div>

      {/* Coordinate & Zoom Info */}
      <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-950/30 dark:border-slate-800/50 dark:text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span className="font-medium text-slate-400 dark:text-slate-500">Latitude:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{currentLocation[0]?.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-400 dark:text-slate-500">Longitude:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{currentLocation[1]?.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-400 dark:text-slate-500">Zoom level:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{zoom}</span>
        </div>
      </div>
    </Card>
  )
}
