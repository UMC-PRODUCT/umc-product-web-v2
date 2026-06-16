import axios, { AxiosError } from "axios"

import {
  buildLoginRedirectSearch,
  getCurrentReturnTo,
} from "@/features/auth/lib/loginRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"
import {
  getCurrentPagePath,
  trackApiRequest,
  trackEvent,
} from "@/shared/analytics"

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
  const token = useAuthStore.getState().accessToken
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

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) {
      trackEvent("auth_token_refresh_error", {
        reason: "missing_refresh_token",
        page_path: getCurrentPagePath(),
      })
      useAuthStore.getState().clear()
      const search = new URLSearchParams(
        buildLoginRedirectSearch(getCurrentReturnTo()),
      )
      window.location.href = search.size > 0 ? `/login?${search}` : "/login"
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
      useAuthStore.getState().setTokens({
        accessToken,
        refreshToken: newRefreshToken,
      })
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
      useAuthStore.getState().clear()
      const search = new URLSearchParams(
        buildLoginRedirectSearch(getCurrentReturnTo()),
      )
      window.location.href = search.size > 0 ? `/login?${search}` : "/login"
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
