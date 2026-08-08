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
import { USER_ROLES, DOCTOR_STATUS } from '../constants/roles'

const DEMO_PATIENT_EMAIL = 'patient@sanjivni.ai'
const TEST_PATIENT_EMAIL = 'patient@test.local'
const DEMO_DOCTOR_EMAIL = 'doctor@sanjivni.ai'
const TEST_DOCTOR_EMAIL = 'doctor@test.local'
const DEMO_ADMIN_EMAIL = 'admin@sanjivni.ai'
const TEST_ADMIN_EMAIL = 'admin@test.local'
const LEGACY_DEMO_EMAIL = 'demo@sanjivni.ai'

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

function buildDemoUser(email, name, requestedRole = USER_ROLES.PATIENT) {
  const normalizedEmail = email.toLowerCase()
  let displayName = name
  let uid = `demo-${requestedRole}-${Date.now()}`

  if (normalizedEmail === DEMO_DOCTOR_EMAIL || normalizedEmail === TEST_DOCTOR_EMAIL || requestedRole === USER_ROLES.DOCTOR) {
    displayName = name || 'Dr. Ananya Mehta (Dev Test Doctor)'
    uid = 'demo-doctor-user'
  } else if (normalizedEmail === DEMO_ADMIN_EMAIL || normalizedEmail === TEST_ADMIN_EMAIL || requestedRole === USER_ROLES.ADMIN) {
    displayName = name || 'System Admin (Dev Test Admin)'
    uid = 'demo-admin-user'
  } else {
    displayName = name || 'Asha Patel (Dev Test Patient)'
    uid = 'demo-patient-user'
  }

  return {
    uid,
    email: normalizedEmail,
    displayName,
    photoURL: '',
    emailVerified: true,
  }
}

function buildDemoProfile(user, requestedRole = USER_ROLES.PATIENT, doctorDetails = {}) {
  const normalizedEmail = user.email.toLowerCase()
  let role = requestedRole

  // Pre-configured trusted demo & test accounts
  if (normalizedEmail === DEMO_DOCTOR_EMAIL || normalizedEmail === TEST_DOCTOR_EMAIL) role = USER_ROLES.DOCTOR
  else if (normalizedEmail === DEMO_ADMIN_EMAIL || normalizedEmail === TEST_ADMIN_EMAIL) role = USER_ROLES.ADMIN
  else if (normalizedEmail === DEMO_PATIENT_EMAIL || normalizedEmail === TEST_PATIENT_EMAIL || normalizedEmail === LEGACY_DEMO_EMAIL) role = USER_ROLES.PATIENT

  const baseProfile = {
    uid: user.uid,
    name: user.displayName || 'Demo User',
    email: user.email,
    photo: user.photoURL || '',
    role,
    createdAt: new Date().toISOString(),
    appointments: [],
    savedReports: [],
  }

  if (role === USER_ROLES.DOCTOR) {
    return {
      ...baseProfile,
      specialization: doctorDetails.specialization || 'General Internal Medicine',
      licenseNumber: doctorDetails.licenseNumber || 'MED-IND-88901',
      verificationStatus: doctorDetails.verificationStatus || DOCTOR_STATUS.VERIFIED
    }
  }

  if (role === USER_ROLES.ADMIN) {
    return {
      ...baseProfile,
      title: 'Platform Administrator',
      accessLevel: 'SuperAdmin'
    }
  }

  return baseProfile
}

