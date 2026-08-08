export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
}

export const DOCTOR_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
}

export function isValidRole(role) {
  return Object.values(USER_ROLES).includes(role)
}
