import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Building, ShieldAlert, Sparkles, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Toast } from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'

const defaultFacilities = [
  { id: 'f-1', name: 'Lilavati Hospital & Research Centre', type: 'hospital', address: 'Bandra West, Mumbai', rating: 4.8, emergency: true },
  { id: 'f-2', name: 'Apex Multispecialty Clinic', type: 'clinic', address: 'Andheri East, Mumbai', rating: 4.5, emergency: false },
  { id: 'f-3', name: 'Metropolis Diagnostic Laboratory', type: 'diagnostic', address: 'Borivali West, Mumbai', rating: 4.7, emergency: false },
  { id: 'f-4', name: 'Apollo Pharmacy Consultation', type: 'pharmacy', address: 'Colaba, Mumbai', rating: 4.3, emergency: false }
]

const doctorsData = {
  'f-1': [
    { id: 'd-1', name: 'Dr. Aditya Nair', specialty: 'Cardiologist', experience: '15+ yrs exp', rating: 4.9, avatar: 'AN' },
    { id: 'd-2', name: 'Dr. Priya Sharma', specialty: 'Pediatrician', experience: '10+ yrs exp', rating: 4.8, avatar: 'PS' }
  ],
  'f-2': [
    { id: 'd-3', name: 'Dr. Rahul Mehta', specialty: 'General Physician', experience: '8 yrs exp', rating: 4.6, avatar: 'RM' },
    { id: 'd-4', name: 'Dr. Sneha Patil', specialty: 'Dermatologist', experience: '12 yrs exp', rating: 4.7, avatar: 'SP' }
  ],
  'f-3': [
    { id: 'd-5', name: 'Dr. Vikram Roy', specialty: 'Pathologist', experience: '14 yrs exp', rating: 4.9, avatar: 'VR' },
    { id: 'd-6', name: 'Dr. Anjali Desai', specialty: 'Radiologist', experience: '11 yrs exp', rating: 4.8, avatar: 'AD' }
  ],
  'f-4': [
    { id: 'd-7', name: 'Dr. Rohan Shah', specialty: 'Pharmacotherapist', experience: '7 yrs exp', rating: 4.4, avatar: 'RS' }
  ]
}

