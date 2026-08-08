import {
  formatDateToYYYYMMDD,
  isMedicationScheduledForDate,
  parseTimeToMinutes,
} from './medicationScheduler'

const FIRED_REMINDERS_KEY = 'sanjivni-fired-reminders'

function getFiredLedger() {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(FIRED_REMINDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function recordFiredKey(key) {
  if (typeof window === 'undefined') return
  try {
    const ledger = getFiredLedger()
    if (!ledger.includes(key)) {
      ledger.push(key)
      sessionStorage.setItem(FIRED_REMINDERS_KEY, JSON.stringify(ledger))
    }
  } catch (e) {
    console.error(e)
  }
}

export const medicationReminderEngine = {
  /**
   * Check browser notification permission status.
   * Returns 'granted' | 'denied' | 'default' | 'unsupported'
   */
  getPermissionState() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  },

  /**
   * Requests browser notification permission from patient.
   */
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }
    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch (e) {
      console.warn('Notification permission request error:', e)
      return Notification.permission
    }
  },

  /**
   * Displays a system desktop browser notification if granted.
   */
  async showNotification(title, body, options = {}) {
    if (typeof window === 'undefined' || !('Notification' in window)) return null
    if (Notification.permission !== 'granted') return null

    try {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready
          if (reg && reg.showNotification) {
            await reg.showNotification(title, {
              body,
              icon: '/favicon.svg',
              tag: options.tag || 'medication-reminder',
              renotify: true,
              data: { url: '/medication-reminders' },
              ...options,
            })
            return true
          }
        } catch (swErr) {
          console.warn('ServiceWorker showNotification fallback:', swErr)
        }
      }

      const notification = new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag: options.tag || 'medication-reminder',
        renotify: true,
        ...options,
      })

      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus()
        }
      }
      return notification
    } catch (e) {
      console.warn('Failed to show desktop notification:', e)
      return null
    }
  },

  /**
   * Checks medications against current time.
   * @param {Array} medications list of active medications
   * @param {Array} logs list of past logs
   * @param {Function} onTriggerAlarm callback(medication, type) where type is 'due' | 'missed'
   */
  evaluateReminders(medications = [], logs = [], onTriggerAlarm) {
    if (!medications || medications.length === 0) return

    const now = new Date()
    const todayStr = formatDateToYYYYMMDD(now)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const firedLedger = getFiredLedger()

    medications.forEach((med) => {
      // Must be scheduled for today
      if (!isMedicationScheduledForDate(med, now)) return

      const medMinutes = parseTimeToMinutes(med.time)
      const fireKey = `${med.id}_${todayStr}_${med.time}`

      // Check if already logged (taken or skipped)
      const alreadyLogged = logs.some((l) => l.medicationId === med.id && l.date === todayStr)
      if (alreadyLogged) return

      // Check if already fired in current session
      if (firedLedger.includes(fireKey)) return

      const diff = currentMinutes - medMinutes

      // DUE ALARM: Current time is within -2 to +15 minutes of scheduled time
      if (diff >= -2 && diff <= 15) {
        recordFiredKey(fireKey)
        this.showNotification('SanjivniAI 💊 Medication Reminder', `Time to take ${med.medicineName}${med.dosage ? ` — ${med.dosage}` : ''}`)
        if (onTriggerAlarm) {
          onTriggerAlarm(med, 'due')
        }
        return
      }

      // MISSED ALARM: Scheduled time passed (16 mins to 24 hours ago) while app/tab was closed/inactive
      if (diff > 15 && diff < 1440) {
        recordFiredKey(fireKey)
        this.showNotification('SanjivniAI ⚠️ Missed Medication', `You missed ${med.medicineName} scheduled for ${med.time}`)
        if (onTriggerAlarm) {
          onTriggerAlarm(med, 'missed')
        }
      }
    })
  },
}
