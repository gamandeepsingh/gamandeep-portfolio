/**
 * Lightweight analytics hook. The template shipped OpenPanel; this site has no
 * analytics provider wired up, so events are only logged in development.
 * Swap the body of `trackEvent` to forward to a provider when you add one.
 */
export type Event = {
  name: string
  properties?: Record<string, string | number | boolean | null>
}

export function trackEvent(event: Event) {
  if (process.env.NODE_ENV === "development") {
    console.log("trackEvent:", event)
  }
}
