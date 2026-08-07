import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Star, Phone, Shield, Check, X, User } from 'lucide-react'
import { firestoreService } from '../../services/firestoreService'
import { useAuth } from '../../hooks/useAuth'

const STORAGE_KEY = 'sanjivni-emergency-contacts'

const DEFAULT_CONTACTS = [
  { id: 'contact-1', name: 'Rajesh Sharma', relationship: 'Spouse', phone: '+91 98765 43210', isPrimary: true },
  { id: 'contact-2', name: 'Dr. Ananya Mehta', relationship: 'Primary Doctor', phone: '+91 98123 45678', isPrimary: false }
]

export function EmergencyContactsManager() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  
  // Form states
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('Family')
  const [phone, setPhone] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notice, setNotice] = useState('')

  // Load contacts securely
  const loadContacts = useCallback(async () => {
    try {
      if (user) {
        const remoteData = await firestoreService.getUserData('user_contacts', user.uid)
        if (remoteData?.contacts && remoteData.contacts.length > 0) {
          setContacts(remoteData.contacts)
          return
        }
      }
    } catch {
      // Fallback silently to localStorage
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY)
      if (local) {
        setContacts(JSON.parse(local))
      } else {
        setContacts(DEFAULT_CONTACTS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS))
      }
    } catch {
      setContacts(DEFAULT_CONTACTS)
    }
  }, [user])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Save contacts securely
  const saveContactsList = async (updatedList) => {
    setContacts(updatedList)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
    } catch {
      // Storage save error fallback
    }

    if (user) {
      try {
        await firestoreService.saveUserData('user_contacts', user.uid, {
          uid: user.uid,
          contacts: updatedList,
          updatedAt: new Date().toISOString()
        })
      } catch {
        // Silent fallback
      }
    }
  }

  const showNotification = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const handleOpenAdd = () => {
    setEditingContact(null)
    setName('')
    setRelationship('Family')
    setPhone('')
    setIsPrimary(contacts.length === 0)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (contact) => {
    setEditingContact(contact)
    setName(contact.name)
    setRelationship(contact.relationship)
    setPhone(contact.phone)
    setIsPrimary(contact.isPrimary)
    setIsModalOpen(true)
  }

  const handleSaveContact = (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return

    let updated = [...contacts]

    if (editingContact) {
      updated = updated.map((c) => {
        if (c.id === editingContact.id) {
          return { ...c, name: name.trim(), relationship, phone: phone.trim(), isPrimary }
        }
        return isPrimary ? { ...c, isPrimary: false } : c
      })
      showNotification('Emergency contact updated.')
    } else {
      const newContact = {
        id: `contact-${Date.now()}`,
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        isPrimary: isPrimary || contacts.length === 0
      }

      if (newContact.isPrimary) {
        updated = updated.map((c) => ({ ...c, isPrimary: false }))
      }

      updated.push(newContact)
      showNotification('Emergency contact added.')
    }

    saveContactsList(updated)
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    const target = contacts.find((c) => c.id === id)
    let updated = contacts.filter((c) => c.id !== id)

    // Reassign primary if deleted contact was primary
    if (target?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true
    }

    saveContactsList(updated)
    showNotification('Contact removed.')
  }

  const handleMakePrimary = (id) => {
    const updated = contacts.map((c) => ({
      ...c,
      isPrimary: c.id === id
    }))
    saveContactsList(updated)
    showNotification('Primary emergency contact updated.')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
          <Shield className="h-5 w-5 text-red-600" />
          <span>Emergency Contacts (ICE)</span>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-700"
        >
          <Plus className="h-4 w-4" /> Add Emergency Contact
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Check className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
            No emergency contacts added yet. Click "+ Add Emergency Contact" to add family or primary physicians.
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border p-4 transition gap-3 ${
                contact.isPrimary
                  ? 'border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/30'
                  : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-2xl p-2.5 ${contact.isPrimary ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        <Star className="h-3 w-3 fill-current" /> Primary ICE
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{contact.relationship}</span>
                    <span>•</span>
                    <span className="font-mono">{contact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>

                {!contact.isPrimary && (
                  <button
                    onClick={() => handleMakePrimary(contact.id)}
                    title="Set as primary emergency contact"
                    className="rounded-xl border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => handleOpenEdit(contact)}
                  title="Edit contact"
                  className="rounded-xl border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(contact.id)}
                  title="Delete contact"
                  className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Primary Doctor">Primary Doctor</option>
                  <option value="Friend">Friend / Neighbor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 accent-red-600 cursor-pointer"
                />
                <label htmlFor="primaryCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set as primary emergency contact (ICE)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
