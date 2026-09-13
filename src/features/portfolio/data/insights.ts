import "server-only"

import { unstable_cache } from "next/cache"

import { listDayKeys } from "@/lib/insights-days"
import { getRedis, INSIGHTS_KEYS } from "@/lib/redis"

type ISODateString = string

export type InsightsSummary = {
  /** Page views since first-party tracking began. */
  total_views: number
  /** Page views in the plotted 30-day window. */
  period_views: number
  /** Mean page views per day in the window. */
  daily_average: number
  /** Highest single-day view count in the window. */
  best_day: number
}

export type InsightsSeriesItem = {
  date: ISODateString
  views: number
}

const METRIC_KEYS = [
  "period_views",
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

/**
 * Views are counted first-party: `/api/insights/hit` adds one to the day's
 * bucket in Redis on every page load (days roll over at midnight in
 * `INSIGHTS_TIME_ZONE`; see `src/lib/redis.ts` for the key layout), so every
 * number here is a page-view count.
 */

/**
 * Reads every listed day in one round trip. Days without traffic have no
 * key, so they come back as zero to keep the x-axis continuous.
 */
async function fetchSeries(
  dates: ISODateString[]
): Promise<InsightsSeriesItem[] | null> {
  const redis = getRedis()
  if (!redis) {
    return null
  }

  if (dates.length === 0) {
    return []
  }

  try {
    const counts = await redis.mget(dates.map(INSIGHTS_KEYS.day))
    return dates.map((date, i) => ({
      date,
      views: Number(counts[i]) || 0,
    }))
  } catch (error) {
    console.error("[insights] failed to read series", error)
    return null
  }
}

async function fetchTotal(): Promise<number | null> {
  const redis = getRedis()
  if (!redis) {
    return null
  }

  try {
    const total = await redis.get(INSIGHTS_KEYS.total)
    return Number(total) || 0
  } catch (error) {
    console.error("[insights] failed to read total", error)
    return null
  }
}

function summarize(series: InsightsSeriesItem[]) {
  const counts = series.map((d) => d.views)
  const period_views = counts.reduce((sum, n) => sum + n, 0)

  return {
    period_views,
    daily_average: series.length > 0 ? period_views / series.length : 0,
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
  current: Omit<InsightsSummary, "total_views">,
  previous: Omit<InsightsSummary, "total_views"> | null
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
  const series: InsightsSeriesItem[] = listDayKeys(RANGE_DAYS).map(
    (date, day) => ({
      date,
      views: Math.round(18 + 12 * Math.sin(day / 3) + (day % 7 < 2 ? -6 : 4)),
    })
  )

  const current = summarize(series)

  return {
    startDate: series[0].date,
    endDate: series[series.length - 1].date,
    summary: { total_views: 4_812, ...current },
    series,
    changes: { period_views: 12.4, daily_average: 12.4, best_day: -3.2 },
  }
}

async function fetchInsights(): Promise<InsightsResponse | null> {
  // The 30 days ending today (inclusive) and the 30 before them.
  const [series, previousSeries, total] = await Promise.all([
    fetchSeries(listDayKeys(RANGE_DAYS)),
    fetchSeries(listDayKeys(RANGE_DAYS, RANGE_DAYS)),
    fetchTotal(),
  ])

  if (series === null) {
    return null
  }

  const currentSummary = summarize(series)
  const previousSummary = previousSeries ? summarize(previousSeries) : null

  return {
    startDate: series[0].date,
    endDate: series[series.length - 1].date,
    summary: {
      // Fall back to the window when the total read fails, rather than
      // showing a total smaller than the last 30 days.
      total_views: Math.max(total ?? 0, currentSummary.period_views),
      ...currentSummary,
    },
    series,
    changes: getChanges(currentSummary, previousSummary),
  }
}

const getCachedInsights = unstable_cache(fetchInsights, ["redis-insights"], {
  revalidate: 600, // 10 minutes
})

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
  if (!process.env.REDIS_URL) {
    return null
  }

  // Redis reads are cheap; in dev, always show live counts instead of a
  // 10-minute-old snapshot so a fresh hit is visible on the next reload.
  if (process.env.NODE_ENV === "development") {
    return fetchInsights()
  }

  return getCachedInsights()
}
