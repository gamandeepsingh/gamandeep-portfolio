"use client"

import { useMemo, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"
import { Button } from "@/components/base/ui/button"

/**
 * One row of the list. `node` is the server-rendered item, passed through as
 * a ReactNode so this client wrapper only owns filter state.
 */
export type FilterableEntry<C extends string> = {
  id: string
  categories: C[]
  node: React.ReactNode
}

/**
 * Chip-filtered, "show more" list shared by the Projects and Contributions
 * panels. Chips are derived from `categories` and hidden when empty.
 */
export function FilterableList<C extends string>({
  entries,
  categories,
  filterLabel,
  max = 4,
}: {
  entries: FilterableEntry<C>[]
  categories: { id: C; label: string }[]
  /** Accessible name for the chip group, e.g. "Filter projects by category". */
  filterLabel: string
  max?: number
}) {
  const [filter, setFilter] = useState<C | "all">("all")
  const [expanded, setExpanded] = useState(false)

  const [click] = useClickSound()

  const counts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length }
    for (const entry of entries) {
      for (const category of entry.categories) {
        counts[category] = (counts[category] ?? 0) + 1
      }
    }
    return counts
  }, [entries])

  const filtered =
    filter === "all"
      ? entries
      : entries.filter((entry) => entry.categories.includes(filter))

  const visible = expanded ? filtered : filtered.slice(0, max)
  const hasMore = filtered.length > max

  const selectFilter = (next: C | "all") => {
    click()
    setFilter(next)
    setExpanded(false)
  }

  const chips: { id: C | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.filter((category) => (counts[category.id] ?? 0) > 0),
  ]

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-3"
        role="group"
        aria-label={filterLabel}
      >
        {chips.map((chip) => {
          const isActive = chip.id === filter

          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectFilter(chip.id)}
              className={cn(
                "flex h-6 cursor-pointer items-center gap-1 rounded-full px-2.5 font-mono text-xs transition-[background-color,color,box-shadow] select-none",
                "bg-zinc-50/80 text-foreground inset-ring-1 inset-ring-border hover:bg-accent dark:bg-zinc-900/80",
                "aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:inset-ring-foreground"
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "tabular-nums",
                  isActive ? "text-background/60" : "text-muted-foreground/80"
                )}
              >
                {counts[chip.id] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      <ul>
        {visible.map((entry) => (
          <li key={entry.id} className="border-b border-line">
            {entry.node}
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="screen-line-top -mt-px flex items-center justify-center py-4">
          <Button
            className="gap-2 pr-2.5 pl-3 shadow-[inset_0_0_1px] shadow-foreground/20"
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : `Show more (${filtered.length - max})`}
            <ChevronDownIcon
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </Button>
        </div>
      )}
    </>
  )
}