export const authService = {
  async signUp({ name, email, password, role = USER_ROLES.PATIENT, specialization = '', licenseNumber = '' }) {
    // Security Restriction: Public signup cannot self-assign Admin role.
    let assignedRole = role
    if (assignedRole === USER_ROLES.ADMIN) {
      console.warn('Security Notice: Public registration cannot self-assign Admin role. Assigning Patient role.')
      assignedRole = USER_ROLES.PATIENT
    }

    if (isDemoMode) {
      const user = buildDemoUser(email, name, assignedRole)
      const profile = buildDemoProfile(user, assignedRole, {
        specialization,
        licenseNumber,
        verificationStatus: assignedRole === USER_ROLES.DOCTOR ? DOCTOR_STATUS.PENDING : undefined
      })
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
      role: assignedRole,
      createdAt: serverTimestamp(),
      appointments: [],
      savedReports: [],
    }

    if (assignedRole === USER_ROLES.DOCTOR) {
      userDoc.specialization = specialization
      userDoc.licenseNumber = licenseNumber
      userDoc.verificationStatus = DOCTOR_STATUS.PENDING
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
    return userCredential.user
  },

  async signIn(email, password, requestedRole = null) {
    const normalizedEmail = email.toLowerCase()

    if (isDemoMode) {
      // Role auto-detection for demo accounts
      let targetRole = requestedRole || USER_ROLES.PATIENT
      if (normalizedEmail.includes('doctor')) targetRole = USER_ROLES.DOCTOR
      else if (normalizedEmail.includes('admin')) targetRole = USER_ROLES.ADMIN

      const user = buildDemoUser(email, null, targetRole)
      const profile = buildDemoProfile(user, targetRole)
      setStoredAuth(user, profile)
      return user
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  },

  async resetPassword(email) {
    if (isDemoMode) return
    await sendPasswordResetEmail(auth, email)
  },

  async logout() {
    if (isDemoMode) {
      clearStoredAuth()
      return
    }
    await signOut(auth)
  },

  listenToAuthChanges(callback) {
    if (isDemoMode) {
      const stored = getStoredAuth()
      if (stored?.user) {
        callback(stored.user)
      } else {
        const defaultUser = buildDemoUser('patient@sanjivni.ai', 'Asha Patel (Demo Patient)', USER_ROLES.PATIENT)
        const defaultProfile = buildDemoProfile(defaultUser, USER_ROLES.PATIENT)
        setStoredAuth(defaultUser, defaultProfile)
        callback(defaultUser)
      }
      return () => {}
    }

    return onAuthStateChanged(auth, (user) => {
      callback(user)
    })
  },

  async getUserProfile(uid) {
    if (!uid) return null

    if (isDemoMode) {
      const stored = getStoredAuth()
      if (stored?.profile) {
        return stored.profile
      }
      const demoProfile = {
        uid,
        name: 'Asha Patel (Demo Patient)',
        email: 'patient@sanjivni.ai',
        phone: '+91 98765 43210',
        age: 30,
        gender: 'Female',
        bloodGroup: 'O+',
        dateOfBirth: '1996-05-15',
        address: '123 Health Ave, Mumbai, MH',
        emergencyContact: '+91 98765 00000',
        photoURL: '',
        role: USER_ROLES.PATIENT,
        createdAt: new Date().toISOString()
      }
      return demoProfile
    }

    try {
      const userDocRef = doc(db, 'users', uid)
      const snapshot = await getDoc(userDocRef)
      if (snapshot.exists()) {
        return { uid, ...snapshot.data() }
      }

      // Document does not exist in Firestore -> Automatically create a basic profile document
      console.info('Profile information was not found. Automatically creating a new profile document...')
      const currentUser = auth?.currentUser
      const newProfileDoc = {
        uid,
        name: currentUser?.displayName || 'Registered Patient',
        email: currentUser?.email || '',
        phone: '',
        age: 30,
        gender: 'Not specified',
        bloodGroup: 'O+',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        photoURL: currentUser?.photoURL || '',
        role: USER_ROLES.PATIENT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(userDocRef, newProfileDoc, { merge: true })
      return { ...newProfileDoc, createdAt: new Date().toISOString() }
    } catch (err) {
      console.error('Profile loading error:', err)
    }

    // Safe fallback profile to prevent render crashes
    return {
      uid: uid || '',
      name: auth?.currentUser?.displayName || 'Registered Patient',
      email: auth?.currentUser?.email || '',
      phone: '',
      age: 30,
      gender: 'Not specified',
      bloodGroup: 'O+',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      photoURL: auth?.currentUser?.photoURL || '',
      role: USER_ROLES.PATIENT,
      createdAt: new Date().toISOString()
    }
  },

  async updateUserProfile(uid, updates) {
    if (!uid) return null

    if (isDemoMode) {
      const stored = getStoredAuth() || {}
      const updatedProfile = { ...(stored.profile || {}), ...updates, uid }
      const updatedUser = { ...(stored.user || {}), displayName: updates.name || updates.fullName || stored.user?.displayName }
      setStoredAuth(updatedUser, updatedProfile)
      return updatedProfile
    }

    try {
      const userDocRef = doc(db, 'users', uid)
      const payload = {
        ...updates,
        updatedAt: serverTimestamp(),
      }
      await setDoc(userDocRef, payload, { merge: true })
      if (updates.name && auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: updates.name })
      }
      return updates
    } catch (err) {
      console.error('Profile save error:', err)
      throw new Error('Unable to save profile changes. Please try again.')
    }
  }
}

