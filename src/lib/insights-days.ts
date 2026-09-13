/**
 * Day bucketing for the page-view counter. Days roll over at midnight in
 * `INSIGHTS_TIME_ZONE` rather than UTC, so "today" on the chart matches the
 * site owner's today. Shared by the hit route (writes) and the data layer
 * (reads) so both always agree on which bucket a moment belongs to.
 */
export const INSIGHTS_TIME_ZONE = "Asia/Kolkata"

const DAY_MS = 24 * 60 * 60 * 1000

// `en-CA` formats as YYYY-MM-DD, which is what the Redis keys use.
const DAY_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: INSIGHTS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** `YYYY-MM-DD` for the given moment, in the insights time zone. */
export function toDayKey(at: Date | number = Date.now()): string {
  return DAY_KEY_FORMATTER.format(at)
}

/**
 * `count` consecutive day keys ending `endOffsetDays` days before today
 * (0 = ends today, inclusive), oldest first. Steps by 24h from "now" and
 * formats each, so it's correct even across DST in zones that have it.
 */
export function listDayKeys(count: number, endOffsetDays = 0): string[] {
  const now = Date.now()
  const keys: string[] = []
  for (let i = count - 1 + endOffsetDays; i >= endOffsetDays; i--) {
    keys.push(toDayKey(now - i * DAY_MS))
  }
  return keys
}
