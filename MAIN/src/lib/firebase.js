import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const apiKey = env.VITE_FIREBASE_API_KEY

<<<<<<< HEAD
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isDemoMode = !env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY === 'demo-api-key'

let app = null
let auth = null
let db = null

if (!isDemoMode) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} else {
  console.warn('Firebase API key is missing or demo mode is enabled. Firebase services will not be initialized.')
}

=======
export const isDemoMode = !apiKey || apiKey === 'demo-api-key' || apiKey.length < 10

let app = null
let auth = null
let db = null

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
  } catch (err) {
    console.warn('Firebase initialization skipped, running in Demo Mode:', err.message)
  }
}

>>>>>>> 07f859caad45f916c3218d1397e7abf052285d8f
export { auth, db }
export default app

