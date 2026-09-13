import { createHash } from "node:crypto"

import { getRedis, INSIGHTS_KEYS } from "@/lib/redis"

/** Keep the dedupe marker slightly past the UTC day so late hits still match. */
const SEEN_TTL_SECONDS = 26 * 60 * 60

const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|fetch|curl|wget|python|java\/|go-http|axios|node-fetch/i

/**
 * Counts one visitor per UTC day. The visitor id is a salted hash of IP + UA
 * that rotates daily, so nothing personally identifiable is stored and hits
 * can't be linked across days.
 */
export async function POST(request: Request) {
  const redis = getRedis()

  if (!redis) {
    return new Response(null, { status: 204 })
  }

  const ua = request.headers.get("user-agent") ?? ""
  if (!ua || BOT_UA.test(ua)) {
    return new Response(null, { status: 204 })
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  const date = new Date().toISOString().slice(0, 10)
  const visitor = createHash("sha256")
    .update(`${date}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32)

  try {
    const isNew = await redis.set(
      INSIGHTS_KEYS.seen(date, visitor),
      "1",
      "EX",
      SEEN_TTL_SECONDS,
      "NX"
    )

    if (isNew === "OK") {
      await redis
        .multi()
        .incr(INSIGHTS_KEYS.day(date))
        .incr(INSIGHTS_KEYS.total)
        .exec()
    }
  } catch (error) {
    console.error("[insights] failed to record hit", error)
  }

  return new Response(null, { status: 204 })
}
