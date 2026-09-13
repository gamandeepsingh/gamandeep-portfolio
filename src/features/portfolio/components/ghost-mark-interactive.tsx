"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { TargetAndTransition, Transition } from "motion/react"
import {
  motion,
  useAnimate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { musicPlayer } from "@/lib/soundcn/music-player"
import { cn } from "@/lib/utils"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"

import {
  GhostParticles,
  PARTICLE_LIFETIME_MS,
  type Particle,
  type ParticleKind,
} from "./ghost-particles"

/** Body outline of the ghost, same silhouette as the static `GhostMark`. */
const BODY_PATH =
  "M12 2a8 8 0 0 0-8 8v11.25a.75.75 0 0 0 1.2.6l2.05-1.54a1.25 1.25 0 0 1 1.5 0l1.75 1.31a2.5 2.5 0 0 0 3 0l1.75-1.31a1.25 1.25 0 0 1 1.5 0l2.05 1.54a.75.75 0 0 0 1.2-.6V10a8 8 0 0 0-8-8Z"

/** Small heart centred on 0,0 — swapped in for the pupils when smitten. */
const HEART_EYE_PATH =
  "M0 1.1C-.25.8-1.45.1-1.45-.65-1.45-1.2-1.05-1.5-.7-1.5-.35-1.5 0-1.25 0-.95 0-1.25.35-1.5.7-1.5 1.05-1.5 1.45-1.2 1.45-.65 1.45.1.25.8 0 1.1Z"

/** Five-point star centred on 0,0 with radius 1 — orbits the head when dizzy. */
const STAR_PATH = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 1 : 0.45
  const a = (Math.PI / 5) * i - Math.PI / 2
  return `${i === 0 ? "M" : "L"}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`
}).join("")

const EYES = [
  { cx: 9, cy: 10.75 },
  { cx: 15, cy: 10.75 },
] as const

const SOCKET_RADIUS = 1.5
const PUPIL_RADIUS = 0.7
/** How far a pupil may drift from the socket centre, in SVG units. */
const PUPIL_TRAVEL = SOCKET_RADIUS - PUPIL_RADIUS - 0.1

const followSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 24,
  mass: 0.2,
}

const FLOAT_DURATION = 3.2

const BLINK_TIMES = [0, 0.4, 0.5, 0.6, 1] as const
const BLINK_TRANSITION: Transition = {
  duration: 4.5,
  times: [...BLINK_TIMES],
  repeat: Infinity,
  ease: "easeInOut",
}

/**
 * Moods and what sets them off:
 *  - dizzy:    five taps inside 1.5 s
 *  - love:     two taps inside 350 ms
 *  - startled: the cursor rushing into him
 *  - sleepy:   nothing happening for 12 s
 *  - dancing:  the header music playing
 * Everything else is `idle`.
 */
type Mood = "idle" | "dizzy" | "love" | "startled" | "sleepy" | "dancing"

const MOOD_DURATION_MS: Partial<Record<Mood, number>> = {
  dizzy: 2600,
  love: 2400,
  startled: 900,
}

const IDLE_BEFORE_SLEEP_MS = 12_000
const STARTLE_SPEED_PX_PER_MS = 1.4

