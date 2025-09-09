import { SoundPlayer } from '../engine/SoundPlayer'

type Props = {
  word: string
  player: SoundPlayer
  onNext: () => void
  onPrev: () => void
}

export default function Controls({ word, player, onNext, onPrev }: Props) {
  return (
    <div className="mt-6 flex items-center gap-4 justify-center flex-wrap">
      <button className="btn btn-secondary" onClick={onPrev}>⬅ Previous</button>
      <button className="btn btn-primary" onClick={() => player.playSpell(word)}>spell word</button>
      <button className="btn btn-primary" onClick={() => player.playSay(word)}>say word</button>
      <button className="btn btn-secondary" onClick={onNext}>Next ➡</button>
    </div>
  )
}
