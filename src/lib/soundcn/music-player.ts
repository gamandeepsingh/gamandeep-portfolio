/**
 * Background track behind the header's music button. One lazily-created
 * `<audio>` element for the whole session: nothing is downloaded until the
 * first play, it loops, and play/pause fade rather than cut.
 */
const SRC = "/music.mp3"
const VOLUME = 0.5
const FADE_MS = 1500
const FADE_STEP_MS = 50

let audio: HTMLAudioElement | null = null
let fadeTimer: ReturnType<typeof setInterval> | null = null

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC)
    audio.loop = true
    audio.preload = "none"
    audio.volume = 0
  }
  return audio
}

function fadeTo(target: number, onDone?: () => void) {
  const el = getAudio()
  if (fadeTimer) clearInterval(fadeTimer)

  const step = (VOLUME / FADE_MS) * FADE_STEP_MS
  fadeTimer = setInterval(() => {
    const next =
      el.volume < target
        ? Math.min(target, el.volume + step)
        : Math.max(target, el.volume - step)
    el.volume = next

    if (next === target) {
      if (fadeTimer) clearInterval(fadeTimer)
      fadeTimer = null
      onDone?.()
    }
  }, FADE_STEP_MS)
}

export const musicPlayer = {
  get isPlaying(): boolean {
    return audio !== null && !audio.paused
  },

  /** Resolves `false` if the browser refused playback (no user gesture yet). */
  async play(): Promise<boolean> {
    const el = getAudio()
    try {
      await el.play()
    } catch {
      return false
    }
    fadeTo(VOLUME)
    return true
  },

  pause() {
    if (!audio || audio.paused) return
    const el = audio
    fadeTo(0, () => el.pause())
  },

  /** Mirrors the element's own play/pause so OS media keys stay in sync. */
  subscribe(onChange: (isPlaying: boolean) => void): () => void {
    const el = getAudio()
    const handler = () => onChange(!el.paused)
    el.addEventListener("play", handler)
    el.addEventListener("pause", handler)
    return () => {
      el.removeEventListener("play", handler)
      el.removeEventListener("pause", handler)
    }
  },
}
