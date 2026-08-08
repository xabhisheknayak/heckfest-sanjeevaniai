import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { dataService } from '../services/dataService'
import { AuthContext } from './AuthContextObject'
import { USER_ROLES } from '../constants/roles'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = authService.listenToAuthChanges(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profileData = await authService.getUserProfile(firebaseUser.uid)
          setUser(firebaseUser)
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        setError(err.message || 'Failed to load account')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signIn = useCallback(async (email, password, role) => {
    setError('')
    try {
      const authUser = await authService.signIn(email, password, role)
      const profileData = await authService.getUserProfile(authUser.uid)
      setUser(authUser)
      setProfile(profileData)
      return authUser
    } catch (err) {
      setError(err.message || 'Unable to sign in')
      throw err
    }
  }, [])

  const signUp = useCallback(async (userData) => {
    setError('')
    try {
      const createdUser = await authService.signUp(userData)
      const profileData = await authService.getUserProfile(createdUser.uid)
      setUser(createdUser)
      setProfile(profileData)
      return createdUser
    } catch (err) {
      setError(err.message || 'Unable to create account')
      throw err
    }
  }, [])

  const resetPassword = useCallback(async (email) => {
    setError('')
    try {
      await authService.resetPassword(email)
    } catch (err) {
      setError(err.message || 'Unable to reset password')
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    setError('')
    try {
      await authService.logout()
      setUser(null)
      setProfile(null)
    } catch (err) {
      setError(err.message || 'Unable to sign out')
      throw err
    }
  }, [])

  const createAppointment = useCallback(async (appointment) => {
    if (!user) return null
    return dataService.createAppointment(user.uid, appointment)
  }, [user])

  const fetchAppointments = useCallback(async () => {
    if (!user) return []
    return dataService.getAppointments(user.uid)
  }, [user])

  const createMedicalHistory = useCallback(async (entry) => {
    if (!user) return null
    return dataService.createMedicalHistory(user.uid, entry)
  }, [user])

  const fetchMedicalHistory = useCallback(async () => {
    if (!user) return []
    return dataService.getMedicalHistory(user.uid)
  }, [user])

  const createReport = useCallback(async (report) => {
    if (!user) return null
    return dataService.createReport(user.uid, report)
  }, [user])

  const fetchReports = useCallback(async () => {
    if (!user) return []
    return dataService.getReports(user.uid)
  }, [user])

  const fetchHealthRecords = useCallback(async () => {
    if (!user) return []
    return dataService.getHealthRecords(user.uid)
  }, [user])

  const fetchImageAnalyses = useCallback(async () => {
    if (!user) return []
    return dataService.getImageAnalyses(user.uid)
  }, [user])

  const currentRole = profile?.role || USER_ROLES.PATIENT
  const isPatient = currentRole === USER_ROLES.PATIENT
  const isDoctor = currentRole === USER_ROLES.DOCTOR
  const isAdmin = currentRole === USER_ROLES.ADMIN

  const value = useMemo(() => ({
    user,
    profile,
    role: currentRole,
    isPatient,
    isDoctor,
    isAdmin,
    loading,
    error,
    signIn,
    signUp,
    resetPassword,
    logout,
    createAppointment,
    fetchAppointments,
    createMedicalHistory,
    fetchMedicalHistory,
    createReport,
    fetchReports,
    fetchHealthRecords,
    fetchImageAnalyses,
  }), [
    user,
    profile,
    currentRole,
    isPatient,
    isDoctor,
    isAdmin,
    loading,
    error,
    signIn,
    signUp,
    resetPassword,
    logout,
    createAppointment,
    fetchAppointments,
    createMedicalHistory,
    fetchMedicalHistory,
    createReport,
    fetchReports,
    fetchHealthRecords,
    fetchImageAnalyses,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
