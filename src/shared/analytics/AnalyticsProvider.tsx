import { useRouterState } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals"

import { initializeAnalytics, trackPageView, trackWebVital } from "./ga"

export function AnalyticsProvider() {
  const location = useRouterState({ select: (state) => state.location })
  const previousPathRef = useRef<string | undefined>(undefined)
  const didRegisterVitalsRef = useRef(false)

  useEffect(() => {
    initializeAnalytics()
  }, [])

  useEffect(() => {
    if (didRegisterVitalsRef.current) return
    didRegisterVitalsRef.current = true
    const report = ({
      name,
      id,
      value,
      rating,
    }: {
      name: string
      id: string
      value: number
      rating: string
    }) => trackWebVital({ name, id, value, rating })

    onCLS(report)
    onFCP(report)
    onINP(report)
    onLCP(report)
    onTTFB(report)
  }, [])

  useEffect(() => {
    const pagePath = `${location.pathname}${location.searchStr}`
    trackPageView({
      pagePath,
      pageTitle: document.title,
      previousPath: previousPathRef.current,
      referrer: document.referrer || undefined,
    })
    previousPathRef.current = pagePath
  }, [location.pathname, location.searchStr])

  return null
}
