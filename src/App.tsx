import { useMemo, useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SIGHT_WORDS } from './data/sightWords'
import { WordDeck } from './engine/WordDeck'
import { SoundPlayer } from './engine/SoundPlayer'
import Splash from './components/Splash'
import WordCard from './components/WordCard'
import Controls from './components/Controls'
import NumberBar from './components/NumberBar'
import { Link } from 'react-router-dom'
import { fireConfettiFor } from './lib/Confetti'

export default function App() {
  const deck = useMemo(() => new WordDeck(SIGHT_WORDS), [])
  const player = useMemo(() => new SoundPlayer(), [])

  // Show splash once per tab/session. Refresh won't re-show it.
  const [ready, setReady] = useState(() => sessionStorage.getItem('splashSeen') === '1')
  const [index, setIndex] = useState(0)

  const [seen, setSeen] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem('seenIndices')
      const arr = raw ? (JSON.parse(raw) as number[]) : []
      return new Set(arr)
    } catch {
      return new Set<number>()
    }
  })

  const total = SIGHT_WORDS.length
  const seenCount = seen.size
  const isComplete = seenCount === total

  const word = SIGHT_WORDS[index]
  const next = () => setIndex(i => (i + 1) % deck.size())
  const prev = () => setIndex(i => (i - 1 + deck.size()) % deck.size())

  const handleSplashDone = () => {
    sessionStorage.setItem('splashSeen', '1')
    setReady(true)
  }

  // Mark the current word as seen whenever index changes
  useEffect(() => {
    setSeen(prev => {
      if (prev.has(index)) return prev
      const updated = new Set(prev)
      updated.add(index)
      try { sessionStorage.setItem('seenIndices', JSON.stringify([...updated])) } catch {}
      return updated
    })
  }, [index])

  // Completion effects: confetti for 10s and play the song once per completion
  const completionFiredRef = useRef(false)
  const completionAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // preload once
    const a = new Audio('/audio/janeiro_snip.mp3')
    a.preload = 'auto'
    completionAudioRef.current = a
  }, [])

  useEffect(() => {
    if (isComplete && !completionFiredRef.current) {
      completionFiredRef.current = true
      // confetti 10s
      fireConfettiFor(10_000)
      // play audio
      const a = completionAudioRef.current
      if (a) {
        try {
          a.currentTime = 0
          const p = a.play()
          if (p && typeof (p as any).catch === 'function') {
            ;(p as Promise<void>).catch(() => {})
          }
        } catch {}
      }
    }
    if (!isComplete) {
      // reset so it can fire again on a fresh run
      completionFiredRef.current = false
    }
  }, [isComplete])

  if (!ready) return <Splash onDone={handleSplashDone} player={player} />

  return (
    <div className="min-h-full bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <main className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-sky-800 tracking-tight">Hi, Alexander!</h1>
          <p className="text-sky-900/70 mt-2">40 words. Tap through. Listen and learn.</p>
          <div className="mt-4">
            <NumberBar
              min={0}
              max={total}
              value={seenCount}
              label="Lesson progress"
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.section
            key={word}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <WordCard
              word={word}
              onLetterClick={(ch) => player.playLetter(ch)}
            />
            <Controls word={word} player={player} onNext={next} onPrev={prev} />
          </motion.section>
        </AnimatePresence>

        {/* Numbers CTA at bottom */}
        <div className="mt-10 flex flex-col items-center justify-end min-h-[30vh]">
          <p className="text-sky-900/70 text-sm sm:text-base mb-2">
            Want to practice numbers too? Click here!
          </p>
          <Link to="/numbers" className="btn btn-primary text-sm sm:text-base">
            Numbers 1-100
          </Link>
        </div>

        {/* Optional decorative image */}
        <img src="/images/stars.png" alt="Decor" className="pointer-events-none select-none fixed right-4 bottom-4 w-54 opacity-60" />
      </main>
    </div>
  )
}
