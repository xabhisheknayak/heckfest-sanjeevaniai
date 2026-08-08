import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from './ui/PageLoader'
import { USER_ROLES } from '../constants/roles'

export function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) return <PageLoader />

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.warn(`Unauthorized route attempt by role '${role}'. Allowed:`, allowedRoles)

    let targetDashboard = '/dashboard'
    if (role === USER_ROLES.DOCTOR) {
      targetDashboard = '/doctor'
    } else if (role === USER_ROLES.ADMIN) {
      targetDashboard = '/admin'
    }

    return (
      <Navigate
        to={targetDashboard}
        state={{
          unauthorizedNotice: true,
          message: 'Access Denied: Your account does not have permission to access that area.'
        }}
        replace
      />
    )
  }

  return children
}
