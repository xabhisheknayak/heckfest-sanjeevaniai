import { motion } from 'framer-motion'

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative flex items-center justify-center h-20 w-20">
        <motion.div
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute h-full w-full rounded-full bg-[#16A34A]/20"
        />
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute h-full w-full rounded-full bg-[#16A34A]/10"
        />
        <div className="z-10 h-10 w-10 rounded-full bg-[#16A34A] shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
        </div>
      </div>
    </div>
  )
}
