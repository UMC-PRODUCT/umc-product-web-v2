import axios, { AxiosError } from "axios"

import type { AxiosRequestConfig } from "axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
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

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/v1/auth/login")
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      localStorage.removeItem("access_token")
      window.location.href = "/login"
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
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", newRefreshToken)
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      drainQueue(accessToken)
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${accessToken}`,
      }
      return api(originalRequest)
    } catch (refreshError) {
      rejectQueue(refreshError)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      window.location.href = "/login"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
