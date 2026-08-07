import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
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
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const MapsPage = lazy(() => import('./pages/MapsPage'))

function App() {
  const isOnline = useOnlineStatus()

  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50">
            {!isOnline && (
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <OfflineBanner />
              </div>
            )}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <QuickActionsFAB />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
