import { motion } from 'motion/react'

type Props = {
word: string
onLetterClick: (letter: string) => void
}

export default function WordCard({ word, onLetterClick }: Props) {
const letters = Array.from(word)
return (
<div className="card text-center">
<div className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-wide">
{letters.map((ch, i) => (
<motion.span
key={`${ch}-${i}`}
className="inline-block mx-1 cursor-pointer"
whileHover={{ scale: 1.15 }}
onClick={() => onLetterClick(ch)}
transition={{ type: 'spring', stiffness: 300, damping: 18 }}
style={{ display: 'inline-block' }}
>
<span className="transition-colors duration-200 hover:text-sky-600">{ch}</span>
</motion.span>
))}
</div>
<p className="mt-4 text-sky-900/70">Hover a letter to make it big. Click to hear it.</p>
</div>
)
}