const dates = [
  { label: 'Today', value: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
  { label: 'Tomorrow', value: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
  { label: 'Monday', value: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
  { label: 'Tuesday', value: new Date(Date.now() + 259200000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
]

const timeSlots = [
  { period: 'Morning', slots: ['09:00 AM', '10:30 AM', '11:45 AM'] },
  { period: 'Afternoon', slots: ['01:30 PM', '02:45 PM', '04:00 PM'] },
  { period: 'Evening', slots: ['05:30 PM', '06:45 PM', '07:30 PM'] }
]

export default function AppointmentBookingPage() {
  const { user, createAppointment } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State wizard
  const [step, setStep] = useState(1)
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [bookingRef, setBookingRef] = useState('')

  // Handle incoming routing params from maps selection page
  useEffect(() => {
    if (location.state?.facility) {
      const incoming = location.state.facility
      // Match incoming type or structure to default facilities list
      const matched = defaultFacilities.find(f => f.name.toLowerCase().includes(incoming.name.toLowerCase())) || {
        id: `f-${incoming.id}`,
        name: incoming.name,
        type: incoming.type,
        address: incoming.address || 'Address from search locator',
        rating: incoming.rating || 4.5,
        emergency: incoming.emergency || false
      }
      
      setSelectedFacility(matched)
      setStep(2) // Jump straight to choosing doctor
    }
  }, [location])

  const handleNext = () => {
    if (step === 1 && !selectedFacility) {
      setErrorMsg('Please choose a healthcare facility to proceed.')
      return
    }
    if (step === 2 && !selectedDoctor) {
      setErrorMsg('Please select a healthcare provider to proceed.')
      return
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      setErrorMsg('Please select an appointment date and time slot.')
      return
    }
    setErrorMsg('')
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setErrorMsg('')
    setStep(s => Math.max(1, s - 1))
  }

  const handleConfirmBooking = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      const refId = `APT-${Math.floor(100000 + Math.random() * 900000)}`
      await createAppointment({
        title: reason.trim() || 'Routine wellness assessment',
        time: `${selectedDate.value} at ${selectedTime}`,
        doctor: selectedDoctor.name,
        facility: selectedFacility.name,
        facilityAddress: selectedFacility.address,
        ref: refId
      })
      setBookingRef(refId)
      setStep(5) // Navigate to success confirmation screen
    } catch {
      setErrorMsg('Connection offline. Unable to store appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Doctors belonging to the active facility selection
  const doctorsList = selectedFacility ? (doctorsData[selectedFacility.id] || [
    { id: 'd-fallback', name: 'Dr. Nair (On-call)', specialty: 'General Practitioner', experience: '12 yrs exp', rating: 4.7, avatar: 'DN' }
  ]) : []

  // If user is unauthenticated, prompt login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center dark:border-slate-800 dark:bg-slate-900/80 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-550 dark:bg-amber-950/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Secure clinical booking requires account registration. Please sign in or create an profile to view available slots and manage consultations.
          </p>
          <div className="pt-2 flex gap-3 justify-center">
            <Link to="/login" className="px-5 py-2.5 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803D] transition">
              Sign In
            </Link>
            <Link to="/signup" className="px-5 py-2.5 border border-slate-200 text-slate-700 dark:border-slate-850 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition">
              Create Account
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl">
        
        {/* Page title */}
        {step < 5 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Care Handshake</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Secure Appointment Booking</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              Schedule direct consultations with validated healthcare facilities around Mumbai.
            </p>
          </motion.div>
        )}

        {/* Wizard Card */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
                  {/* Step Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Building className="h-5 w-5" /></div>
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Choose Care Facility</h2>
                        <p className="text-xs text-slate-550 dark:text-slate-400">Select hospital, lab, or pharmacy care points</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#16A34A]">Step 1 of 4</span>
                  </div>

                  {/* Errors */}
                  {errorMsg && <Toast title="Alert" message={errorMsg} tone="warning" />}

                  {/* Facilities Grid */}
                  <div className="grid gap-3 sm:grid-cols-1">
                    {defaultFacilities.map((fac) => {
                      const isSelected = selectedFacility?.id === fac.id
                      return (
                        <div
                          key={fac.id}
                          onClick={() => setSelectedFacility(fac)}
                          className={`p-4 rounded-2xl border transition duration-200 cursor-pointer flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-850 select-none ${
                            isSelected
                              ? 'border-[#16A34A] bg-[#DCFCE7]/10 dark:bg-emerald-950/20'
                              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50'
                          }`}
                        >
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{fac.type}</span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{fac.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">{fac.address}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {fac.rating}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleNext} className="gap-2">
                      <span>Next Step</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
                  {/* Step Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 p-1 rounded-lg">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Select Specialist</h2>
                        <p className="text-xs text-slate-550 dark:text-slate-400">Choose an active practitioner from {selectedFacility?.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#16A34A]">Step 2 of 4</span>
                  </div>

                  {/* Errors */}
                  {errorMsg && <Toast title="Alert" message={errorMsg} tone="warning" />}

                  {/* Doctors Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {doctorsList.map((doc) => {
                      const isSelected = selectedDoctor?.id === doc.id
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-4 rounded-2xl border transition duration-200 cursor-pointer flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-850 select-none ${
                            isSelected
                              ? 'border-[#16A34A] bg-[#DCFCE7]/10 dark:bg-emerald-950/20'
                              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Doctor Avatar Placeholder */}
                            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                              {doc.avatar}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{doc.name}</h3>
                              <p className="text-xs text-[#16A34A] font-semibold mt-0.5">{doc.specialty}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{doc.experience}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {doc.rating}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={handleBack} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                    <Button onClick={handleNext} className="gap-2">
                      <span>Next Step</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
                  {/* Step Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 p-1 rounded-lg">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Select Time & Slot</h2>
                        <p className="text-xs text-slate-550 dark:text-slate-400">Choose available date and hours for {selectedDoctor?.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#16A34A]">Step 3 of 4</span>
                  </div>

                  {/* Errors */}
                  {errorMsg && <Toast title="Alert" message={errorMsg} tone="warning" />}

                  {/* Calendar Grid */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Dates</p>
                    <div className="grid gap-2 grid-cols-4">
                      {dates.map((d) => {
                        const isSelected = selectedDate?.value === d.value
                        return (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => setSelectedDate(d)}
                            className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition cursor-pointer select-none ${
                              isSelected
                                ? 'border-[#16A34A] bg-[#DCFCE7]/10 text-[#16A34A] dark:bg-emerald-950/20'
                                : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{d.label}</span>
                            <span className="text-xs font-bold mt-1 text-center truncate w-full">{d.value.split(',')[0]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slots Area */}
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Time Slots</p>
                    <div className="space-y-4">
                      {timeSlots.map((periodObj) => (
                        <div key={periodObj.period} className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{periodObj.period}</span>
                          <div className="grid gap-2 grid-cols-3">
                            {periodObj.slots.map((slot) => {
                              const isSelected = selectedTime === slot
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedTime(slot)}
                                  className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                                    isSelected
                                      ? 'border-[#16A34A] bg-[#16A34A] text-white'
                                      : 'border-slate-200 bg-slate-50/50 text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400'
                                  }`}
                                >
                                  {slot}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={handleBack} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                    <Button onClick={handleNext} className="gap-2">
                      <span>Next Step</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 dark:border-slate-800 dark:bg-slate-900/80 space-y-6">
                  {/* Step Header */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 p-1 rounded-lg">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Summary & Confirm</h2>
                        <p className="text-xs text-slate-550 dark:text-slate-400">Review clinical consultation details before booking</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#16A34A]">Step 4 of 4</span>
                  </div>

                  {/* Errors */}
                  {errorMsg && <Toast title="Alert" message={errorMsg} tone="warning" />}

                  {/* Summary Box */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-850">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">FACILITY</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200 block mt-1 leading-snug">{selectedFacility?.name}</span>
                        <span className="text-xs text-slate-500 mt-0.5 block">{selectedFacility?.address}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">PRACTITIONER</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200 block mt-1 leading-snug">{selectedDoctor?.name}</span>
                        <span className="text-xs text-[#16A34A] font-semibold mt-0.5 block">{selectedDoctor?.specialty}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">DATE</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-1">{selectedDate?.value}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">HOURS SLOT</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-1">{selectedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason for visit Input */}
                  <div className="space-y-2">
                    <Input
                      label="Reason for visit (Optional)"
                      placeholder="e.g. routine clinical assessment, chronic symptoms control"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={handleBack} disabled={loading} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                    <Button onClick={handleConfirmBooking} disabled={loading} className="gap-2 shadow-md">
                      {loading ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Booking...</span>
                        </>
                      ) : (
                        <>
                          <span>Book Appointment</span>
                          <Check className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              >
                <Card className="p-8 dark:border-slate-800 dark:bg-slate-900/80 text-center space-y-6">
                  {/* Animated Success Badge */}
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
                      className="rounded-full bg-[#16A34A] text-white p-3 shadow-lg"
                    >
                      <Check className="h-8 w-8 stroke-[3.5]" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full border border-[#16A34A]/30"
                    />
                  </div>

                  {/* Confirmation Titles */}
                  <div className="space-y-2">
                    <span className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-[#16A34A] bg-[#DCFCE7] dark:bg-emerald-950/40 px-3 py-1 rounded-full w-max mx-auto border border-[#16A34A]/10">
                      <Sparkles className="h-3 w-3 animate-spin" />
                      Booking Confirmed
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Appointment Scheduled!</h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Your consultation details have been secured in your personal medical record history.
                    </p>
                  </div>

                  {/* Summary Block */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-left text-xs max-w-md mx-auto dark:border-slate-850 dark:bg-slate-950/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-450 uppercase">REFERENCE ID</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{bookingRef}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-450 uppercase">DOCTOR</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{selectedDoctor?.name} ({selectedDoctor?.specialty})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-450 uppercase">LOCATION</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 text-right truncate max-w-[200px]">{selectedFacility?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-450 uppercase">DATE & SLOT</span>
                      <span className="font-bold text-[#16A34A]">{selectedDate?.value} at {selectedTime}</span>
                    </div>
                  </div>

                  {/* Redirect Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3.5 bg-[#16A34A] text-white rounded-2xl text-xs font-bold hover:bg-[#15803D] transition shadow-md w-full cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/maps')}
                      className="px-6 py-3.5 border border-slate-200 text-slate-700 dark:border-slate-850 dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition w-full cursor-pointer"
                    >
                      <span>View facility on Map</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
