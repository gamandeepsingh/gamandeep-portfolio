"use client"

import { useEffect } from "react"
import { useReducedMotion } from "motion/react"

import { playKeySound } from "@/lib/soundcn/keyboard-synth"

/** Plays a soft mechanical click on every key press, site-wide. */
export function KeyboardSounds() {
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return

    const onKeyDown = (event: KeyboardEvent) => {
      // Held keys auto-repeat; a real keyboard only clicks once.
      if (event.repeat) return

      playKeySound(event.key)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shouldReduceMotion])

  return null
}
