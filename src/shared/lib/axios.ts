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

const AUTH_LOGIN_PATH = "/v1/auth/login"
const TOKEN_RENEW_PATH = "/v1/auth/token/renew"

function getRequestPathname(url: string | undefined) {
  if (!url) return null
  return new URL(url, "https://axios.local").pathname
}

function isLoginRequest(url: string | undefined) {
  const pathname = getRequestPathname(url)
  return (
    pathname === AUTH_LOGIN_PATH || pathname?.startsWith(`${AUTH_LOGIN_PATH}/`)
  )
}

function isTokenRenewRequest(url: string | undefined) {
  return getRequestPathname(url) === TOKEN_RENEW_PATH
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
  if (isTokenRenewRequest(config.url)) {
    config.headers.delete("Authorization")
    return config
  }
  const token = useAuthStore.getState().accessToken
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
  useAuthStore.getState().clear()
  const search = new URLSearchParams(
    buildLoginRedirectSearch(getCurrentReturnTo()),
  )
  window.location.href = search.size > 0 ? `/login?${search}` : "/login"
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
      isLoginRequest(originalRequest.url) ||
      isTokenRenewRequest(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      terminateAuthentication("retry_unauthorized")
      return Promise.reject(error)
    }

    const refreshToken = useAuthStore.getState().refreshToken
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
      useAuthStore.getState().setTokens({
        accessToken,
        refreshToken: newRefreshToken,
      })
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
