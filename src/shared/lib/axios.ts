import axios, { AxiosError } from "axios"

import {
  getCurrentPagePath,
  trackApiRequest,
  trackEvent,
} from "@/shared/analytics"
import { authBridge } from "@/shared/lib/authBridge"

import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

declare module "axios" {
  interface InternalAxiosRequestConfig {
    analyticsStartTime?: number
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  config.analyticsStartTime = performance.now()
  if (config.url?.includes("/v1/auth/token/renew")) return config
  const token = authBridge.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function drainQueue(token: string) {
  pendingQueue.forEach(({ resolve }) => resolve(token))
  pendingQueue = []
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach(({ reject }) => reject(err))
  pendingQueue = []
}

api.interceptors.response.use(
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
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }
    trackAxiosResponse(
      originalRequest as InternalAxiosRequestConfig | undefined,
      error.response?.status,
      false,
    )

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/v1/auth/login")
    ) {
      return Promise.reject(error)
    }

    const refreshToken = authBridge.getRefreshToken()
    if (!refreshToken) {
      trackEvent("auth_token_refresh_error", {
        reason: "missing_refresh_token",
        page_path: getCurrentPagePath(),
      })
      authBridge.clear()
      authBridge.redirectToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            }
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    isRefreshing = true
    originalRequest._retry = true

    try {
      const { data } = await api.post<
        ApiResponse<{
          accessToken: string
          refreshToken: string
        }>
      >("/v1/auth/token/renew", { refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = data.result
      authBridge.setTokens({ accessToken, refreshToken: newRefreshToken })
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      drainQueue(accessToken)
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${accessToken}`,
      }
      return api(originalRequest)
    } catch (refreshError) {
      trackEvent("auth_token_refresh_error", {
        reason: "renew_failed",
        page_path: getCurrentPagePath(),
      })
      rejectQueue(refreshError)
      authBridge.clear()
      authBridge.redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

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
