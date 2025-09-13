// src/components/NumberBar.tsx
import  { useEffect, useMemo, useRef } from "react"
import { motion } from "motion/react"

type Props = {
  min?: number
  max: number
  value: number
  onChange?: (next: number) => void
  onComplete?: () => void | Promise<void>
  label?: string
}

export default function NumberBar({
  min = 0,
  max,
  value,
  onChange,
  onComplete,
  label = "Progress",
}: Props) {
  const pct = useMemo(() => {
    const span = Math.max(1, max - min)
    return Math.min(100, Math.round(((value - min) / span) * 100))
  }, [value, min, max])

  // ensure onComplete fires once per 100%
  const firedRef = useRef(false)
  useEffect(() => {
    if (pct === 100 && !firedRef.current) {
      firedRef.current = true
      onComplete?.()
    }
    if (pct < 100) {
      firedRef.current = false
    }
  }, [pct, onComplete])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-sky-900/80">{label}</span>
        <span className="text-xs text-sky-900/60">{pct}%</span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-3 w-full rounded-full bg-sky-100 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400"
          style={{ width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      {onChange && (
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="mt-3 w-full"
          aria-label="Jump"
        />
      )}
    </div>
  )
}
