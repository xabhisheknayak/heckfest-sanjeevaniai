import { useState } from 'react'
import { MapPin, Navigation, Share2, AlertCircle, Info, Check, Copy, MessageSquare, Send, Mail, X } from 'lucide-react'
import { useLocation } from '../../hooks/useLocation'
import { LocationStatus } from './LocationStatus'

export function LocationCard({ className = '', title = 'Current Location', showExplanation = true }) {
  const {
    status,
    location,
    errorMessage,
    copied,
    requestLocation,
    openInMaps,
    shareLocation,
    copyToClipboard,
    getMapUrl
  } = useLocation()

  const [showPrompt, setShowPrompt] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const handleGetLocationClick = () => {
    if (status === 'idle' && showExplanation) {
      setShowPrompt(true)
    } else {
      requestLocation()
    }
  }

  const handleConfirmRequest = () => {
    setShowPrompt(false)
    requestLocation()
  }

  const handleShareButtonClick = async () => {
    const success = await shareLocation()
    if (!success || !navigator.share) {
      setShareModalOpen(true)
    }
  }

  const mapsUrl = location ? getMapUrl() : 'https://maps.google.com'
  const formattedShareMessage = location
    ? `📍 My current location:\n${mapsUrl}\n\nShared from SanjivniAI.`
    : 'Location pending...'

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time GPS coordinate detection</p>
          </div>
        </div>
        <LocationStatus status={status} />
      </div>

      {/* Permission Explanation Prompt */}
      {showPrompt && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
          <div className="flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Location Access Request</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
                Allow location access so SanjivniAI can identify your current location and provide emergency assistance.
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowPrompt(false)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRequest}
              className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Allow & Detect Location
            </button>
          </div>
        </div>
      )}

      {/* Detected Location Display */}
      {status === 'detected' && location && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">GPS Coordinates</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-sm font-mono">
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-[10px] uppercase font-sans text-slate-400">Latitude</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{location.latitude}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-[10px] uppercase font-sans text-slate-400">Longitude</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{location.longitude}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-[10px] uppercase font-sans text-slate-400">Accuracy</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{location.accuracy} m</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Responsive Large Action Buttons */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={handleGetLocationClick}
          disabled={status === 'detecting'}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <MapPin className="h-4 w-4" /> {status === 'detecting' ? 'DETECTING...' : '📍 GET MY LOCATION'}
        </button>

        <button
          onClick={openInMaps}
          disabled={!location}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Navigation className="h-4 w-4" /> 🗺️ VIEW ON MAP
        </button>

        <button
          onClick={handleShareButtonClick}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          {copied ? 'LINK COPIED!' : '📍 SHARE LOCATION'}
        </button>
      </div>

      {/* Multi-Platform Location Sharing Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Share2 className="h-5 w-5 text-emerald-600" />
                <span>Share Location</span>
              </div>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Direct Copy Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Location Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={mapsUrl}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button
                    onClick={() => copyToClipboard(formattedShareMessage)}
                    className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>

              {/* Direct Messaging Apps */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share via App</p>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(formattedShareMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-bold text-white shadow hover:bg-emerald-600 transition"
                >
                  <MessageSquare className="h-4 w-4" /> Share on WhatsApp
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`sms:?body=${encodeURIComponent(formattedShareMessage)}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 transition"
                  >
                    <Send className="h-4 w-4 text-sky-600" /> Send SMS
                  </a>
                  <a
                    href={`mailto:?subject=Emergency%20Location%20Share&body=${encodeURIComponent(formattedShareMessage)}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 transition"
                  >
                    <Mail className="h-4 w-4 text-amber-600" /> Send Email
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t dark:border-slate-800">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
