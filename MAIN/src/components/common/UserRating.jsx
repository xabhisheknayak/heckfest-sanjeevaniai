import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle2 } from 'lucide-react'

const STORAGE_KEY = 'sanjivni-user-ratings'

function loadAllRatings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveRating(id, rating) {
  const all = loadAllRatings()
  all[id] = { rating, timestamp: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

/**
 * Reusable star-rating widget.
 * Props:
 *   id        - unique identifier for the item being rated (e.g. doctor id or store id)
 *   name      - display name (used in confirmation toast)
 *   baseRating - the default/seed rating from the data source
 */
export function UserRating({ id, name, baseRating = 4.0 }) {
  const [hovered, setHovered] = useState(null)   // star index user is hovering (1–5)
  const [userRating, setUserRating] = useState(null) // star index user has rated (1–5)
  const [submitted, setSubmitted] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  // Load existing rating from localStorage on mount
  useEffect(() => {
    const all = loadAllRatings()
    if (all[id]) {
      setUserRating(all[id].rating)
      setSubmitted(true)
    }
  }, [id])

  const handleRate = (star) => {
    setUserRating(star)
    setSubmitted(true)
    setHovered(null)
    saveRating(id, star)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  // Displayed rating: user's own rating takes precedence, else base
  const displayRating = userRating !== null ? userRating : baseRating

  return (
    <div className="flex flex-col gap-1">
      {/* Stars Row */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered ?? (userRating ?? Math.round(baseRating)))
          return (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleRate(star)}
              className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
            >
              <Star
                className={`h-4 w-4 transition-colors ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          )
        })}

        <span className="ml-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          {displayRating.toFixed(1)}
        </span>

        {submitted && (
          <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            Your rating
          </span>
        )}
      </div>

      {!submitted && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Click to rate
        </p>
      )}

      {/* Submission Toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Thanks! You rated {userRating} star{userRating !== 1 ? 's' : ''}.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
