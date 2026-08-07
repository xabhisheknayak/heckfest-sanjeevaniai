import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isDemoMode } from '../lib/firebase'

const DEMO_STORAGE_PREFIX = 'sanjivni-demo-db-'

export const firestoreService = {
  async createUserProfile(uid, profileData) {
    if (isDemoMode) {
      const mockProfile = {
        uid,
        ...profileData,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(DEMO_STORAGE_PREFIX + 'users-' + uid, JSON.stringify(mockProfile))
      return mockProfile
    }

    const payload = {
      uid,
      ...profileData,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', uid), payload)
    return payload
  },

  async saveUserData(collectionName, docId, data) {
    if (isDemoMode) {
      const key = `${DEMO_STORAGE_PREFIX}${collectionName}-${docId}`
      const payload = {
        id: docId,
        ...data,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(key, JSON.stringify(payload))
      return payload
    }

    const payload = {
      ...data,
      timestamp: serverTimestamp(),
    }
    await setDoc(doc(db, collectionName, docId), payload)
    return { id: docId, ...payload }
  },

  async readUserData(collectionName, docId) {
    if (isDemoMode) {
      const key = `${DEMO_STORAGE_PREFIX}${collectionName}-${docId}`
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
      
      // Fallback for user profiles in localstorage
      if (collectionName === 'users') {
        const rawUser = localStorage.getItem(DEMO_STORAGE_PREFIX + 'users-' + docId)
        if (rawUser) return JSON.parse(rawUser)
      }
      return null
    }

    const snap = await getDoc(doc(db, collectionName, docId))
    return snap.exists() ? snap.data() : null
  }
}
