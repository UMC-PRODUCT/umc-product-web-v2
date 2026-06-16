export type AnalyticsPrimitive = string | number | boolean

export type AnalyticsEventParams = Record<
  string,
  AnalyticsPrimitive | null | undefined
>

export interface PageViewParams {
  pagePath: string
  pageTitle: string
  previousPath?: string
  referrer?: string
}

export interface ApiRequestParams {
  method?: string
  path?: string
  status?: number
  durationMs: number
  success: boolean
}

export interface WebVitalParams {
  name: string
  id: string
  value: number
  rating: string
}
