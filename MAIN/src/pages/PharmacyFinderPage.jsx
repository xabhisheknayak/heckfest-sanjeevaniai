import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Pill } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SearchBar } from '../components/ui/SearchBar'
import { Toast } from '../components/ui/Toast'

export default function PharmacyFinderPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  const filteredPharmacies = useMemo(() => {
    const list = [
      { name: 'MediCare Pharmacy', distance: '1.2 km', status: 'Open now' },
      { name: 'CarePlus Pharmacy', distance: '2.4 km', status: 'Delivery ready' },
      { name: 'Wellness Rx', distance: '3.1 km', status: '24/7' },
    ]
    return list.filter((p) => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.status.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const handleDeliveryClick = () => {
    setMessage('Same-day prescription delivery is available for all nearby verified pharmacies.')
    setTimeout(() => setMessage(''), 4000)
  }

  const handleViewPharmacy = (pharmacy) => {
    navigate('/maps', { state: { filter: 'pharmacy', search: pharmacy.name } })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16A34A]">Pharmacy finder</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Find reliable prescription support nearby</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">Search for pharmacies with stock visibility, delivery availability, and quick pickup options.</p>
        </motion.div>

        {message && (
          <div className="mb-6">
            <Toast title="Prescription Delivery" message={message} tone="info" />
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar 
            placeholder="Search by medicine or pharmacy" 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
          />
          <Button variant="secondary" onClick={handleDeliveryClick}>Delivery options</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPharmacies.map((pharmacy) => (
            <Card key={pharmacy.name} className="p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#DCFCE7] p-2 text-[#16A34A] dark:bg-emerald-950/40"><Pill className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{pharmacy.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{pharmacy.status}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-[#16A34A]" /> {pharmacy.distance}
              </div>
              <Button className="mt-6 w-full" onClick={() => handleViewPharmacy(pharmacy)}>View pharmacy <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
