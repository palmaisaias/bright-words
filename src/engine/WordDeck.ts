export class WordDeck {
private words: string[]
private index = 0
constructor(words: string[]) {
this.words = words.map(w => w.trim())
}
current() { return this.words[this.index] }
next() { this.index = (this.index + 1) % this.words.length; return this.current() }
prev() { this.index = (this.index - 1 + this.words.length) % this.words.length; return this.current() }
goTo(i: number) { if (i >= 0 && i < this.words.length) this.index = i }
getIndex() { return this.index }
size() { return this.words.length }
}