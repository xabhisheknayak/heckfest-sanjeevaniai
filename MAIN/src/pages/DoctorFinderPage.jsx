import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SearchBar } from '../components/ui/SearchBar'
import { doctors } from '../data/doctors'
import { Toast } from '../components/ui/Toast'

export default function DoctorFinderPage() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [sortBy, setSortBy] = useState('rating')
  const [message, setMessage] = useState('')

  const filteredDoctors = useMemo(() => {
    const next = doctors.filter((doctor) => {
      const matchesQuery = `${doctor.name} ${doctor.specialization} ${doctor.hospital}`.toLowerCase().includes(query.toLowerCase())
      const matchesSpecialty = specialty === 'All' || doctor.specialization === specialty
      return matchesQuery && matchesSpecialty
    })

    return next.sort((a, b) => {
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
      return b.rating - a.rating
    })
  }, [query, specialty, sortBy])

  const specialties = ['All', ...new Set(doctors.map((doctor) => doctor.specialization))]

  const handleBook = (doctor) => {
    setMessage(`Appointment request sent to ${doctor.name}.`)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Doctor finder</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Connect with trusted specialists</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Explore nearby professionals by specialty, care mode, and availability in one calm experience.</p>
        </motion.div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchBar placeholder="Search by specialty or name" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <option value="rating">Top rated</option>
              <option value="distance">Nearest</option>
            </select>
          </div>
        </div>

        {message && <div className="mb-6"><Toast title="Appointment" message={message} tone="success" /></div>}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <img src="/doctor_consultation.png" alt={doctor.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-100 dark:border-slate-800" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{doctor.name}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">★ {doctor.rating}</div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#16A34A]" /> {doctor.hospital}</div>
                <div>Experience: {doctor.experience}</div>
                <div>Availability: {doctor.availability}</div>
                <div>Distance: {doctor.distance}</div>
              </div>
              <Button className="mt-6 w-full" onClick={() => handleBook(doctor)}>Book appointment <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
