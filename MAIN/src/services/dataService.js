import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, isDemoMode } from '../firebase'

const LOCAL_STORAGE_PREFIX = 'sanjivni-demo-db-'

function getLocalData(collectionName) {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + collectionName)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalData(collectionName, data) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + collectionName, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to local storage', e)
  }
}

async function mockCreateDoc(collectionName, userId, docData) {
  const list = getLocalData(collectionName)
  const newDoc = {
    id: `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...docData,
    userId,
    createdAt: new Date().toISOString()
  }
  list.unshift(newDoc)
  saveLocalData(collectionName, list)
  return newDoc
}

async function mockGetDocs(collectionName, userId) {
  const list = getLocalData(collectionName)
  return list.filter((item) => item.userId === userId || item.patientId === userId)
}

async function mockUpdateDoc(collectionName, userId, docId, updates) {
  const list = getLocalData(collectionName)
  const index = list.findIndex((item) => item.id === docId && (item.userId === userId || item.patientId === userId))
  if (index !== -1) {
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() }
    saveLocalData(collectionName, list)
    return list[index]
  }
  return null
}

async function mockDeleteDoc(collectionName, userId, docId) {
  const list = getLocalData(collectionName)
  const filtered = list.filter((item) => !(item.id === docId && (item.userId === userId || item.patientId === userId)))
  saveLocalData(collectionName, filtered)
  return true
}

export const dataService = {
  async createAppointment(userId, appointment) {
    if (isDemoMode) {
      return mockCreateDoc('appointments', userId, appointment)
    }
    const payload = {
      ...appointment,
      userId,
      createdAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, 'appointments'), payload)
    return { id: ref.id, ...payload }
  },

  async getAppointments(userId) {
    if (isDemoMode) {
      return mockGetDocs('appointments', userId)
    }
    const q = query(collection(db, 'appointments'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  },

  async createMedicalHistory(userId, entry) {
    if (isDemoMode) {
      return mockCreateDoc('medicalHistory', userId, entry)
    }
    const payload = {
      ...entry,
      userId,
      createdAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, 'medicalHistory'), payload)
    return { id: ref.id, ...payload }
  },

  async getMedicalHistory(userId) {
    if (isDemoMode) {
      return mockGetDocs('medicalHistory', userId)
    }
    const q = query(collection(db, 'medicalHistory'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  },

  async createReport(userId, report) {
    if (isDemoMode) {
      return mockCreateDoc('reports', userId, report)
    }
    const payload = {
      ...report,
      userId,
      createdAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, 'reports'), payload)
    return { id: ref.id, ...payload }
  },

  async getReports(userId) {
    if (isDemoMode) {
      return mockGetDocs('reports', userId)
    }
    const q = query(collection(db, 'reports'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  },

  async saveReportToUser(userId, reportId) {
    if (isDemoMode) {
      try {
        const storedAuth = JSON.parse(localStorage.getItem('sanjivni-demo-auth'))
        if (storedAuth && storedAuth.profile) {
          const saved = storedAuth.profile.savedReports || []
          if (!saved.includes(reportId)) {
            storedAuth.profile.savedReports = [...saved, reportId]
            localStorage.setItem('sanjivni-demo-auth', JSON.stringify(storedAuth))
          }
        }
      } catch (e) {
        console.error(e)
      }
      return
    }
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDocs(collection(db, 'users'))
    const existingUser = userSnap.docs.find((item) => item.id === userId)
    if (!existingUser) return
    const currentReports = existingUser.data().savedReports || []
    if (!currentReports.includes(reportId)) {
      await setDoc(userRef, { savedReports: [...currentReports, reportId] }, { merge: true })
    }
  },
  async getLatestHealthRecord(userId) {
    const getLocalRecord = () => {
      if (typeof window === 'undefined') return null
      const prefix = 'sanjivni-demo-db-health_records-'
      const records = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.uid === userId) {
              records.push(data)
            }
          } catch (e) {
            console.error(e)
          }
        }
      }
      if (records.length === 0) return null
      // Sort desc by timestamp
      records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      return records[0]
    }

    if (isDemoMode) {
      return getLocalRecord()
    }

    try {
      const q = query(
        collection(db, 'health_records'),
        where('uid', '==', userId)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        return getLocalRecord()
      }
      
      const records = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))

      // Sort client-side descending by timestamp to avoid composite index requirement
      records.sort((a, b) => {
        const timeA = a.timestamp?.seconds
          ? a.timestamp.seconds * 1000
          : new Date(a.timestamp || 0).getTime()
        const timeB = b.timestamp?.seconds
          ? b.timestamp.seconds * 1000
          : new Date(b.timestamp || 0).getTime()
        return timeB - timeA
      })

      return records[0] || getLocalRecord()
    } catch (fbErr) {
      console.warn('Firestore fetch failed, reading from localStorage as fallback:', fbErr)
      return getLocalRecord()
    }
  },

  async getHealthRecords(userId) {
    const getLocalRecords = () => {
      if (typeof window === 'undefined') return []
      const prefix = 'sanjivni-demo-db-health_records-'
      const records = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.uid === userId) records.push(data)
          } catch (e) {
            console.error(e)
          }
        }
      }
      return records.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    }

    if (isDemoMode) {
      return getLocalRecords()
    }

    try {
      const q = query(
        collection(db, 'health_records'),
        where('uid', '==', userId)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return getLocalRecords()
      
      const records = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))

      records.sort((a, b) => {
        const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp || 0).getTime()
        const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp || 0).getTime()
        return timeB - timeA
      })

      return records
    } catch (err) {
      console.warn('Firestore health_records fetch failed, falling back to local:', err)
      return getLocalRecords()
    }
  },

  async getImageAnalyses(userId) {
    const getLocalRecords = () => {
      if (typeof window === 'undefined') return []
      const prefix = 'sanjivni-demo-db-image_analyses-'
      const records = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.uid === userId) records.push(data)
          } catch (e) {
            console.error(e)
          }
        }
      }
      return records.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
    }

    if (isDemoMode) {
      return getLocalRecords()
    }

    try {
      const q = query(
        collection(db, 'image_analyses'),
        where('uid', '==', userId)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return getLocalRecords()
      
      const records = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))

      records.sort((a, b) => {
        const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp || 0).getTime()
        const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp || 0).getTime()
        return timeB - timeA
      })

      return records
    } catch (err) {
      console.warn('Firestore image_analyses fetch failed, falling back to local:', err)
      return getLocalRecords()
    }
  },

  async createMedication(userId, medData) {
    const payload = {
      ...medData,
      userId,
      patientId: userId,
      active: medData.active ?? true,
    }
    if (isDemoMode) {
      return mockCreateDoc('medications', userId, payload)
    }
    try {
      const docRef = await addDoc(collection(db, 'medications'), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { id: docRef.id, ...payload }
    } catch (err) {
      console.warn('Firestore createMedication failed, saving locally:', err)
      return mockCreateDoc('medications', userId, payload)
    }
  },

  async getMedications(userId) {
    if (isDemoMode) {
      return mockGetDocs('medications', userId)
    }
    try {
      const q = query(collection(db, 'medications'), where('userId', '==', userId))
      const snapshot = await getDocs(q)
      const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      if (docs.length === 0) return mockGetDocs('medications', userId)
      return docs
    } catch (err) {
      console.warn('Firestore getMedications failed, using local storage:', err)
      return mockGetDocs('medications', userId)
    }
  },

  async updateMedication(userId, medId, updates) {
    if (isDemoMode) {
      return mockUpdateDoc('medications', userId, medId, updates)
    }
    try {
      const docRef = doc(db, 'medications', medId)
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() })
      return { id: medId, ...updates }
    } catch (err) {
      console.warn('Firestore updateMedication failed, updating locally:', err)
      return mockUpdateDoc('medications', userId, medId, updates)
    }
  },

  async deleteMedication(userId, medId) {
    if (isDemoMode) {
      return mockDeleteDoc('medications', userId, medId)
    }
    try {
      const docRef = doc(db, 'medications', medId)
      await deleteDoc(docRef)
      return true
    } catch (err) {
      console.warn('Firestore deleteMedication failed, deleting locally:', err)
      return mockDeleteDoc('medications', userId, medId)
    }
  },

  async recordMedicationLog(userId, logData) {
    const payload = {
      ...logData,
      userId,
      patientId: userId,
      timestamp: new Date().toISOString(),
    }
    if (isDemoMode) {
      // Check if existing log for date and medicationId exists
      const list = getLocalData('medication_logs')
      const existingIdx = list.findIndex(
        (item) => (item.userId === userId || item.patientId === userId) && item.medicationId === logData.medicationId && item.date === logData.date
      )
      if (existingIdx !== -1) {
        list[existingIdx] = { ...list[existingIdx], ...payload }
        saveLocalData('medication_logs', list)
        return list[existingIdx]
      }
      return mockCreateDoc('medication_logs', userId, payload)
    }
    try {
      const q = query(
        collection(db, 'medication_logs'),
        where('userId', '==', userId),
        where('medicationId', '==', logData.medicationId),
        where('date', '==', logData.date)
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0]
        await updateDoc(doc(db, 'medication_logs', existingDoc.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        })
        return { id: existingDoc.id, ...payload }
      }
      const ref = await addDoc(collection(db, 'medication_logs'), {
        ...payload,
        createdAt: serverTimestamp(),
      })
      return { id: ref.id, ...payload }
    } catch (err) {
      console.warn('Firestore recordMedicationLog failed, using local storage:', err)
      return mockCreateDoc('medication_logs', userId, payload)
    }
  },

  async getMedicationLogs(userId) {
    if (isDemoMode) {
      const logs = await mockGetDocs('medication_logs', userId)
      return logs.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
    }
    try {
      const q = query(collection(db, 'medication_logs'), where('userId', '==', userId))
      const snapshot = await getDocs(q)
      const logs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      logs.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
      return logs.length > 0 ? logs : mockGetDocs('medication_logs', userId)
    } catch (err) {
      console.warn('Firestore getMedicationLogs failed, using local storage:', err)
      const logs = await mockGetDocs('medication_logs', userId)
      return logs.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
    }
  },

  async doctorGetPatientMedications(patientId) {
    return this.getMedications(patientId)
  },

  async doctorGetPatientLogs(patientId) {
    return this.getMedicationLogs(patientId)
  },

  async doctorAssignMedication(patientId, medData) {
    return this.createMedication(patientId, {
      ...medData,
      assignedByDoctor: true,
      doctorName: medData.doctorName || 'Dr. Practitioner',
    })
  },
}
