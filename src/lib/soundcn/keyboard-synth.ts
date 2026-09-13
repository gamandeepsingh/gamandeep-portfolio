import { getAudioContext } from "@/lib/soundcn/sound-engine"

/**
 * Synthesized Mac-style key press: a short band-passed noise transient (the
 * "click") over a quickly-decaying low sine (the "thock").
 *
 * Every key has its own voice, derived from where it sits on a US layout:
 * moving right across a row brightens the click, moving down the rows deepens
 * the thock. So `a` always sounds like `a`, and `a` ≠ `s` ≠ `z`. A little
 * jitter on top keeps a burst of typing from sounding like a loop.
 */
type KeyKind = "key" | "space" | "modifier"

const ROWS = ["`1234567890-=", "qwertyuiop[]\\", "asdfghjkl;'", "zxcvbnm,./"]

/**
 * Where a printable key sits: `row` is normalised 0 (top) – 1 (bottom),
 * `col` is the index in that row and `cols` the row length. Null otherwise.
 */
function keyPosition(
  key: string
): { row: number; col: number; cols: number } | null {
  const k = key.toLowerCase()
  for (let r = 0; r < ROWS.length; r++) {
    const i = ROWS[r].indexOf(k)
    if (i !== -1) {
      return { row: r / (ROWS.length - 1), col: i, cols: ROWS[r].length }
    }
  }
  return null
}

function keyKind(key: string): KeyKind {
  if (key === " " || key === "Enter") return "space"
  return key.length > 1 ? "modifier" : "key"
}

let noiseBuffer: AudioBuffer | null = null

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer

  const length = Math.floor(ctx.sampleRate * 0.08)
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

const jitter = (base: number, spread: number) =>
  base + (Math.random() * 2 - 1) * spread

const PROFILE: Record<
  KeyKind,
  { click: number; body: number; volume: number; decay: number }
> = {
  key: { click: 2600, body: 190, volume: 0.22, decay: 0.05 },
  modifier: { click: 2100, body: 160, volume: 0.18, decay: 0.05 },
  // Long keys have more mass: lower, louder, a hair longer.
  space: { click: 1100, body: 110, volume: 0.3, decay: 0.08 },
}

export function playKeySound(key: string) {
  const ctx = getAudioContext()
  if (ctx.state === "suspended") {
    void ctx.resume()
  }

  const p = PROFILE[keyKind(key)]
  const pos = keyPosition(key)
  // Per-key voice: the click sweeps ~1.7–3.3 kHz left→right; the body steps
  // a semitone per key along the row (an octave across it) from a base that
  // drops with each row, so neighbours are clearly distinct yet still thock.
  const click = pos ? 1700 + (pos.col / (pos.cols - 1)) * 1600 : p.click
  const body = pos ? (150 - pos.row * 60) * 2 ** (pos.col / 12) : p.body

  const t = ctx.currentTime
  const end = t + p.decay + 0.02

  const master = ctx.createGain()
  master.gain.value = jitter(p.volume, p.volume * 0.15)
  master.connect(ctx.destination)

  // Click transient.
  const noise = ctx.createBufferSource()
  noise.buffer = getNoiseBuffer(ctx)
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = "bandpass"
  bandpass.frequency.value = jitter(click, 120)
  bandpass.Q.value = 0.9
  const noiseEnv = ctx.createGain()
  noiseEnv.gain.setValueAtTime(1, t)
  noiseEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.025)
  noise.connect(bandpass).connect(noiseEnv).connect(master)

  // Body thock.
  const osc = ctx.createOscillator()
  osc.type = "sine"
  osc.frequency.setValueAtTime(jitter(body, 6), t)
  osc.frequency.exponentialRampToValueAtTime(body * 0.4, t + p.decay)
  const oscEnv = ctx.createGain()
  oscEnv.gain.setValueAtTime(0.7, t)
  oscEnv.gain.exponentialRampToValueAtTime(0.001, t + p.decay)
  osc.connect(oscEnv).connect(master)

  noise.start(t)
  osc.start(t)
  noise.stop(end)
  osc.stop(end)
  osc.onended = () => master.disconnect()
}
