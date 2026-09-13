export function urlToName(url: string) {
  return url.replace(/(^\w+:|^)\/\//, "")
}

export function addQueryParams(
  urlString: string,
  query: Record<string, string>
): string {
  try {
    const url = new URL(urlString)

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value)
    }

    return url.toString()
  } catch {
    return urlString
  }
}

/** Absolute URL for an in-page anchor; falls back to a bare hash on the server. */
export function createHeadingUrl(id: string) {
  if (typeof window === "undefined") {
    return `#${id}`
  }

  const url = new URL(window.location.href)
  url.hash = id
  return url.toString()
}
