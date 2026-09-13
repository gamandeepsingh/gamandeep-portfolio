import { getRedis, INSIGHTS_KEYS } from "@/lib/redis"

const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|fetch|curl|wget|python|java\/|go-http|axios|node-fetch/i

/**
 * Counts one page view per hit — every load or refresh adds one to today's
 * bucket and to the running total. Nothing about the visitor is stored.
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

  const date = new Date().toISOString().slice(0, 10)

  try {
    await redis
      .multi()
      .incr(INSIGHTS_KEYS.day(date))
      .incr(INSIGHTS_KEYS.total)
      .exec()
  } catch (error) {
    console.error("[insights] failed to record hit", error)
  }

  return new Response(null, { status: 204 })
}
