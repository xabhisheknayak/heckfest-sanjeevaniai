import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
const apiKey = env.VITE_FIREBASE_API_KEY

export const isDemoMode = !apiKey || apiKey === 'demo-api-key' || apiKey.length < 10

let app = null
let auth = null
let db = null
let storage = null

if (!isDemoMode) {
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
    }
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (err) {
    console.warn('Firebase initialization skipped, running in Demo Mode:', err.message)
  }
}

export { auth, db, storage }
export default app