/** Whole-body motion per mood, applied to the bobbing wrapper. */
const BODY_BY_MOOD: Record<Mood, TargetAndTransition> = {
  idle: {
    y: [0, -6, 0],
    rotate: 0,
    scale: 1,
    transition: {
      duration: FLOAT_DURATION,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  dizzy: {
    y: [0, 3, 6, 6, 4, 0],
    rotate: [0, -10, 9, -7, 5, 0],
    scale: 1,
    transition: { duration: 2.4, ease: "easeInOut" },
  },
  love: {
    y: 0,
    rotate: 0,
    scale: [1, 1.1, 1, 1.1, 1],
    transition: { duration: 1.2, ease: "easeInOut" },
  },
  startled: {
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
  sleepy: {
    y: [0, -2, 0],
    rotate: [4, 6, 4],
    scale: 1,
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  dancing: {
    y: [0, -7, 0, -7, 0],
    rotate: [-9, 9, -9],
    scale: 1,
    transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
  },
}

const STILL: TargetAndTransition = { y: 0, rotate: 0, scale: 1 }

/**
 * Ghost mark for the profile cover. It floats, leans and looks toward the
 * cursor, blinks now and then, and squishes with a click sound when tapped —
 * plus a handful of moods (see `Mood`) that visitors can set off.
 * Cursor tracking is skipped for coarse pointers and reduced motion.
 */
export function GhostMarkInteractive({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children">) {
  const ref = useRef<HTMLDivElement>(null)
  const [jumpScope, animateJump] = useAnimate<HTMLDivElement>()

  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })
  const isActive = !shouldReduceMotion && isInView

  const [play] = useClickSound()

  // --- Mood -----------------------------------------------------------------
  const [mood, setMoodState] = useState<Mood>("idle")
  const moodRef = useRef<Mood>("idle")
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  const setMood = useCallback((next: Mood) => {
    if (moodTimer.current) clearTimeout(moodTimer.current)
    moodTimer.current = null
    moodRef.current = next
    setMoodState(next)

    const duration = MOOD_DURATION_MS[next]
    if (duration) {
      moodTimer.current = setTimeout(() => {
        moodRef.current = "idle"
        setMoodState("idle")
      }, duration)
    }
  }, [])

  useEffect(() => musicPlayer.subscribe(setIsMusicPlaying), [])

  // Music takes the floor whenever he's not mid-reaction.
  useEffect(() => {
    if (isMusicPlaying && moodRef.current === "idle") setMood("dancing")
    if (!isMusicPlaying && moodRef.current === "dancing") setMood("idle")
  }, [isMusicPlaying, setMood])

  // --- Particles ------------------------------------------------------------
  const [particles, setParticles] = useState<Particle[]>([])
  const particleId = useRef(0)

  const spawn = useCallback((kind: ParticleKind, count = 1) => {
    const batch: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: particleId.current++,
      kind,
      dx: (Math.random() - 0.5) * 56,
      drift: (Math.random() - 0.5) * 36,
      delay: i * 0.12,
    }))
    setParticles((prev) => [...prev, ...batch])

    const ids = new Set(batch.map((p) => p.id))
    setTimeout(
      () => setParticles((prev) => prev.filter((p) => !ids.has(p.id))),
      PARTICLE_LIFETIME_MS + count * 120
    )
  }, [])

  // Sustained moods drip particles while they last.
  useEffect(() => {
    if (!isActive) return
    const drip: Partial<Record<Mood, [ParticleKind, number]>> = {
      sleepy: ["zzz", 1100],
      dancing: ["note", 650],
    }
    const entry = drip[mood]
    if (!entry) return

    const [kind, every] = entry
    spawn(kind)
    const timer = setInterval(() => spawn(kind), every)
    return () => clearInterval(timer)
  }, [mood, isActive, spawn])

  // --- Taps: love on a double, dizzy on a flurry ----------------------------
  const tapTimes = useRef<number[]>([])

  const handleTap = () => {
    play()
    if (!isActive) return

    const now = performance.now()
    tapTimes.current = [...tapTimes.current, now].filter((t) => now - t < 1500)
    const recent = tapTimes.current

    if (recent.length >= 5) {
      tapTimes.current = []
      setMood("dizzy")
      setParticles([])
      spawn("star", 3)
    } else if (
      recent.length === 2 &&
      now - recent[0] < 350 &&
      moodRef.current !== "dizzy"
    ) {
      setMood("love")
      spawn("heart", 5)
    } else if (moodRef.current === "sleepy") {
      setMood("idle")
    }
  }

  // --- Keys: a little bob per press, and it wakes him -----------------------
  useEffect(() => {
    if (!isActive) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (moodRef.current === "sleepy") setMood("idle")
      animateJump(
        jumpScope.current,
        { y: [0, 3, 0] },
        { duration: 0.22, ease: "easeOut" }
      )
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isActive, animateJump, jumpScope, setMood])

  // --- Sleep: nod off when nothing happens, wake on anything ----------------
  useEffect(() => {
    if (!isActive) return

    let timer: ReturnType<typeof setTimeout> | null = null
    const arm = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (moodRef.current === "idle") setMood("sleepy")
      }, IDLE_BEFORE_SLEEP_MS)
    }
    const onActivity = () => {
      if (moodRef.current === "sleepy") setMood("idle")
      arm()
    }

    arm()
    const events = [
      "mousemove",
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ]
    for (const ev of events)
      window.addEventListener(ev, onActivity, { passive: true })
    return () => {
      if (timer) clearTimeout(timer)
      for (const ev of events) window.removeEventListener(ev, onActivity)
    }
  }, [isActive, setMood])

  // --- Cursor: look toward it, and get startled if it charges in ------------
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const lastPointer = useRef({ x: 0, y: 0, t: 0, speed: 0 })

  const lean = useSpring(useTransform(mouseX, [-1, 1], [-12, 12]), followSpring)
  const shiftX = useSpring(useTransform(mouseX, [-1, 1], [-8, 8]), followSpring)
  const shiftY = useSpring(useTransform(mouseY, [-1, 1], [-5, 5]), followSpring)

  const pupilX = useSpring(
    useTransform(mouseX, [-1, 1], [-PUPIL_TRAVEL, PUPIL_TRAVEL]),
    followSpring
  )
  const pupilY = useSpring(
    useTransform(mouseY, [-1, 1], [-PUPIL_TRAVEL, PUPIL_TRAVEL]),
    followSpring
  )

  useEffect(() => {
    if (!isActive) return
    if (window.matchMedia("(hover: none)").matches) return

    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return

      const last = lastPointer.current
      const t = performance.now()
      const dt = t - last.t
      if (dt > 0) {
        last.speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt
      }
      last.x = e.clientX
      last.y = e.clientY
      last.t = t

      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      // Full deflection at roughly half the viewport away from the ghost.
      mouseX.set(clamp((e.clientX - cx) / (window.innerWidth / 2)))
      mouseY.set(clamp((e.clientY - cy) / (window.innerHeight / 2)))
    }

    const handleMouseLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.documentElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      )
    }
  }, [isActive, mouseX, mouseY])

  const handlePointerEnter = () => {
    if (!isActive || moodRef.current !== "idle") return
    if (lastPointer.current.speed < STARTLE_SPEED_PX_PER_MS) return

    setMood("startled")
    animateJump(
      jumpScope.current,
      { y: [0, -18, 0] },
      { duration: 0.5, ease: [0.2, 0.8, 0.3, 1] }
    )
  }

  // --- Render ---------------------------------------------------------------
  const eyeStyle = isActive ? mood : "idle"
  const showPupils = eyeStyle === "idle" || eyeStyle === "startled"
  const socketScale = eyeStyle === "startled" ? 1.25 : 1

  return (
    <div
      ref={ref}
      className={cn("relative flex flex-col items-center", className)}
      {...props}
    >
      {/* Bobbing wrapper: keeps the mood keyframes separate from the springs. */}
      <motion.div
        className="relative"
        style={{ originY: 1 }}
        animate={isActive ? BODY_BY_MOOD[mood] : STILL}
      >
        {/* One-shot hops (startle, key bob) live on their own layer. */}
        <div ref={jumpScope} className="relative">
          <GhostParticles particles={particles} className="top-3" />

          <motion.svg
            id="js-cover-mark"
            viewBox="0 0 24 24"
            className="size-20 cursor-pointer touch-manipulation overflow-visible text-foreground/85 select-none sm:size-24"
            style={{
              rotate: lean,
              x: shiftX,
              y: shiftY,
              originY: 1,
            }}
            whileHover={isActive ? { scale: 1.06 } : undefined}
            whileTap={{ scaleX: 1.12, scaleY: 0.84 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            onTap={handleTap}
            onPointerEnter={handlePointerEnter}
            aria-hidden
          >
            <path d={BODY_PATH} fill="currentColor" />

            {/* Blush — only when smitten. */}
            <motion.g
              fill="#f87171"
              initial={{ opacity: 0 }}
              animate={{ opacity: eyeStyle === "love" ? 0.75 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ellipse cx={7.6} cy={13.4} rx={1.2} ry={0.65} />
              <ellipse cx={16.4} cy={13.4} rx={1.2} ry={0.65} />
            </motion.g>

            {EYES.map((eye) => (
              <g key={eye.cx}>
                {/* Socket: reads as a hole, like the static mark. */}
                <motion.ellipse
                  cx={eye.cx}
                  cy={eye.cy}
                  fill="var(--background)"
                  initial={{ rx: SOCKET_RADIUS, ry: SOCKET_RADIUS }}
                  animate={socketTarget(eyeStyle, socketScale)}
                  transition={
                    eyeStyle === "idle"
                      ? BLINK_TRANSITION
                      : { duration: 0.25, ease: "easeOut" }
                  }
                />

                {/* Pupil: follows the cursor and closes with the lid. */}
                {showPupils && (
                  <motion.ellipse
                    cx={eye.cx}
                    cy={eye.cy}
                    rx={eyeStyle === "startled" ? 0.5 : PUPIL_RADIUS}
                    fill="currentColor"
                    style={{ x: pupilX, y: pupilY }}
                    initial={{ ry: PUPIL_RADIUS }}
                    animate={
                      eyeStyle === "idle"
                        ? {
                            ry: [
                              PUPIL_RADIUS,
                              PUPIL_RADIUS,
                              0,
                              PUPIL_RADIUS,
                              PUPIL_RADIUS,
                            ],
                          }
                        : { ry: 0.5 }
                    }
                    transition={
                      eyeStyle === "idle" ? BLINK_TRANSITION : { duration: 0.2 }
                    }
                  />
                )}

                {/* Heart eyes. */}
                {eyeStyle === "love" && (
                  <motion.path
                    d={HEART_EYE_PATH}
                    fill="#ef4444"
                    style={{ x: eye.cx, y: eye.cy }}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.25, 1, 1.15, 1] }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                )}

                {/* Knocked-out eyes. */}
                {eyeStyle === "dizzy" && (
                  <motion.g
                    stroke="currentColor"
                    strokeWidth={0.45}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <line
                      x1={eye.cx - 0.85}
                      y1={eye.cy - 0.85}
                      x2={eye.cx + 0.85}
                      y2={eye.cy + 0.85}
                    />
                    <line
                      x1={eye.cx + 0.85}
                      y1={eye.cy - 0.85}
                      x2={eye.cx - 0.85}
                      y2={eye.cy + 0.85}
                    />
                  </motion.g>
                )}

                {/* Happy ^ ^ while dancing. */}
                {eyeStyle === "dancing" && (
                  <path
                    d={`M${eye.cx - 1.5} ${eye.cy + 0.6}Q${eye.cx} ${eye.cy - 2.6} ${eye.cx + 1.5} ${eye.cy + 0.6}`}
                    fill="none"
                    stroke="var(--background)"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                  />
                )}
              </g>
            ))}

            {/* Stars circling the head while dizzy. */}
            {eyeStyle === "dizzy" && (
              <g transform="translate(12 1.6) scale(1 0.45)">
                <motion.g
                  fill="#fbbf24"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {[0, 90, 180, 270].map((deg) => (
                    <path
                      key={deg}
                      d={STAR_PATH}
                      transform={`rotate(${deg}) translate(3.6 0) scale(1.1 2.2)`}
                    />
                  ))}
                </motion.g>
              </g>
            )}

            {/* "!" when startled. */}
            {eyeStyle === "startled" && (
              <motion.text
                x={12}
                y={-1.5}
                textAnchor="middle"
                fontSize={6}
                fill="currentColor"
                className="font-handwritten"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.3, 1, 1] }}
                transition={{ duration: 0.9, times: [0, 0.2, 0.7, 1] }}
              >
                !
              </motion.text>
            )}
          </motion.svg>
        </div>
      </motion.div>

      {/* Ground shadow, breathing opposite to the float. */}
      <motion.div
        className="mt-1 h-2 w-14 rounded-[100%] bg-foreground/20 blur-[3px] sm:w-16"
        animate={
          isActive
            ? { scaleX: [1, 0.72, 1], opacity: [0.5, 0.25, 0.5] }
            : { scaleX: 1, opacity: 0.5 }
        }
        transition={{
          duration: FLOAT_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden
      />
    </div>
  )
}

/** Socket shape per mood: the blink loop when idle, otherwise a fixed pose. */
function socketTarget(style: Mood, scale: number): TargetAndTransition {
  switch (style) {
    case "idle":
      return {
        rx: SOCKET_RADIUS,
        ry: [SOCKET_RADIUS, SOCKET_RADIUS, 0.12, SOCKET_RADIUS, SOCKET_RADIUS],
      }
    case "sleepy":
      return { rx: SOCKET_RADIUS, ry: 0.45 }
    case "dancing":
      // Hidden under the ^ ^ arcs.
      return { rx: SOCKET_RADIUS, ry: 0.01 }
    default:
      return { rx: SOCKET_RADIUS * scale, ry: SOCKET_RADIUS * scale }
  }
}

function clamp(value: number, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value))
}
