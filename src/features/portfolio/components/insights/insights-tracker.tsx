"use client"

import { useEffect } from "react"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"])

/**
 * Pings the first-party hit counter once per page load. Skips local dev and
 * automated browsers so the numbers only reflect real visits.
 */
export function InsightsTracker() {
  useEffect(() => {
    if (LOCAL_HOSTS.has(window.location.hostname) || navigator.webdriver) {
      return
    }

    const url = "/api/insights/hit"

    if (navigator.sendBeacon?.(url)) {
      return
    }

    fetch(url, { method: "POST", keepalive: true }).catch(() => {})
  }, [])

  return null
}
