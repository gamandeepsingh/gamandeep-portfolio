"use client"

import { useEffect, useRef, useState } from "react"
import { formatNumber } from "@/utils/format"
import { animate, useInView, useReducedMotion } from "motion/react"

import {
  DEFAULT_ANIMATION_DURATION_MS,
  DEFAULT_CHART_ENTER_TRANSITION,
} from "@/components/charts/animation"

/**
 * Counts from 0 to `value` the first time it scrolls into view. The server
 * renders the final figure, so there's nothing to flash and crawlers see the
 * real number; the count only replaces it once the animation actually starts.
 */
export function CountUp({
  value,
  decimals = 0,
  className,
}: {
  value: number
  /** Fraction digits to keep while counting and in the final figure. */
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: "all" })
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState<number | null>(null)

  useEffect(() => {
    if (!inView || shouldReduceMotion) return

    const controls = animate(0, value, {
      duration: DEFAULT_ANIMATION_DURATION_MS / 1000,
      ease: DEFAULT_CHART_ENTER_TRANSITION.ease,
      onUpdate: (latest) => setDisplay(latest),
    })
    return () => controls.stop()
  }, [inView, shouldReduceMotion, value])

  const shown = display ?? value
  const factor = 10 ** decimals

  return (
    <span ref={ref} className={className}>
      {formatNumber(Math.round(shown * factor) / factor)}
    </span>
  )
}
