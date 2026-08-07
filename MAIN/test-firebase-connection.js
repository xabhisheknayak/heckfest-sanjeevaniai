import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { resolve } from 'path'

console.log('--- Firebase Connection Test ---')

let apiKey = process.env.VITE_FIREBASE_API_KEY
let authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN
let projectId = process.env.VITE_FIREBASE_PROJECT_ID
let storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET
let messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
let appId = process.env.VITE_FIREBASE_APP_ID

if (!apiKey) {
  try {
    const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    envContent.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length === 2) {
        const key = parts[0].trim()
        const val = parts[1].trim()
        if (key === 'VITE_FIREBASE_API_KEY') apiKey = val
        if (key === 'VITE_FIREBASE_AUTH_DOMAIN') authDomain = val
        if (key === 'VITE_FIREBASE_PROJECT_ID') projectId = val
        if (key === 'VITE_FIREBASE_STORAGE_BUCKET') storageBucket = val
        if (key === 'VITE_FIREBASE_MESSAGING_SENDER_ID') messagingSenderId = val
        if (key === 'VITE_FIREBASE_APP_ID') appId = val
      }
    })
  } catch (e) {
    console.error('Failed to read .env.local:', e.message)
  }
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
}

console.log('Using config Project ID:', firebaseConfig.projectId)

try {
  const app = initializeApp(firebaseConfig)
  console.log('✓ Firebase App initialized successfully.')
  
  getAuth(app)
  console.log('✓ Authentication service loaded.')
  
  const db = getFirestore(app)
  console.log('✓ Firestore Database service loaded.')
  
  console.log('Testing Firestore access...')
  const userRef = doc(db, 'users', 'connection-test-id')
  await getDoc(userRef)
  console.log('✓ Firestore read test succeeded (Connection works!).')
  console.log('--- Test Passed ---')
  process.exit(0)
} catch (error) {
  console.error('✗ Test failed with error:', error)
  process.exit(1)
}
