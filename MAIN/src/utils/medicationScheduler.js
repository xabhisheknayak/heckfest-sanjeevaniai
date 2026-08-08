/**
 * Medication Scheduler Utility Functions
 * Handles date formatting, dynamic occurrence matching, and status evaluation.
 */

// Helper to format Date object to YYYY-MM-DD
export function formatDateToYYYYMMDD(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to format YYYY-MM-DD or ISO string to readable string e.g. "08 Aug 2026"
export function formatReadableDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length !== 3) return dateStr
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  const dateObj = new Date(year, month, day)
  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Convert "08:00 AM" or "14:30" string to minutes from midnight for sorting/comparison
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0
  const cleanTime = timeStr.trim().toUpperCase()
  const isPM = cleanTime.includes('PM')
  const isAM = cleanTime.includes('AM')
  
  const timeOnly = cleanTime.replace(/(AM|PM)/, '').trim()
  const [hoursStr, minutesStr] = timeOnly.split(':')
  let hours = parseInt(hoursStr, 10) || 0
  const minutes = parseInt(minutesStr, 10) || 0

  if (isPM && hours < 12) hours += 12
  if (isAM && hours === 12) hours = 0

  return hours * 60 + minutes
}

// Format 24h or 12h time string nicely into "08:00 AM" format
export function formatDisplayTime(timeStr) {
  if (!timeStr) return ''
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr
  }
  const [h, m] = timeStr.split(':')
  let hours = parseInt(h, 10) || 0
  const minutes = String(parseInt(m, 10) || 0).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const formattedHours = String(hours).padStart(2, '0')
  return `${formattedHours}:${minutes} ${ampm}`
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Checks if a medication is scheduled to occur on a given date (default today).
 * @param {Object} med Medication object
 * @param {Date|string} date target date
 * @returns {boolean}
 */
export function isMedicationScheduledForDate(med, targetDate = new Date()) {
  if (!med || med.active === false) return false

  const targetDateObj = new Date(targetDate)
  targetDateObj.setHours(0, 0, 0, 0)
  const targetDateStr = formatDateToYYYYMMDD(targetDateObj)

  // Check Start & End Date boundaries
  if (med.startDate && targetDateStr < med.startDate) return false
  if (med.endDate && targetDateStr > med.endDate) return false

  const freq = med.frequency || 'every_day'

  if (freq === 'every_day' || freq === 'Every day') {
    return true
  }

  if (freq === 'every_week' || freq === 'Every week') {
    if (!med.startDate) return true
    const startObj = new Date(med.startDate)
    return targetDateObj.getDay() === startObj.getDay()
  }

  if (freq === 'specific_days' || freq === 'Specific days of week') {
    const dayName = DAY_NAMES[targetDateObj.getDay()]
    const selectedDays = med.specificDays || []
    return selectedDays.includes(dayName)
  }

  return true
}

/**
 * Calculates status of a scheduled medication for a given date.
 * Options: 'taken' (🟢), 'skipped' (⚪), 'missed' (🔴), 'pending' (🟡)
 * @param {Object} med 
 * @param {string} dateStr YYYY-MM-DD
 * @param {Array} logs array of medication log items
 * @returns {string} status code
 */
export function calculateMedicationStatus(med, dateStr, logs = []) {
  if (!med) return 'pending'

  // Find if there is a recorded log for this med on dateStr
  const log = logs.find(
    (l) => l.medicationId === med.id && l.date === dateStr
  )

  if (log) {
    return log.status // 'taken' or 'skipped'
  }

  // Check if target date is in the past or today
  const todayStr = formatDateToYYYYMMDD(new Date())

  if (dateStr < todayStr) {
    return 'missed'
  }

  if (dateStr > todayStr) {
    return 'pending'
  }

  // Date is today - check time vs current time
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const medMinutes = parseTimeToMinutes(med.time)

  // If time has passed today by more than 30 minutes without action, consider missed
  if (currentMinutes > medMinutes + 30) {
    return 'missed'
  }

  return 'pending'
}
