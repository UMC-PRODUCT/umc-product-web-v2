import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { addMemberOAuth } from "@/features/auth/api/memberOauth"
import { loginWithKakao } from "@/features/auth/api/socialLogin"
import { MEMBER_OAUTH_QUERY_KEY } from "@/features/auth/hooks/useMemberOAuthList"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import {
  consumeKakaoLinkIntent,
  consumeKakaoState,
  getKakaoRedirectUri,
} from "@/features/auth/lib/kakaoSignIn"
import { resolveLoginSuccessPath } from "@/features/auth/lib/loginRedirect"
import { trackEvent } from "@/shared/analytics"

export const Route = createFileRoute("/oauth/kakao/callback")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: KakaoCallbackPage,
})

function KakaoCallbackPage() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const didRun = useRef(false)
  const isActiveRef = useRef(true)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true
    isActiveRef.current = true

    const showError = (
      message: string,
      reason: string,
      isLinkAttempt?: boolean,
    ) => {
      trackEvent("oauth_callback_error", {
        provider: "kakao",
        reason,
        is_link_attempt: isLinkAttempt,
      })
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      void navigate({ to: "/login" })
    }

    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")
    if (error) {
      const description = params.get("error_description") ?? error
      console.error("[Kakao Callback]", error, description)
      if (error === "access_denied") {
        const isLinkAttempt = consumeKakaoLinkIntent()
        trackEvent("oauth_callback_error", {
          provider: "kakao",
          reason: "access_denied",
          is_link_attempt: isLinkAttempt,
        })
        void navigate({ to: isLinkAttempt ? "/settings" : "/login" })
        return
      }
      showError("Kakao 로그인에 실패했습니다. 다시 시도해주세요.", error)
      return
    }

    const code = params.get("code")
    const state = params.get("state")
    if (!code) {
      showError(
        "Kakao 로그인에 실패했습니다. 다시 시도해주세요.",
        "missing_code",
      )
      return
    }
    if (!consumeKakaoState(state)) {
      console.error("[Kakao Callback] state mismatch", { state })
      showError("Kakao 로그인 검증에 실패했습니다.", "state_mismatch")
      return
    }

    const isLinkAttempt = consumeKakaoLinkIntent()

    void (async () => {
      try {
        const keepLoggedInStr = sessionStorage.getItem("kakao_keep_logged_in")
        const keepLoggedIn =
          keepLoggedInStr !== null ? keepLoggedInStr === "true" : undefined
        sessionStorage.removeItem("kakao_keep_logged_in")

        const res = await loginWithKakao({
          authorizationCode: code,
          redirectUri: getKakaoRedirectUri(),
        })
        if (!isActiveRef.current) return

        if (isLinkAttempt) {
          if (res.code === "LOGIN_SUCCESS") {
            trackEvent("oauth_callback_error", {
              provider: "kakao",
              reason: "already_linked",
              is_link_attempt: true,
            })
            addToast({
              message: "이미 다른 계정에 연결된 카카오 계정입니다.",
              color: "red",
              variant: "deep",
              type: "default",
              duration: 3000,
            })
            void navigate({ to: "/settings" })
            return
          }

          if (!res.oAuthVerificationToken) {
            trackEvent("oauth_callback_error", {
              provider: "kakao",
              reason: "missing_verification_token",
              is_link_attempt: true,
            })
            addToast({
              message: "카카오 연동에 실패했습니다. 다시 시도해주세요.",
              color: "red",
              variant: "deep",
              type: "default",
              duration: 3000,
            })
            void navigate({ to: "/settings" })
            return
          }

          await addMemberOAuth({
            oAuthVerificationToken: res.oAuthVerificationToken,
          })
          await queryClient.invalidateQueries({
            queryKey: MEMBER_OAUTH_QUERY_KEY,
          })
          addToast({
            message: "카카오 계정이 연동되었습니다.",
            color: "primary",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
          void navigate({ to: "/settings" })
          return
        }

        // 일반 로그인 플로우
        const result = handleLoginResponse(res, keepLoggedIn)
        if (result === "LOGIN_SUCCESS") {
          void navigate({ to: resolveLoginSuccessPath() })
        } else {
          void navigate({ to: "/signup/oauth" })
        }
      } catch (err) {
        if (!isActiveRef.current) return
        console.error("[Kakao Callback] failed", err)

        if (isLinkAttempt) {
          trackEvent("oauth_callback_error", {
            provider: "kakao",
            reason: "link_failed",
            is_link_attempt: true,
          })
          addToast({
            message: "카카오 연동에 실패했습니다. 다시 시도해주세요.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
          void navigate({ to: "/settings" })
          return
        }

        showError(
          "Kakao 로그인에 실패했습니다. 다시 시도해주세요.",
          "login_failed",
          false,
        )
      }
    })()

    return () => {
      isActiveRef.current = false
    }
  }, [navigate, addToast, queryClient])

  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <p className="text-body-2-medium text-teal-gray-400">로그인 처리 중...</p>
    </main>
  )
}
