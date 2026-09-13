import { cn } from "@/lib/utils"

/**
 * Site mark — a minimal ghost, a nod to the "Ghost" handle.
 * Rendered in `currentColor`; the eyes are cut out with `evenodd`.
 */
export function GhostMark({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      className={cn("size-6", className)}
      aria-hidden
      {...props}
    >
      <path d="M12 2a8 8 0 0 0-8 8v11.25a.75.75 0 0 0 1.2.6l2.05-1.54a1.25 1.25 0 0 1 1.5 0l1.75 1.31a2.5 2.5 0 0 0 3 0l1.75-1.31a1.25 1.25 0 0 1 1.5 0l2.05 1.54a.75.75 0 0 0 1.2-.6V10a8 8 0 0 0-8-8Zm-3 7.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  )
}
