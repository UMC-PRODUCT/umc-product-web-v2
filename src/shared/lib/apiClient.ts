import axios, { AxiosError } from "axios"

import { trackApiRequest } from "@/shared/analytics"

import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"

declare module "axios" {
  interface InternalAxiosRequestConfig {
    analyticsStartTime?: number
  }
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  client.interceptors.request.use((config) => {
    config.analyticsStartTime = performance.now()
    return config
  })

  client.interceptors.response.use(
    (response) => {
      trackAxiosResponse(response.config, response.status, true)
      const body = response.data as { success?: boolean; message?: string }
      if (body && typeof body === "object" && body.success === false) {
        return Promise.reject(
          new AxiosError(
            body.message ?? "요청에 실패했습니다.",
            AxiosError.ERR_BAD_RESPONSE,
            response.config,
            response.request,
            response,
          ),
        )
      }
      return response
    },
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        trackAxiosResponse(error.config, error.response?.status, false)
      }
      return Promise.reject(error)
    },
  )

  return client
}

function trackAxiosResponse(
  config: InternalAxiosRequestConfig | undefined,
  status: number | undefined,
  success: boolean,
) {
  const startTime = config?.analyticsStartTime
  if (startTime == null) return
  trackApiRequest({
    method: config?.method,
    path: config?.url,
    status,
    durationMs: performance.now() - startTime,
    success,
  })
}
