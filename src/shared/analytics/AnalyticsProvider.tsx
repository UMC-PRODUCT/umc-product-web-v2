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
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return
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
    const pagePath = location.pathname
    const referrer = document.referrer
      ? document.referrer.split("?")[0]
      : undefined
    trackPageView({
      pagePath,
      pageTitle: document.title,
      previousPath: previousPathRef.current,
      referrer,
    })
    previousPathRef.current = pagePath
  }, [location.pathname])

  return null
}
