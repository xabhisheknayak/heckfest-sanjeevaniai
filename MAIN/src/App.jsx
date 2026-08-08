import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleProtectedRoute } from './components/RoleProtectedRoute'
import { USER_ROLES } from './constants/roles'
import { AuthProvider } from './context/AuthContext'
import { PageLoader } from './components/ui/PageLoader'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { OfflineBanner } from './components/common/OfflineBanner'
import { NotFoundPage } from './components/common/NotFoundPage'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { QuickActionsFAB } from './components/ui/QuickActionsFAB'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SymptomCheckerPage = lazy(() => import('./pages/SymptomCheckerPage'))
const ImageAnalysisPage = lazy(() => import('./pages/ImageAnalysisPage'))
const DoctorFinderPage = lazy(() => import('./pages/DoctorFinderPage'))
const PharmacyFinderPage = lazy(() => import('./pages/PharmacyFinderPage'))
const AppointmentBookingPage = lazy(() => import('./pages/AppointmentBookingPage'))
const MedicalHistoryPage = lazy(() => import('./pages/MedicalHistoryPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const DoctorDashboardPage = lazy(() => import('./pages/DoctorDashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const MapsPage = lazy(() => import('./pages/MapsPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const DoctorChatPage = lazy(() => import('./pages/DoctorChatPage'))
const MedicationRemindersPage = lazy(() => import('./pages/MedicationRemindersPage'))

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Patient Portal Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/medication-reminders" element={<ProtectedRoute><MedicationRemindersPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/symptom-checker" element={<ProtectedRoute><SymptomCheckerPage /></ProtectedRoute>} />
          <Route path="/symptoms" element={<Navigate to="/symptom-checker" replace />} />
          <Route path="/image-analysis" element={<ProtectedRoute><ImageAnalysisPage /></ProtectedRoute>} />
          <Route path="/doctor-finder" element={<ProtectedRoute><DoctorFinderPage /></ProtectedRoute>} />
          <Route path="/doctors" element={<Navigate to="/doctor-finder" replace />} />
          <Route path="/pharmacy" element={<ProtectedRoute><PharmacyFinderPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentBookingPage /></ProtectedRoute>} />
          <Route path="/medical-history" element={<ProtectedRoute><MedicalHistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/maps" element={<ProtectedRoute><MapsPage /></ProtectedRoute>} />

          {/* Role-Restricted Doctor Routes */}
          <Route
            path="/doctor/chat"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.DOCTOR, USER_ROLES.ADMIN]}>
                <DoctorChatPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/doctor/*"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.DOCTOR, USER_ROLES.ADMIN]}>
                <DoctorDashboardPage />
              </RoleProtectedRoute>
            }
          />

          {/* Role-Restricted Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboardPage />
              </RoleProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const isOnline = useOnlineStatus()

  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
            {!isOnline && (
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <OfflineBanner />
              </div>
            )}
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
            <QuickActionsFAB />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App

