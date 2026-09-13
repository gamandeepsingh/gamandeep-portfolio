"use client"

import { useEffect, useRef } from "react"
import type { Transition } from "motion/react"
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"

/** Body outline of the ghost, same silhouette as the static `GhostMark`. */
const BODY_PATH =
  "M12 2a8 8 0 0 0-8 8v11.25a.75.75 0 0 0 1.2.6l2.05-1.54a1.25 1.25 0 0 1 1.5 0l1.75 1.31a2.5 2.5 0 0 0 3 0l1.75-1.31a1.25 1.25 0 0 1 1.5 0l2.05 1.54a.75.75 0 0 0 1.2-.6V10a8 8 0 0 0-8-8Z"

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
 * Ghost mark for the profile cover. It floats, leans and looks toward the
 * cursor, blinks now and then, and squishes with a click sound when tapped.
 * Cursor tracking is skipped for coarse pointers and reduced motion.
 */
export function GhostMarkInteractive({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children">) {
  const ref = useRef<HTMLDivElement>(null)

  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })

  const [play] = useClickSound()

  // Cursor position relative to the ghost centre, normalised to [-1, 1].
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

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
    if (shouldReduceMotion || !isInView) {
      return
    }

    if (window.matchMedia("(hover: none)").matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return

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
  }, [shouldReduceMotion, isInView, mouseX, mouseY])

  const animateIdle = !shouldReduceMotion && isInView

  return (
    <div
      ref={ref}
      className={cn("relative flex flex-col items-center", className)}
      {...props}
    >
      {/* Bobbing wrapper: keeps the float keyframes separate from the springs. */}
      <motion.div
        className="relative"
        animate={animateIdle ? { y: [0, -6, 0] } : { y: 0 }}
        transition={{
          duration: FLOAT_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
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
          whileHover={animateIdle ? { scale: 1.06 } : undefined}
          whileTap={{ scaleX: 1.12, scaleY: 0.84 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          onTap={() => play()}
          aria-hidden
        >
          <path d={BODY_PATH} fill="currentColor" />

          {EYES.map((eye) => (
            <g key={eye.cx}>
              {/* Socket: reads as a hole, like the static mark. */}
              <motion.ellipse
                cx={eye.cx}
                cy={eye.cy}
                rx={SOCKET_RADIUS}
                fill="var(--background)"
                initial={{ ry: SOCKET_RADIUS }}
                animate={
                  animateIdle
                    ? {
                        ry: [
                          SOCKET_RADIUS,
                          SOCKET_RADIUS,
                          0.12,
                          SOCKET_RADIUS,
                          SOCKET_RADIUS,
                        ],
                      }
                    : { ry: SOCKET_RADIUS }
                }
                transition={BLINK_TRANSITION}
              />

              {/* Pupil: follows the cursor and closes with the lid. */}
              <motion.ellipse
                cx={eye.cx}
                cy={eye.cy}
                rx={PUPIL_RADIUS}
                fill="currentColor"
                style={{ x: pupilX, y: pupilY }}
                initial={{ ry: PUPIL_RADIUS }}
                animate={
                  animateIdle
                    ? {
                        ry: [
                          PUPIL_RADIUS,
                          PUPIL_RADIUS,
                          0,
                          PUPIL_RADIUS,
                          PUPIL_RADIUS,
                        ],
                      }
                    : { ry: PUPIL_RADIUS }
                }
                transition={BLINK_TRANSITION}
              />
            </g>
          ))}
        </motion.svg>
      </motion.div>

      {/* Ground shadow, breathing opposite to the float. */}
      <motion.div
        className="mt-1 h-2 w-14 rounded-[100%] bg-foreground/20 blur-[3px] sm:w-16"
        animate={
          animateIdle
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

function clamp(value: number, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value))
}
