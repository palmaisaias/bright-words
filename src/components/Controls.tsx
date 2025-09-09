import { SoundPlayer } from '../engine/SoundPlayer'

type Props = {
word: string
player: SoundPlayer
onNext: () => void
}

export default function Controls({ word, player, onNext }: Props) {
return (
<div className="mt-6 flex items-center gap-4 justify-center flex-wrap">
<button className="btn btn-primary" onClick={() => player.playSpell(word)}>Spell word</button>
<button className="btn btn-secondary" onClick={() => player.playSay(word)}>Say word</button>
<button className="btn btn-primary" onClick={onNext}>Next</button>
</div>
)
}