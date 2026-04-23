import { track } from "@vercel/analytics"

type AnalyticsData = Record<string, string | number | boolean | null | undefined>

const browserAnalyticsEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/browser-analytics`

export function trackEvent(
  eventName: string,
  data?: AnalyticsData
) {
  const sanitized = sanitizeEventData(data)

  try {
    track(eventName, sanitized)
  } catch {
    // Analytics should never block the UI.
  }

  void sendBrowserAnalytics({
    eventType: "event",
    eventName,
    eventData: sanitized,
  })
}

export function trackCta(
  label: string,
  data?: AnalyticsData
) {
  trackEvent("cta_click", {
    label,
    ...data,
  })
}

export function trackPageView(route: string) {
  if (typeof window === "undefined") {
    return
  }

  void sendBrowserAnalytics({
    eventType: "pageview",
    path: window.location.pathname,
    route,
    origin: window.location.origin,
    referrer: document.referrer || null,
    queryParams: window.location.search.replace(/^\?/, "") || null,
  })
}

function sanitizeEventData(data?: AnalyticsData) {
  if (!data) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value != null)
  ) as Record<string, string | number | boolean>
}

function getSessionId() {
  return getStoredId("levamen_session_id", "sessionStorage")
}

function getDeviceId() {
  return getStoredId("levamen_device_id", "localStorage")
}

function getStoredId(key: string, storageType: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const storage = window[storageType]
    const existing = storage.getItem(key)
    if (existing) {
      return existing
    }

    const next = crypto.randomUUID()
    storage.setItem(key, next)
    return next
  } catch {
    return null
  }
}

async function sendBrowserAnalytics(payload: {
  eventType: "pageview" | "event"
  eventName?: string
  eventData?: Record<string, string | number | boolean>
  path?: string
  route?: string
  origin?: string
  referrer?: string | null
  queryParams?: string | null
}) {
  if (typeof window === "undefined") {
    return
  }

  try {
    await fetch(browserAnalyticsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        ...payload,
        path: payload.path ?? window.location.pathname,
        route: payload.route ?? window.location.pathname,
        origin: payload.origin ?? window.location.origin,
        referrer: payload.referrer ?? document.referrer ?? null,
        queryParams:
          payload.queryParams ??
          (window.location.search.replace(/^\?/, "") || null),
        sessionId: getSessionId(),
        deviceId: getDeviceId(),
        timestamp: Date.now(),
      }),
    })
  } catch {
    // Analytics should never block the UI.
  }
}
