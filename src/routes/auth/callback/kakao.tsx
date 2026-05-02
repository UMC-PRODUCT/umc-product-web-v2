import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"

import type { OAuthLoginResponse } from "@/features/auth/model/types"

export const Route = createFileRoute("/auth/callback/kakao")({
  component: KakaoCallbackPage,
})

function KakaoCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const accessToken = params.get("accessToken")
    const refreshToken = params.get("refreshToken")
    const oAuthVerificationToken = params.get("oAuthVerificationToken")
    const code = params.get("code") as OAuthLoginResponse["code"] | null
    const success = params.get("success")

    if (!code) {
      void navigate({ to: "/login" })
      return
    }

    const res: OAuthLoginResponse = {
      provider: "KAKAO",
      success: success === "true",
      code,
      accessToken: accessToken ?? undefined,
      refreshToken: refreshToken ?? undefined,
      oAuthVerificationToken: oAuthVerificationToken ?? undefined,
    }

    const result = handleLoginResponse(res)
    if (result === "LOGIN_SUCCESS") {
      void navigate({
        to: "/matching",
        search: { chapter: "Chromium", page: 1 },
      })
    } else {
      void navigate({ to: "/signup" })
    }
  }, [navigate])

  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <p className="text-body-2-medium text-teal-gray-400">
        카카오 로그인 처리 중...
      </p>
    </main>
  )
}
