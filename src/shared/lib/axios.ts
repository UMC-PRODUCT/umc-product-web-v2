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

const TOKEN_RENEW_PATH = "/v1/auth/token/renew"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  config.analyticsStartTime = performance.now()
  if (config.url?.includes(TOKEN_RENEW_PATH)) {
    config.headers.delete("Authorization")
    return config
  }
  const token = authBridge.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let isRedirectingToLogin = false
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

function terminateAuthentication(
  reason: "missing_refresh_token" | "renew_failed" | "retry_unauthorized",
) {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  trackEvent("auth_token_refresh_error", {
    reason,
    page_path: getCurrentPagePath(),
  })
  authBridge.clear()
  authBridge.redirectToLogin()
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
      originalRequest.url?.includes("/v1/auth/login") ||
      originalRequest.url?.includes(TOKEN_RENEW_PATH)
    ) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      terminateAuthentication("retry_unauthorized")
      return Promise.reject(error)
    }

    const refreshToken = authBridge.getRefreshToken()
    if (!refreshToken) {
      terminateAuthentication("missing_refresh_token")
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest._retry = true
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
      >(TOKEN_RENEW_PATH, { refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = data.result
      authBridge.setTokens({ accessToken, refreshToken: newRefreshToken })
      drainQueue(accessToken)
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${accessToken}`,
      }
      return api(originalRequest)
    } catch (refreshError) {
      rejectQueue(refreshError)
      terminateAuthentication("renew_failed")
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
