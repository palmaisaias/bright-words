import { SoundPlayer } from '../engine/SoundPlayer'

type Props = {
  word: string
  player: SoundPlayer
  onNext: () => void
  onPrev: () => void
}

export default function Controls({ word, player, onNext, onPrev }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-3 items-stretch sm:flex-row sm:items-center sm:justify-center sm:flex-wrap">
      <button className="btn btn-secondary w-full sm:w-auto" onClick={onPrev}>⬅ Previous</button>
      <button className="btn btn-primary  w-full sm:w-auto" onClick={() => player.playSpell(word)}>spell word</button>
      <button className="btn btn-primary  w-full sm:w-auto" onClick={() => player.playSay(word)}>say word</button>
      <button className="btn btn-secondary w-full sm:w-auto" onClick={onNext}>Next ➡</button>
    </div>
  )
}

