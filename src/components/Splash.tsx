import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SoundPlayer } from '../engine/SoundPlayer'

const WELCOME_POOL = [
  'welcome1.mp3',
  'welcome2.mp3',
  'welcome3.mp3',
  'welcome4.mp3',
  'welcome5.mp3',
  'welcome6.mp3',
  'welcome7.mp3',
  'welcome8.mp3',
  'welcome9.mp3',
]

type Props = { onDone: () => void; player: SoundPlayer }

export default function Splash({ onDone, player }: Props) {
  const [visible, setVisible] = useState(true)
  const [blocked, setBlocked] = useState(false)

  const startPlayback = useCallback(() => {
    setBlocked(false)
    player.playWelcomeRandom(WELCOME_POOL)
      .then(() => {
        setVisible(false)
        setTimeout(onDone, 500)
      })
      .catch(() => {
        // Either autoplay blocked or file missing; show the unlock button
        setBlocked(true)
      })
  }, [player, onDone])

  useEffect(() => {
    startPlayback()
    return () => player.stop()
  }, [startPlayback])

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.section
          key="splash"
          className="h-full grid place-items-center bg-gradient-to-br from-sky-100 via-white to-emerald-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          >
            <h1 className="text-6xl md:text-7xl font-black text-sky-700 drop-shadow-sm">Welcome!</h1>
            <p className="mt-4 text-xl text-sky-900/80">Let’s learn some words</p>

            <img
              src="/images/mascot.png"
              alt="Mascot"
              className="mx-auto mt-6 w-28 h-28 opacity-90 pointer-events-none select-none"
            />

            {blocked && (
              <button className="btn btn-primary mt-6" onClick={startPlayback}>
                Tap to start
              </button>
            )}
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
