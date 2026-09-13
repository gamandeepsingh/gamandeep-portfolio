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

/** Key layout for the first-party visitor counter behind the Insights section. */
export const INSIGHTS_KEYS = {
  /** Unique visitors on a given UTC day. */
  day: (date: string) => `insights:visitors:${date}`,
  /** Running sum of every daily unique count since tracking began. */
  total: "insights:visitors:total",
  /** Per-day dedupe marker so the same visitor only counts once a day. */
  seen: (date: string, visitor: string) => `insights:seen:${date}:${visitor}`,
} as const
