import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"

import type { OAuthLoginResponse } from "@/features/auth/model/types"

export const Route = createFileRoute("/oauth/callback")({
  component: OAuthCallbackPage,
})

interface JwtPayload {
  provider: OAuthLoginResponse["provider"]
}

function decodeJwtPayload<T>(token: string): T | null {
  try {
    const parts = token.split(".")
    const json = atob((parts[1] ?? "").replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

function OAuthCallbackPage() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const error = params.get("error")
    if (error) {
      const message = params.get("message") ?? "로그인에 실패했습니다."
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
      void navigate({ to: "/login" })
      return
    }

    const code = params.get("code") as OAuthLoginResponse["code"] | null
    if (!code) {
      void navigate({ to: "/login" })
      return
    }

    const success = params.get("success")
    const accessToken = params.get("accessToken") ?? undefined
    const refreshToken = params.get("refreshToken") ?? undefined
    const oAuthVerificationToken =
      params.get("oAuthVerificationToken") ?? undefined

    const payload = oAuthVerificationToken
      ? decodeJwtPayload<JwtPayload>(oAuthVerificationToken)
      : null
    const provider = payload?.provider ?? "GOOGLE"

    const res: OAuthLoginResponse = {
      provider,
      success: success === "true",
      code,
      accessToken,
      refreshToken,
      oAuthVerificationToken,
    }

    const result = handleLoginResponse(res)
    if (result === "LOGIN_SUCCESS") {
      void navigate({ to: "/" })
    } else {
      void navigate({ to: "/signup" })
    }
  }, [navigate, addToast])

  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <p className="text-body-2-medium text-teal-gray-400">로그인 처리 중...</p>
    </main>
  )
}
