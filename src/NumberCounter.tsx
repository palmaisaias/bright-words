import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'

const NUM_MIN = 1
const NUM_MAX = 100
const AUDIO_BASE = '/audio/numbers' // public/audio/numbers/number_XX.mp3

function useNumberAudio() {
  const currentRef = useRef<HTMLAudioElement | null>(null)

  const stop = () => {
    const a = currentRef.current
    if (!a) return
    try { a.pause(); a.currentTime = 0 } catch {}
  }

  const playNumber = useCallback(async (n: number) => {
    stop()
    const audio = new Audio(`${AUDIO_BASE}/number_${n}.mp3`)
    currentRef.current = audio
    try {
      const p = audio.play()
      if (p && typeof p.catch === 'function') await p
    } catch {/* ignore autoplay errors until user interacts */}
  }, [])

  // tiny prefetch for current and next
  const preload = useCallback((n: number) => {
    const list = [n, Math.min(n + 1, NUM_MAX)]
    list.forEach(i => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'audio'
      link.href = `${AUDIO_BASE}/number_${i}.mp3`
      document.head.appendChild(link)
    })
  }, [])

  return { playNumber, preload }
}

export default function NumberCounter() {
  const [n, setN] = useState(NUM_MIN)
  const { playNumber, preload } = useNumberAudio()

  const next = () => setN(x => Math.min(NUM_MAX, x + 1))
  const prev = () => setN(x => Math.max(NUM_MIN, x - 1))

  useEffect(() => { preload(n) }, [n, preload])

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === ' ' || e.key === 'Enter') playNumber(n)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, playNumber])

  // nice color shift based on n
  const hue = useMemo(() => Math.round((n / NUM_MAX) * 360), [n])
  const gradient = `linear-gradient(135deg, hsl(${hue} 80% 70%), hsl(${(hue + 60) % 360} 85% 65%))`

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10"
         style={{ background: 'linear-gradient(180deg, #f0fbff, #ffffff)' }}>
      <main className="w-full max-w-3xl text-center">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="btn btn-secondary text-[10px] px-1 py-0.5">← Sight Words</Link>
          <h1 className="text-2xl sm:text-3xl font-black text-sky-800">Numbers 1-100</h1>
          <div className="opacity-0 w-[110px] sm:w-[120px]" aria-hidden />
        </div>

        {/* Number display */}
        <div className="relative mb-8">
          <AnimatePresence mode="wait">
            <motion.button
              key={n}
              onClick={() => playNumber(n)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mx-auto block rounded-3xl shadow-lg outline-none focus:ring-4 ring-sky-300"
              style={{
                width: 'min(90vw, 520px)',
                height: 'min(50vh, 320px)',
                background: gradient
              }}
              aria-label={`Number ${n}. Click to play`}
            >
              <motion.span
                className="font-black select-none"
                style={{
                  display: 'inline-block',
                  fontSize: 'min(28vw, 180px)',
                  lineHeight: 1,
                  color: 'white',
                  textShadow: '0 6px 20px rgba(0,0,0,.25)'
                }}
                animate={{ rotate: [0, -1.2, 1.2, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                {n}
              </motion.span>
            </motion.button>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
          <button className="btn btn-secondary" onClick={prev} disabled={n === NUM_MIN}>Previous</button>
          <button className="btn btn-primary" onClick={() => playNumber(n)}>Play</button>
          <button className="btn btn-secondary" onClick={next} disabled={n === NUM_MAX}>Next</button>
        </div>

        {/* Quick jump slider */}
        <div className="mt-6">
          <input
            type="range"
            min={NUM_MIN}
            max={NUM_MAX}
            value={n}
            onChange={e => setN(parseInt(e.target.value, 10))}
            className="w-full"
            aria-label="Jump to number"
          />
          <p className="mt-2 text-sky-900/70 text-sm">Drag to jump. Tap the big number to hear it.</p>
        </div>
      </main>
    </div>
  )
}
