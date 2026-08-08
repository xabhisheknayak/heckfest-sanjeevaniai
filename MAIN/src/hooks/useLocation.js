import { useState, useCallback, useEffect } from 'react'

export function createMapLink(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return 'https://www.google.com/maps/search/hospitals+near+me'
  }
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export function createEmergencyMessage(latitude, longitude) {
  const mapLink = createMapLink(latitude, longitude)
  return `🚨 Emergency Location — SanjivniAI\n\nMy current location:\n${mapLink}\n\nPlease use this location if emergency assistance is required.`
}

export function useLocation() {
  // Status: 'idle' | 'detecting' | 'detected' | 'denied' | 'unavailable' | 'timeout' | 'unsupported'
  const [status, setStatus] = useState('idle')
  const [permissionState, setPermissionState] = useState('unknown') // 'granted' | 'denied' | 'prompt' | 'unknown'
  const [location, setLocation] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [showHowToEnable, setShowHowToEnable] = useState(false)

  // Query native browser permissions API if available
  const checkPermissionState = useCallback(async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setPermissionState(result.state)
        if (result.state === 'denied') {
          setStatus('denied')
          setErrorMessage('Location permission was denied. Enable location access in your browser settings.')
        }
        result.onchange = () => {
          setPermissionState(result.state)
          if (result.state === 'granted') {
            setStatus('idle')
            setErrorMessage('')
          } else if (result.state === 'denied') {
            setStatus('denied')
            setErrorMessage('Location permission was denied. Enable location access in your browser settings.')
          }
        }
      } catch (e) {
        console.warn('Permissions query error:', e)
      }
    }
  }, [])

  useEffect(() => {
    checkPermissionState()
  }, [checkPermissionState])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported')
      setErrorMessage('Location services are not supported by this browser.')
      return Promise.reject(new Error('Geolocation unsupported'))
    }

    setStatus('detecting')
    setErrorMessage('')

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(6))
          const lng = Number(position.coords.longitude.toFixed(6))
          const acc = Math.round(position.coords.accuracy)

          const loc = {
            latitude: lat,
            longitude: lng,
            accuracy: acc
          }
          setLocation(loc)
          setStatus('detected')
          setPermissionState('granted')
          resolve(loc)
        },
        (error) => {
          setLocation(null)
          let msg = ''
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setStatus('denied')
              setPermissionState('denied')
              msg = 'Location permission was denied. Enable location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              setStatus('unavailable')
              msg = 'Your device could not determine your location. Please try again.'
              break
            case error.TIMEOUT:
              setStatus('timeout')
              msg = 'Location detection timed out. Please try again.'
              break
            default:
              setStatus('unavailable')
              msg = 'Unable to determine your location. Please try again.'
              break
          }
          setErrorMessage(msg)
          reject(new Error(msg))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }, [])

  const mapLink = location ? createMapLink(location.latitude, location.longitude) : null

  const openInMaps = useCallback(() => {
    if (location) {
      const link = createMapLink(location.latitude, location.longitude)
      window.open(link, '_blank', 'noopener,noreferrer')
    } else {
      window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank', 'noopener,noreferrer')
    }
  }, [location])

  // Multi-tier copy function
  const copyToClipboard = useCallback(async (textToCopy = mapLink) => {
    if (!textToCopy) return false

    // Method 1: Async Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        return true
      } catch (e) {
        console.warn('Async Clipboard write failed, using textarea fallback:', e)
      }
    }

    // Method 2: execCommand('copy') textarea fallback
    try {
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        return true
      }
    } catch (e) {
      console.warn('execCommand copy failed:', e)
    }

    // Method 3: Prompt dialog fallback
    window.prompt('Copy your location link below:', textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
    return true
  }, [mapLink])

  // Web Share API with Desktop Edge Fallback
  const shareLocation = useCallback(async () => {
    let activeLoc = location

    if (!activeLoc) {
      try {
        activeLoc = await requestLocation()
      } catch {
        return false
      }
    }

    if (!activeLoc) return false

    const link = createMapLink(activeLoc.latitude, activeLoc.longitude)
    const emergencyMsg = createEmergencyMessage(activeLoc.latitude, activeLoc.longitude)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SanjivniAI Emergency Location',
          text: 'My current location. Please use this location link if emergency assistance is needed.',
          url: link
        })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 4000)
        return true
      } catch (e) {
        if (e.name === 'AbortError') {
          // User closed share dialog, do not claim success
          return false
        }
        console.warn('Web Share API error, using clipboard fallback:', e)
      }
    }

    // Fallback to Clipboard copy
    return await copyToClipboard(emergencyMsg)
  }, [location, requestLocation, copyToClipboard])

  const reset = useCallback(() => {
    setStatus('idle')
    setLocation(null)
    setErrorMessage('')
    setCopied(false)
    setShareSuccess(false)
    setShowHowToEnable(false)
  }, [])

  return {
    status,
    permissionState,
    location,
    errorMessage,
    copied,
    shareSuccess,
    showHowToEnable,
    setShowHowToEnable,
    mapLink,
    requestLocation,
    openInMaps,
    shareLocation,
    copyToClipboard,
    reset,
    checkPermissionState
  }
}
