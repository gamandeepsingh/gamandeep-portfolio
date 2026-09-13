import "server-only"

import { unstable_cache } from "next/cache"

import { USER } from "@/features/portfolio/data/user"

type ISODateString = string

export type InsightsSummary = {
  /** Visitors since the site launched (`USER.dateCreated`). */
  total_visitors: number
  /** Visitors in the plotted 30-day window. */
  period_visitors: number
  /** Mean visitors per day in the window. */
  daily_average: number
  /** Highest single-day visitor count in the window. */
  best_day: number
}

export type InsightsSeriesItem = {
  date: ISODateString
  visitors: number
}

const METRIC_KEYS = [
  "period_visitors",
  "daily_average",
  "best_day",
] as const satisfies readonly (keyof InsightsSummary)[]

/**
 * Percent change vs the previous 30-day window. `null` when the previous
 * cycle is unavailable or was zero, since growth from zero has no meaningful
 * percentage. The all-time total has no comparison by definition.
 */
export type InsightsChanges = Record<
  (typeof METRIC_KEYS)[number],
  number | null
>

export type InsightsResponse = {
  startDate: ISODateString
  endDate: ISODateString
  summary: InsightsSummary
  series: InsightsSeriesItem[]
  changes: InsightsChanges
}

/** Days plotted on the chart; the previous cycle is the same length before it. */
const RANGE_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * GoatCounter counts *visitors* (unique visits per day) rather than raw
 * pageviews, so every number here is a visitor count.
 * https://www.goatcounter.com/help/api
 */
type GoatCounterTotal = {
  total: number
  stats: { day: string; daily: number }[]
}

type Range = { start: number; end: number }

async function fetchTotal(range: Range): Promise<GoatCounterTotal | null> {
  const code = process.env.GOATCOUNTER_CODE
  const token = process.env.GOATCOUNTER_API_TOKEN

  if (!code || !token) {
    return null
  }

  try {
    const url = new URL(`https://${code}.goatcounter.com/api/v0/stats/total`)
    // The API wants hour-aligned RFC 3339 timestamps.
    url.searchParams.set("start", toHourParam(range.start))
    url.searchParams.set("end", toHourParam(range.end))

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return null
    }

    return (await res.json()) as GoatCounterTotal
  } catch {
    return null
  }
}

function toHourParam(time: number): string {
  const date = new Date(time)
  date.setUTCMinutes(0, 0, 0)
  return date.toISOString().replace(/\.\d{3}Z$/, "Z")
}

function toDateParam(time: number): ISODateString {
  return new Date(time).toISOString().slice(0, 10)
}

/**
 * GoatCounter only returns days with traffic, so build the full range and fill
 * the gaps with zero to keep the x-axis continuous.
 */
function toSeries(
  stats: GoatCounterTotal["stats"],
  range: Range
): InsightsSeriesItem[] {
  const byDate = new Map<string, InsightsSeriesItem>()
  for (let t = range.start; t < range.end; t += DAY_MS) {
    const date = toDateParam(t)
    byDate.set(date, { date, visitors: 0 })
  }

  for (const stat of stats ?? []) {
    const item = byDate.get(stat.day.slice(0, 10))
    if (item) item.visitors = Number(stat.daily) || 0
  }

  return [...byDate.values()]
}

function summarize(series: InsightsSeriesItem[]) {
  const counts = series.map((d) => d.visitors)
  const period_visitors = counts.reduce((sum, n) => sum + n, 0)

  return {
    period_visitors,
    daily_average: series.length > 0 ? period_visitors / series.length : 0,
    best_day: counts.length > 0 ? Math.max(...counts) : 0,
  }
}

function getPercentChange(current: number, previous?: number): number | null {
  if (previous === undefined || previous === 0) {
    return null
  }

  return ((current - previous) / previous) * 100
}

function getChanges(
  current: Omit<InsightsSummary, "total_visitors">,
  previous: Omit<InsightsSummary, "total_visitors"> | null
): InsightsChanges {
  return Object.fromEntries(
    METRIC_KEYS.map((key) => [
      key,
      getPercentChange(current[key], previous?.[key]),
    ])
  ) as InsightsChanges
}

/** Local-only stand-in so the section can be developed without credentials. */
function getMockInsights(): InsightsResponse {
  const end = Date.now()
  const start = end - RANGE_DAYS * DAY_MS

  const series: InsightsSeriesItem[] = []
  for (let t = start; t < end; t += DAY_MS) {
    const day = (t - start) / DAY_MS
    series.push({
      date: toDateParam(t),
      visitors: Math.round(
        18 + 12 * Math.sin(day / 3) + (day % 7 < 2 ? -6 : 4)
      ),
    })
  }

  const current = summarize(series)

  return {
    startDate: toDateParam(start),
    endDate: toDateParam(end),
    summary: { total_visitors: 4_812, ...current },
    series,
    changes: { period_visitors: 12.4, daily_average: 12.4, best_day: -3.2 },
  }
}

const getCachedInsights = unstable_cache(
  async (): Promise<InsightsResponse | null> => {
    const end = Date.now()
    const start = end - RANGE_DAYS * DAY_MS
    const current: Range = { start, end }
    const previous: Range = { start: start - RANGE_DAYS * DAY_MS, end: start }
    const allTime: Range = { start: Date.parse(USER.dateCreated), end }

    const [currentTotal, previousTotal, allTimeTotal] = await Promise.all([
      fetchTotal(current),
      fetchTotal(previous),
      fetchTotal(allTime),
    ])

    if (currentTotal === null) {
      return null
    }

    const series = toSeries(currentTotal.stats, current)
    const currentSummary = summarize(series)
    const previousSummary = previousTotal
      ? summarize(toSeries(previousTotal.stats, previous))
      : null

    return {
      startDate: toDateParam(start),
      endDate: toDateParam(end),
      summary: {
        // Fall back to the window when the all-time query fails, rather than
        // showing a total smaller than the last 30 days.
        total_visitors: Math.max(
          allTimeTotal?.total ?? 0,
          currentSummary.period_visitors
        ),
        ...currentSummary,
      },
      series,
      changes: getChanges(currentSummary, previousSummary),
    }
  },
  ["goatcounter-insights"],
  { revalidate: 3600 } // 1 hour
)

export async function getInsights(): Promise<InsightsResponse | null> {
  // Checked outside the cache so a mock run never persists into `.next/cache`.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.INSIGHTS_MOCK === "true"
  ) {
    return getMockInsights()
  }

  // Skip the cache entirely when unconfigured, so adding keys later takes
  // effect on the next request instead of after the cache expires.
  if (!process.env.GOATCOUNTER_CODE || !process.env.GOATCOUNTER_API_TOKEN) {
    return null
  }

  return getCachedInsights()
}
