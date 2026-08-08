/**
 * Medication Audio Alarm Engine
 * Uses Web Audio API to produce a clear, self-contained dual-tone alarm chime.
 * Handles browser autoplay restrictions gracefully with user-gesture unlock.
 */

let audioCtx = null
let alarmInterval = null
let isPlaying = false
let isBlocked = false

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  return audioCtx
}

function playDualBeep() {
  try {
    const ctx = getAudioContext()
    if (!ctx || ctx.state !== 'running') return

    const now = ctx.currentTime

    // Tone 1: 600Hz
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(600, now)
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.2)

    // Tone 2: 800Hz
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(800, now + 0.22)
    gain2.gain.setValueAtTime(0.35, now + 0.22)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.22)
    osc2.stop(now + 0.45)
  } catch (err) {
    console.warn('Audio synthesis error:', err)
  }
}

export const medicationAudioEngine = {
  /**
   * Starts repeating alarm sound.
   * Returns object indicating if playback started or requires user gesture unlock.
   */
  async startAlarm() {
    if (isPlaying) return { isPlaying: true, isBlocked }

    const ctx = getAudioContext()
    if (!ctx) return { isPlaying: false, isBlocked: false }

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
    } catch (e) {
      console.warn('AudioContext resume failed:', e)
    }

    if (ctx.state !== 'running') {
      isBlocked = true
      isPlaying = true
      return { isPlaying: true, isBlocked: true }
    }

    isBlocked = false
    isPlaying = true

    // Initial beep
    playDualBeep()

    // Repeat every 1.5 seconds until stopped
    if (alarmInterval) clearInterval(alarmInterval)
    alarmInterval = setInterval(() => {
      playDualBeep()
    }, 1500)

    return { isPlaying: true, isBlocked: false }
  },

  /**
   * Unlocks audio when user taps/clicks an interaction button.
   */
  async unlockAudio() {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch (e) {
        console.warn('Audio unlock error:', e)
      }
    }
    if (ctx && ctx.state === 'running') {
      isBlocked = false
      if (!alarmInterval) {
        playDualBeep()
        alarmInterval = setInterval(() => {
          playDualBeep()
        }, 1500)
      }
      return true
    }
    return false
  },

  /**
   * Stops alarm sound completely and resets state.
   */
  stopAlarm() {
    isPlaying = false
    isBlocked = false
    if (alarmInterval) {
      clearInterval(alarmInterval)
      alarmInterval = null
    }
    if (audioCtx && audioCtx.state === 'running') {
      try {
        audioCtx.suspend()
      } catch (e) {
        console.warn('Audio suspend error:', e)
      }
    }
  },

  isBlocked() {
    return isBlocked
  },
}
