import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'

type Props = {
  total: number
  seen: number
  isComplete?: boolean
}

export default function ProgressBar({ total, seen, isComplete = false }: Props) {
  const pct = Math.min(100, Math.round((seen / Math.max(1, total)) * 100))

  // Fire a fresh confetti burst each time we "first" hit complete
  const [burstKey, setBurstKey] = useState(0)
  useEffect(() => {
    if (isComplete) setBurstKey(k => k + 1)
  }, [isComplete])

  return (
    <div className="relative w-full">
      {/* Bar wrapper */}
      <motion.div
        className="relative h-4 sm:h-5 w-full rounded-full bg-sky-100/80 shadow-inner overflow-hidden"
        animate={isComplete ? { rotate: [0, -1.2, 1.2, -0.6, 0], scale: [1, 1.02, 0.98, 1.03, 1] } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress through words"
      >
        {/* Fill */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />

        {/* Label */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="text-[10px] sm:text-xs font-semibold text-sky-900/80">
            {seen} / {total}
          </span>
        </div>
      </motion.div>

      {/* Confetti stars */}
      <StarBurst key={burstKey} active={isComplete} />
    </div>
  )
}

function StarBurst({ active }: { active: boolean }) {
  const stars = 18
  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < stars; i++) {
      arr.push({
        left: 5 + Math.random() * 90,              // percent
        delay: Math.random() * 0.15,               // seconds
        rise: 40 + Math.random() * 50,             // px
        rot: (Math.random() - 0.5) * 80,           // deg
        scale: 0.7 + Math.random() * 0.6,
      })
    }
    return arr
  }, [active])

  if (!active) return null

  return (
    <div className="pointer-events-none absolute -top-2 left-0 right-0 h-0">
      {positions.map((p, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{ left: `${p.left}%` }}
          initial={{ y: 0, opacity: 0, scale: p.scale * 0.7, rotate: 0 }}
          animate={{ y: -p.rise, opacity: [0, 1, 1, 0], scale: [p.scale * 0.7, p.scale, p.scale, p.scale * 0.8], rotate: p.rot }}
          transition={{ duration: 1.15, ease: 'easeOut', delay: p.delay }}
        >
          <span className="text-[10px] sm:text-xs">✦</span>
        </motion.span>
      ))}
    </div>
  )
}
