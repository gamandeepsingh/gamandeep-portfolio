import { format } from "date-fns"

import { cn } from "@/lib/utils"
import Grid from "@/components/charts/grid"
import LineChart, { Line } from "@/components/charts/line-chart"
import { ChartTooltip } from "@/components/charts/tooltip"
import type { InsightsSeriesItem } from "@/features/portfolio/data/insights"

import { getPlottedRange } from "./plotted-range"

export function InsightsChart({
  series,
  figureNumber,
  showDateRange = false,
}: {
  series: InsightsSeriesItem[]
  /** Figures are numbered per page, so the caller decides where this one falls. */
  figureNumber: number
  /** Off by default because the panel already shows the range next to its title. */
  showDateRange?: boolean
}) {
  const range = showDateRange ? getPlottedRange(series) : null
  const dateRange = range
    ? `, ${format(range.start, "dd.MM.yyyy")} – ${format(range.end, "dd.MM.yyyy")}`
    : ""

  return (
    <figure>
      {series.length > 0 ? (
        <LineChart
          className={cn(
            "sm:aspect-3/1!",
            "[--chart-1:var(--color-zinc-900)] dark:[--chart-1:var(--color-zinc-100)]"
          )}
          data={series}
          margin={{ top: 16, right: 32, bottom: 40, left: 32 }}
        >
          <Grid horizontal />
          <Line dataKey="views" stroke="var(--chart-1)" strokeWidth={2} />
          <ChartTooltip rowLabels={{ views: "Views" }} />
        </LineChart>
      ) : (
        <div className="grid aspect-2/1 w-full place-content-center sm:aspect-3/1">
          <p className="text-muted-foreground">No insights available.</p>
        </div>
      )}

      <figcaption className="screen-line-top px-4 py-3 text-center text-sm text-balance tabular-nums">
        <span className="mr-2 tracking-wide text-muted-foreground/80">
          Fig. {figureNumber}.
        </span>
        Daily page views{dateRange}. Counted first-party, no cookies.
      </figcaption>
    </figure>
  )
}
