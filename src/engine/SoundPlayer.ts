export class SoundPlayer {
  private current: HTMLAudioElement | null = null
  private readonly base = '/audio'

  stop() {
    if (this.current) {
      this.current.onended = null
      this.current.onerror = null
      this.current.pause()
      this.current.currentTime = 0
      this.current = null
    }
  }

  private playFile(path: string): Promise<void> {
    this.stop()
    const audio = new Audio(path)
    audio.preload = 'auto'
    this.current = audio

    return new Promise((resolve, reject) => {
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error(`Audio load error: ${path}`))

      const p = audio.play()
      if (p && typeof p.catch === 'function') {
        p.catch(err => reject(err)) // surfaces NotAllowedError to caller
      }
    })
  }

  playSay(word: string)     { return this.playFile(`${this.base}/say/say_${word.toLowerCase()}.mp3`) }
  playSpell(word: string)   { return this.playFile(`${this.base}/spell/spell_${word.toLowerCase()}.mp3`) }
  playLetter(letter: string){ return this.playFile(`${this.base}/letters/letter_${letter.toLowerCase()}.mp3`) }
  playWelcomeRandom(pool: string[]) {
    const pick = pool[Math.floor(Math.random() * pool.length)]
    return this.playFile(`${this.base}/welcome/${pick}`)
  }
}
