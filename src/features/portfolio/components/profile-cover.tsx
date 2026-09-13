import { cn } from "@/lib/utils"
import { GhostMark } from "@/components/ghost-mark"

/**
 * Cover art above the profile name: a dot-grid backdrop with the site mark.
 * The `js-cover-mark` id is what the sticky header watches to decide when to
 * fade its own mark in (see `site-header-mark.tsx`).
 */
export function ProfileCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex aspect-2.5/1 items-center justify-center select-none sm:aspect-3/1",
        "bg-[radial-gradient(var(--line)_1px,transparent_1px)] bg-size-[16px_16px]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]"
        aria-hidden
      />

      <GhostMark
        id="js-cover-mark"
        className="relative size-16 text-foreground/80 sm:size-20"
      />
    </div>
  )
}
