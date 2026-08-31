const SAME_ORIGIN_FETCH_SITES = new Set(['same-origin', 'none'])

const hostFromUrl = (value: string | undefined): string | null => {
  if (!value) return null

  try {
    return new URL(value).host
  } catch {
    return null
  }
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/')) return

  const host = getHeader(event, 'host')
  const secFetchSite = getHeader(event, 'sec-fetch-site')

  if (secFetchSite) {
    if (SAME_ORIGIN_FETCH_SITES.has(secFetchSite)) return

    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const originHost = hostFromUrl(getHeader(event, 'origin')) ?? hostFromUrl(getHeader(event, 'referer'))

  if (originHost && originHost === host) return

  throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
})
