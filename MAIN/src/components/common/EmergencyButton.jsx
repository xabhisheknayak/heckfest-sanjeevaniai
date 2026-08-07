import { AlertTriangle, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { analyzeSymptoms } from '../../lib/gemini'
import { doctors } from '../../data/doctors'

export function EmergencyButton() {
  const [location, setLocation] = useState(null)
  const [firstAid, setFirstAid] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
    })
  }, [])

  const handleEmergency = async () => {
    setOpen(true)
    const nearest = doctors[0]
    const guidance = await analyzeSymptoms('chest pain, shortness of breath, dizziness')
    setFirstAid(guidance.recommendations?.join(' • ') || 'Call emergency services immediately if symptoms are severe.')
    setLocation(location || { lat: 19.076, lng: 72.8777 })
    window.alert(`Nearest hospital: ${nearest.hospital}\nEmergency contact: 112\n${firstAid}`)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleEmergency} className="flex items-center gap-3 rounded-full bg-red-600 px-4 py-3 text-white shadow-2xl">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-semibold">Emergency SOS</span>
      </motion.button>
      {open && (
        <div className="mt-3 max-w-xs rounded-3xl border border-red-200 bg-white p-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600"><MapPin className="h-4 w-4" /> Nearby support</div>
          <p className="mt-2 text-sm text-slate-600">Nearest hospital: {doctors[0].hospital}</p>
          <p className="mt-2 text-sm text-slate-600">Emergency contact: 112</p>
          <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{firstAid || 'First-aid guidance will appear here.'}</div>
        </div>
      )}
    </div>
  )
}
