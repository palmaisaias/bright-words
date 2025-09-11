import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

type Props = {
  total: number
  seen: number
  isComplete?: boolean
}

export default function ProgressBar({ total, seen, isComplete = false }: Props) {
  const pct = Math.min(100, Math.round((seen / Math.max(1, total)) * 100))

  const chimeRef = useRef<HTMLAudioElement | null>(null)
  const [soundReady, setSoundReady] = useState(false)
  const [needManualEnable, setNeedManualEnable] = useState(false)

  // create the audio element once
  useEffect(() => {
    const a = new Audio('/audio/janeiro_snip.mp3')
    a.preload = 'auto'
    a.crossOrigin = 'anonymous'
    chimeRef.current = a
  }, [])

  // hard unlock: must call play() synchronously in the event handler
  useEffect(() => {
    const unlock = () => {
      const a = chimeRef.current
      if (!a) return
      try {
        a.muted = true
        const p = a.play()
        p?.then(() => {
          a.pause()
          a.currentTime = 0
          a.muted = false
          setSoundReady(true)
        }).catch(() => {
          setNeedManualEnable(true)
        })
        setSoundReady(true)
      } catch {
        setNeedManualEnable(true)
      }
    }

    window.addEventListener('pointerdown', unlock, { capture: true, once: true, passive: true })
    return () => window.removeEventListener('pointerdown', unlock as any, { capture: true } as any)
  }, [])

  // Fire confetti + play when complete (only after unlocked)
  const [burstKey, setBurstKey] = useState(0)
  useEffect(() => {
    if (isComplete && soundReady) {
      setBurstKey(k => k + 1)
      const a = chimeRef.current
      if (a) {
        try {
          a.pause()
          a.currentTime = 0
          void a.play()
        } catch { /* ignore */ }
      }
    }
  }, [isComplete, soundReady])

  return (
    <div className="relative w-full">
      {/* Optional manual enable button if needed */}
      {needManualEnable && !soundReady && (
        <button
          onClick={() => {
            const a = chimeRef.current
            if (!a) return
            try {
              a.muted = true
              a.play()?.then(() => {
                a.pause()
                a.currentTime = 0
                a.muted = false
                setSoundReady(true)
                setNeedManualEnable(false)
              }).catch(() => {})
            } catch {}
          }}
          className="mb-2 rounded-lg border border-sky-300 px-2 py-1 text-xs text-sky-800"
        >
          Enable sound
        </button>
      )}

      {/* Bar wrapper */}
      <motion.div
        className="relative h-4 sm:h-5 w-full rounded-full bg-sky-100/80 shadow-inner overflow-hidden"
        animate={
          isComplete
            ? { rotate: [0, -1.2, 1.2, -0.6, 0], scale: [1, 1.02, 0.98, 1.03, 1] }
            : {}
        }
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
          repeat: 20,
          repeatType: 'loop',
        }}
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

/** Spawns a fresh burst every second for 10 seconds, then stops. */
function StarBurst({ active }: { active: boolean }) {
  type Pos = {
    left: number
    delay: number
    rise: number
    rot: number
    scale: number
  }
  type Burst = { id: number; positions: Pos[]; bornAt: number }

  const [bursts, setBursts] = useState<Burst[]>([])

  useEffect(() => {
    if (!active) {
      setBursts([])
      return
    }

    // config
    const totalDurationMs = 13_000   // how long to keep spawning
    const intervalMs = 1_000         // how often to spawn a new burst
    const starsPerBurst = 18
    const animDurationMs = 1_150     // matches motion transition duration
    const maxBurstAgeMs = animDurationMs + 400 /* buffer for delays */

    let nextId = 0
    const t0 = performance.now()

    const makePositions = (): Pos[] =>
      Array.from({ length: starsPerBurst }, () => ({
        left: 5 + Math.random() * 90,
        delay: Math.random() * 0.15,
        rise: 40 + Math.random() * 50,
        rot: (Math.random() - 0.5) * 80,
        scale: 0.7 + Math.random() * 0.6,
      }))

    const spawn = () => {
      const now = performance.now()
      setBursts(prev => {
        // prune old bursts (keep the array tidy)
        const pruned = prev.filter(b => now - b.bornAt < maxBurstAgeMs)
        return [...pruned, { id: nextId++, positions: makePositions(), bornAt: now }]
      })
    }

    // spawn immediately
    spawn()

    const interval = setInterval(() => {
      const now = performance.now()
      if (now - t0 >= totalDurationMs) {
        clearInterval(interval)
        return
      }
      spawn()
    }, intervalMs)

    // final cleanup timer to remove last burst after its animation
    const cleanup = setTimeout(() => {
      setBursts([])
    }, totalDurationMs + maxBurstAgeMs)

    return () => {
      clearInterval(interval)
      clearTimeout(cleanup)
    }
  }, [active])

  if (!active) return null

  return (
    <div className="pointer-events-none absolute -top-2 left-0 right-0 h-0">
      {bursts.map(burst =>
        burst.positions.map((p, i) => (
          <motion.span
            key={`${burst.id}-${i}`}
            className="absolute select-none"
            style={{ left: `${p.left}%` }}
            initial={{ y: 0, opacity: 0, scale: p.scale * 0.7, rotate: 0 }}
            animate={{
              y: -p.rise,
              opacity: [0, 1, 1, 0],
              scale: [p.scale * 0.7, p.scale, p.scale, p.scale * 0.8],
              rotate: p.rot,
            }}
            transition={{
              duration: 1.15,
              ease: 'easeOut',
              delay: p.delay,
            }}
          >
            <span className="text-[10px] sm:text-xs">✦</span>
          </motion.span>
        ))
      )}
    </div>
  )
}
