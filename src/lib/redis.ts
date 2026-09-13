import "server-only"

import Redis from "ioredis"

/**
 * Lazily-connected Redis client, shared across hot reloads and requests in
 * the same runtime. Returns `null` when `REDIS_URL` is unset so callers can
 * degrade gracefully (the Insights section simply stays hidden).
 */
const globalForRedis = globalThis as unknown as { __redis?: Redis }

export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL

  if (!url) {
    return null
  }

  if (!globalForRedis.__redis) {
    globalForRedis.__redis = new Redis(url, {
      lazyConnect: true,
      connectTimeout: 5_000,
      maxRetriesPerRequest: 2,
    })
    // Surface transport errors in the logs instead of crashing the process.
    globalForRedis.__redis.on("error", (error) => {
      console.error("[redis]", error.message)
    })
  }

  return globalForRedis.__redis
}

/** Key layout for the first-party page-view counter behind the Insights section. */
export const INSIGHTS_KEYS = {
  /** Page views on a given UTC day. */
  day: (date: string) => `insights:views:${date}`,
  /** Running total of every page view since tracking began. */
  total: "insights:views:total",
} as const
