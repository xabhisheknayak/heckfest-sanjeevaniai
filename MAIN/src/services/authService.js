import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, isDemoMode } from '../firebase'

const DEMO_EMAIL = 'demo@sanjivni.ai'
const DEMO_PASSWORD = 'demo123456'
const STORAGE_KEY = 'sanjivni-demo-auth'

function getStoredAuth() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function setStoredAuth(user, profile) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, profile }))
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

function buildDemoUser(email, name = 'Demo Patient') {
  const normalizedEmail = email.toLowerCase()
  const displayName = name || (normalizedEmail === DEMO_EMAIL ? 'Demo Patient' : 'Guest User')

  return {
    uid: 'demo-user',
    email: normalizedEmail,
    displayName,
    photoURL: '',
    emailVerified: true,
  }
}

function buildDemoProfile(user) {
  return {
    uid: user.uid,
    name: user.displayName || 'Demo Patient',
    email: user.email,
    photo: user.photoURL || '',
    role: 'patient',
    createdAt: new Date().toISOString(),
    appointments: [],
    savedReports: [],
  }
}

export const authService = {
  async signUp({ name, email, password }) {
    if (isDemoMode) {
      const user = buildDemoUser(email, name)
      const profile = buildDemoProfile(user)
      setStoredAuth(user, profile)
      return user
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName: name })

    const userDoc = {
      uid: userCredential.user.uid,
      name,
      email,
      photo: userCredential.user.photoURL || '',
      role: 'patient',
      createdAt: serverTimestamp(),
      appointments: [],
      savedReports: [],
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
    return userCredential.user
  },

  async signIn(email, password) {
    if (isDemoMode) {
      const validDemoLogin = (email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) || Boolean(email && password)
      if (!validDemoLogin) {
        throw new Error('Use demo@sanjivni.ai / demo123456 in demo mode.')
      }

      const user = buildDemoUser(email)
      const profile = buildDemoProfile(user)
      setStoredAuth(user, profile)
      return user
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  },

  async resetPassword(email) {
    if (isDemoMode) {
      return
    }

    await sendPasswordResetEmail(auth, email)
  },

  async logout() {
    if (isDemoMode) {
      clearStoredAuth()
      return
    }

    await signOut(auth)
  },

  getCurrentUser() {
    if (isDemoMode) {
      const stored = getStoredAuth()
      return stored?.user || null
    }
    return auth.currentUser
  },

  async getUserProfile(uid) {
    if (isDemoMode) {
      const stored = getStoredAuth()
      return stored?.profile || null
    }

    const snapshot = await getDoc(doc(db, 'users', uid))
    return snapshot.exists() ? snapshot.data() : null
  },

  listenToAuthChanges(callback) {
    if (isDemoMode) {
      const stored = getStoredAuth()
      callback(stored?.user || null)
      return () => {}
    }

    return onAuthStateChanged(auth, callback)
  },
}
