import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { loginWithKakaoCode } from "@/features/auth/api/socialLogin"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import {
  consumeKakaoState,
  getKakaoRedirectUri,
} from "@/features/auth/lib/kakaoSignIn"

export const Route = createFileRoute("/oauth/kakao/callback")({
  component: KakaoCallbackPage,
})

function KakaoCallbackPage() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const showError = (message: string) => {
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
      void navigate({ to: "/login" })
    }

    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")
    if (error) {
      const description = params.get("error_description") ?? error
      console.error("[Kakao Callback]", error, description)
      if (error === "access_denied") {
        void navigate({ to: "/login" })
        return
      }
      showError("Kakao 로그인에 실패했습니다. 다시 시도해주세요.")
      return
    }

    const code = params.get("code")
    const state = params.get("state")
    if (!code) {
      showError("Kakao 로그인에 실패했습니다. 다시 시도해주세요.")
      return
    }
    if (!consumeKakaoState(state)) {
      console.error("[Kakao Callback] state mismatch", { state })
      showError("Kakao 로그인 검증에 실패했습니다.")
      return
    }

    void (async () => {
      try {
        const res = await loginWithKakaoCode({
          authorizationCode: code,
          redirectUri: getKakaoRedirectUri(),
        })
        const result = handleLoginResponse(res)
        if (result === "LOGIN_SUCCESS") {
          void navigate({ to: "/" })
        } else {
          void navigate({ to: "/signup/oauth" })
        }
      } catch (err) {
        console.error("[Kakao Callback] login failed", err)
        showError("Kakao 로그인에 실패했습니다. 다시 시도해주세요.")
      }
    })()
  }, [navigate, addToast])

  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <p className="text-body-2-medium text-teal-gray-400">로그인 처리 중...</p>
    </main>
  )
}
