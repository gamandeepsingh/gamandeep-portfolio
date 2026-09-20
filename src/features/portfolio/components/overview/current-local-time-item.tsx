"use client"

import { useEffect, useId, useState } from "react"

import { InlineScript } from "@/components/inline-script"

import { IntroItem, IntroItemContent, IntroItemIcon } from "./intro-item"

export function CurrentLocalTimeItem({ timeZone }: CurrentLocalTimeItemProps) {
  const uid = useId()
  const ids = {
    time: `lt-time-${uid}`,
    diff: `lt-diff-${uid}`,
    hands: `lt-hands-${uid}`,
  }

  const [timeString, setTimeString] = useState<string>("")
  const [diffText, setDiffText] = useState<string>("")
  // Deterministic 12:00 for SSR; the inline script corrects it before paint.
  const [handsPath, setHandsPath] = useState<string>(() =>
    clockHandsPath(12, 0)
  )

  useEffect(() => {
    const updateTime = () => {
      const { time, hour, minute, diff } = computeClock(timeZone)
      setTimeString(time)
      setHandsPath(clockHandsPath(hour, minute))
      setDiffText(diff)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [timeZone])

  return (
    <IntroItem>
      <IntroItemIcon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path id={ids.hands} d={handsPath} suppressHydrationWarning />
        </svg>
      </IntroItemIcon>

      <IntroItemContent>
        <span id={ids.time} suppressHydrationWarning>
          {timeString}
        </span>
        <span
          id={ids.diff}
          className="text-muted-foreground"
          aria-hidden
          suppressHydrationWarning
        >
          {diffText}
        </span>
      </IntroItemContent>

      <InlineScript html={getInlineScript(timeZone, ids)} />
    </IntroItem>
  )
}

// Serialized via `.toString()` into the pre-hydration script, so it must stay
// self-contained: globals and arguments only, no module-scope references.
function clockHandsPath(hour: number, minute: number) {
  const h = hour % 12
  const round = (n: number) => Math.round(n * 1000) / 1000

  const minuteAngle = (minute / 60) * 2 * Math.PI
  const hourAngle = ((h + minute / 60) / 12) * 2 * Math.PI

  const hx = round(12 + 3.6 * Math.sin(hourAngle))
  const hy = round(12 - 3.6 * Math.cos(hourAngle))
  const mx = round(12 + 6 * Math.sin(minuteAngle))
  const my = round(12 - 6 * Math.cos(minuteAngle))

  return `M12 12 L${hx} ${hy} M12 12 L${mx} ${my}`
}

// Self-contained (globals only) so it can be serialized via `.toString()` into
// the pre-hydration script as well as called directly from the effect.
function computeClock(timeZone: string) {
  const now = new Date()

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now)
  const hour = parseInt(time, 10)
  const minute = parseInt(time.slice(3), 10)

  // tz offset = (tz wall-clock instant) − (UTC wall-clock instant), each read
  // back as a local Date. In minutes, positive = east of UTC.
  const viewerOffset = -now.getTimezoneOffset()
  const targetOffset =
    (new Date(now.toLocaleString("en-US", { timeZone })).getTime() -
      new Date(now.toLocaleString("en-US", { timeZone: "UTC" })).getTime()) /
    60000
  const deltaMinutes = targetOffset - viewerOffset
  const absMinutes = Math.abs(deltaMinutes)
  const h = Math.floor(absMinutes / 60)
  const m = absMinutes % 60

  // "5h 30m ahead of you", keeping half-hour zones honest.
  const span = [h > 0 && h + "h", m > 0 && m + "m"].filter(Boolean).join(" ")
  const relative =
    deltaMinutes === 0
      ? "same time as you"
      : span + (deltaMinutes > 0 ? " ahead of you" : " behind you")

  // Calendar day here vs. there, so a large offset reads as "already tomorrow".
  const dayKey = (tz?: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now)
  const dayThere = dayKey(timeZone)
  const dayHere = dayKey()
  const day =
    dayThere > dayHere
      ? " · already tomorrow"
      : dayThere < dayHere
        ? " · still yesterday"
        : ""

  const diff = " · " + relative + day

  return { time, hour, minute, diff }
}

type CurrentLocalTimeItemProps = {
  timeZone: string
}

type ClockIds = { time: string; diff: string; hands: string }

// Shared `compute`/`handsPath` are passed as arguments rather than referenced
// because this body is serialized via `.toString()` (globals + args only).
function runClockScript(
  timeZone: string,
  ids: ClockIds,
  compute: typeof computeClock,
  handsPath: typeof clockHandsPath
) {
  try {
    const { time, diff, hour, minute } = compute(timeZone)
    const t = document.getElementById(ids.time)
    if (t) t.textContent = time
    const d = document.getElementById(ids.diff)
    if (d) d.textContent = diff
    const p = document.getElementById(ids.hands)
    if (p) p.setAttribute("d", handsPath(hour, minute))
  } catch {}
}

// Blocking inline script that paints the viewer-local clock before hydration
// (Next.js "prevent flash before hydration"). Sharing `computeClock` with the
// effect guarantees the pre-hydration value matches what React renders.
function getInlineScript(timeZone: string, ids: ClockIds) {
  return `(${runClockScript.toString()})(${JSON.stringify(timeZone)},${JSON.stringify(ids)},${computeClock.toString()},${clockHandsPath.toString()})`
}
