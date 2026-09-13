"use client"

import { Music2Icon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type ParticleKind = "heart" | "star" | "note" | "zzz"

export type Particle = {
  id: number
  kind: ParticleKind
  /** Horizontal start offset from the ghost's centre, px. */
  dx: number
  /** Horizontal drift over the particle's life, px. */
  drift: number
  /** Seconds before it starts rising. */
  delay: number
}

export const PARTICLE_LIFETIME_MS = 1800

const HEART_PATH =
  "M12 21s-6.7-4.3-9.3-8.1C.5 9.6 2.2 4.5 6.6 4.5c2.2 0 3.9 1.3 5.4 3.1 1.5-1.8 3.2-3.1 5.4-3.1 4.4 0 6.1 5.1 3.9 8.4C18.7 16.7 12 21 12 21Z"
const STAR_PATH =
  "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9Z"

function Glyph({ kind }: { kind: ParticleKind }) {
  switch (kind) {
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className="size-4 fill-red-500" aria-hidden>
          <path d={HEART_PATH} />
        </svg>
      )
    case "star":
      return (
        <svg
          viewBox="0 0 24 24"
          className="size-3.5 fill-amber-400"
          aria-hidden
        >
          <path d={STAR_PATH} />
        </svg>
      )
    case "note":
      return <Music2Icon className="size-3.5 text-foreground/70" aria-hidden />
    case "zzz":
      return <span className="text-lg/none text-muted-foreground">z</span>
  }
}

/**
 * Short-lived glyphs that rise from the ghost's head and fade. Positioned
 * absolutely over the mark; the parent decides when to spawn and expire them.
 */
export function GhostParticles({
  particles,
  className,
}: {
  particles: Particle[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-0 font-handwritten select-none",
        className
      )}
      aria-hidden
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute left-1/2 flex items-center justify-center"
            style={{ x: p.dx }}
            initial={{ opacity: 0, y: 6, scale: 0.5, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -72,
              x: p.dx + p.drift,
              scale: [0.5, 1.1, 1, 0.9],
              rotate: p.drift * 0.6,
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{
              duration: PARTICLE_LIFETIME_MS / 1000,
              delay: p.delay,
              ease: "easeOut",
            }}
          >
            <Glyph kind={p.kind} />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
