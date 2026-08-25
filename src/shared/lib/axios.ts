import { isAxiosError } from "axios"

import { getCurrentPagePath, trackEvent } from "@/shared/analytics"
import { createApiClient } from "@/shared/lib/apiClient"
import { authBridge } from "@/shared/lib/authBridge"

import type { AxiosRequestConfig } from "axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

const AUTH_LOGIN_PATH = "/v1/auth/login"
const TOKEN_RENEW_PATH = "/v1/auth/token/renew"
const AUTH_EMAIL_VERIFICATION_PATH = "/v1/auth/email-verification"

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

function isEmailVerificationRequest(url: string | undefined) {
  const pathname = getRequestPathname(url)
  return (
    pathname === AUTH_EMAIL_VERIFICATION_PATH ||
    pathname?.startsWith(`${AUTH_EMAIL_VERIFICATION_PATH}/`)
  )
}

export const api = createApiClient()

api.interceptors.request.use((config) => {
  if (isTokenRenewRequest(config.url)) {
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
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) return Promise.reject(error)
    const originalRequest = error.config as
      | (AxiosRequestConfig & {
          _retry?: boolean
        })
      | undefined
    if (!originalRequest) return Promise.reject(error)

    if (
      error.response?.status !== 401 ||
      isLoginRequest(originalRequest.url) ||
      isTokenRenewRequest(originalRequest.url) ||
      isEmailVerificationRequest(originalRequest.url)
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
