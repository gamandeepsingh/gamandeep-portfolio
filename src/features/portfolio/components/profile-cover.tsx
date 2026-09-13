import { cn } from "@/lib/utils"

import { GhostMarkInteractive } from "./ghost-mark-interactive"

/**
 * Cover art above the profile name: a dot-grid backdrop with the interactive
 * site mark. The mark carries the `js-cover-mark` id the sticky header watches
 * to decide when to fade its own mark in (see `site-header-mark.tsx`).
 */
export function ProfileCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex aspect-2.5/1 items-center justify-center sm:aspect-3/1",
        "bg-[radial-gradient(var(--line)_1px,transparent_1px)] bg-size-[16px_16px]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]"
        aria-hidden
      />

      <GhostMarkInteractive className="relative" />
    </div>
  )
}
