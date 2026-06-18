import { getDeviceAnalyticsParams } from "./device"

import type {
  AnalyticsEventParams,
  ApiRequestParams,
  PageViewParams,
  WebVitalParams,
} from "./types"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_SCRIPT_ID = "ga4-script"
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
let isInitialized = false

export function initializeAnalytics() {
  if (!measurementId || typeof window === "undefined") return
  if (isInitialized) return
  isInitialized = true
  if (!window.dataLayer) window.dataLayer = []
  window.gtag =
    window.gtag ??
    function gtag() {
      window.dataLayer?.push(arguments)
    }
  window.gtag("js", new Date())
  window.gtag("config", measurementId, { send_page_view: false })

  if (document.getElementById(GA_SCRIPT_ID)) return

  const script = document.createElement("script")
  script.id = GA_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}) {
  if (!measurementId || typeof window === "undefined") return
  initializeAnalytics()
  window.gtag?.("event", name, compactParams(params))
}

export function trackPageView({
  pagePath,
  pageTitle,
  previousPath,
  referrer,
}: PageViewParams) {
  trackEvent("page_view", {
    page_path: sanitizePath(pagePath),
    page_title: pageTitle,
    previous_path: previousPath ? sanitizePath(previousPath) : undefined,
    referrer,
    ...getDeviceAnalyticsParams(),
  })
}

export function trackApiRequest({
  method,
  path,
  status,
  durationMs,
  success,
}: ApiRequestParams) {
  if (!shouldSampleApiRequest()) return
  trackEvent("api_request", {
    method: method?.toUpperCase(),
    path: path ? sanitizePath(path) : undefined,
    status,
    duration_ms: Math.round(durationMs),
    duration_bucket: getDurationBucket(durationMs),
    page_path: getCurrentPagePath(),
    success,
  })
}

export function trackWebVital({ name, id, value, rating }: WebVitalParams) {
  trackEvent("web_vital", {
    metric_name: name,
    metric_id: id,
    metric_value: value,
    metric_rating: rating,
    page_path: getCurrentPagePath(),
  })
}

export function getCurrentPagePath() {
  if (typeof window === "undefined") return ""
  return window.location.pathname
}

function compactParams(params: AnalyticsEventParams): AnalyticsEventParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  )
}

function shouldSampleApiRequest() {
  const rate = Number(import.meta.env.VITE_GA_API_SAMPLE_RATE ?? "1")
  if (!Number.isFinite(rate)) return true
  if (rate >= 1) return true
  if (rate <= 0) return false
  return Math.random() < rate
}

function sanitizePath(path: string) {
  const withoutQuery = path.split("?")[0] ?? path
  return withoutQuery
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi,
      "/:id",
    )
}

function getDurationBucket(durationMs: number) {
  if (durationMs < 300) return "under_300ms"
  if (durationMs < 1000) return "300ms_1s"
  if (durationMs < 3000) return "1s_3s"
  return "over_3s"
}
