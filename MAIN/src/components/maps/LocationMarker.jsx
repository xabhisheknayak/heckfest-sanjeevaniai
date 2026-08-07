import { useEffect, useRef } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Create custom icons for each location type
const createCustomIcon = (type, isActive = false) => {
  if (type === 'current') {
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `
        <div class="relative flex h-8 w-8 items-center justify-center">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A]/40 opacity-75"></span>
          <span class="relative inline-flex h-4.5 w-4.5 rounded-full border-2 border-white bg-[#16A34A] shadow-[0_4px_12px_rgba(22,163,74,0.4)]"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -12],
    })
  }

  if (type === 'hospital') {
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `
        <div class="relative flex h-10 w-10 items-center justify-center transition-all duration-300 ${
          isActive ? 'scale-125 z-50 drop-shadow-[0_0_12px_rgba(22,163,74,0.6)]' : 'drop-shadow-lg'
        }">
          <div class="absolute bottom-0 w-8 h-8 rounded-t-full rounded-bl-full bg-[#16A34A] border-2 border-white rotate-45 transform origin-bottom-left flex items-center justify-center shadow-lg"></div>
          <!-- Inner icon (cross symbol) -->
          <div class="absolute inset-0 flex items-center justify-center pb-2 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -36],
    })
  }

  if (type === 'pharmacy') {
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `
        <div class="relative flex h-10 w-10 items-center justify-center transition-all duration-300 ${
          isActive ? 'scale-125 z-50 drop-shadow-[0_0_12px_rgba(2,132,199,0.6)]' : 'drop-shadow-lg'
        }">
          <div class="absolute bottom-0 w-8 h-8 rounded-t-full rounded-bl-full bg-[#0284C7] border-2 border-white rotate-45 transform origin-bottom-left flex items-center justify-center shadow-lg"></div>
          <!-- Inner icon (beaker/medical symbol) -->
          <div class="absolute inset-0 flex items-center justify-center pb-2 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -36],
    })
  }

  if (type === 'diagnostic') {
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `
        <div class="relative flex h-10 w-10 items-center justify-center transition-all duration-300 ${
          isActive ? 'scale-125 z-50 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]' : 'drop-shadow-lg'
        }">
          <div class="absolute bottom-0 w-8 h-8 rounded-t-full rounded-bl-full bg-[#8B5CF6] border-2 border-white rotate-45 transform origin-bottom-left flex items-center justify-center shadow-lg"></div>
          <!-- Inner icon (microscope/lab flask) -->
          <div class="absolute inset-0 flex items-center justify-center pb-2 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -36],
    })
  }

  // Fallback for clinics/doctors
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="relative flex h-10 w-10 items-center justify-center transition-all duration-300 ${
        isActive ? 'scale-125 z-50 drop-shadow-[0_0_12px_rgba(14,165,233,0.6)]' : 'drop-shadow-lg'
      }">
        <div class="absolute bottom-0 w-8 h-8 rounded-t-full rounded-bl-full bg-[#0E87CC] border-2 border-white rotate-45 transform origin-bottom-left flex items-center justify-center shadow-lg"></div>
        <!-- Inner icon (stethoscope/cross) -->
        <div class="absolute inset-0 flex items-center justify-center pb-2 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36],
  })
}

export function LocationMarker({ position, label, details, type, isActive, onClick }) {
  const icon = createCustomIcon(type, isActive)
  const markerRef = useRef(null)

  // Trigger popup programmatically if highlighted from list
  useEffect(() => {
    if (isActive && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [isActive])

  if (!position || !position[0] || !position[1]) return null

  return (
    <Marker
      position={position}
      icon={icon}
      ref={markerRef}
      eventHandlers={{
        click: () => {
          if (onClick) onClick()
        },
      }}
    >
      <Popup className="custom-leaflet-popup">
        <div className="p-3 font-sans min-w-[200px] text-slate-800 dark:text-slate-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${
              type === 'current' ? 'bg-[#16A34A] animate-pulse' :
              type === 'hospital' ? 'bg-[#16A34A]' :
              type === 'pharmacy' ? 'bg-[#0284C7]' :
              type === 'diagnostic' ? 'bg-[#8B5CF6]' :
              'bg-[#0E87CC]'
            }`} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {type === 'current' ? 'You are here' : 
               type === 'hospital' ? 'Hospital' : 
               type === 'pharmacy' ? 'Pharmacy' : 
               type === 'diagnostic' ? 'Diagnostic Lab' : 
               'Clinic'}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-tight text-slate-900 dark:text-white">{label}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{details}</p>
          {type !== 'current' && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-[#16A34A] font-semibold bg-[#DCFCE7] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Active
              </span>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`, '_blank')}
                className="text-[10px] font-semibold text-[#16A34A] hover:underline transition flex items-center gap-1 cursor-pointer"
              >
                <span>Directions</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
