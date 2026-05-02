import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Chrome, MessageCircle } from "lucide-react"

import { useToastStore } from "@/components/toast/useToastStore"
import { loginWithGoogle } from "@/features/auth/api/socialLogin"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import { redirectToOAuth } from "@/features/auth/lib/oauthRedirect"
import {
  isGooglePopupCancelled,
  signInWithGoogle,
} from "@/features/auth/libSignIn"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const handleGoogleSignIn = async () => {
    try {
      const { accessToken } = await signInWithGoogle()
      const res = await loginWithGoogle({ accessToken })
      const result = handleLoginResponse(res)

      if (result === "LOGIN_SUCCESS") {
        navigate({ to: "/matching", search: { chapter: "Chromium", page: 1 } })
      } else {
        navigate({ to: "/signup" })
      }
    } catch (error) {
      if (isGooglePopupCancelled(error)) return
      addToast({
        message: "Google 로그인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const handleButtonClick = (provider: "GOOGLE" | "KAKAO") => {
    if (provider === "GOOGLE") {
      void handleGoogleSignIn()
      return
    }
    redirectToOAuth(provider)
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-3">
        <UmcLogo className="h-8 w-auto text-teal-600" />
        <p className="text-heading-2-bold text-teal-gray-900">
          로그인 / 회원가입
        </p>
        <p className="text-label-2-medium text-teal-gray-400">
          임시 페이지 — 디자인 확정 후 교체 예정
        </p>
      </div>
      <div className="flex w-full max-w-[360px] flex-col gap-3">
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => handleButtonClick("GOOGLE")}
        >
          <span className="flex items-center gap-2">
            <Chrome size={20} />
            Google로 시작하기
          </span>
        </Button>
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => handleButtonClick("KAKAO")}
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={20} />
            Kakao로 시작하기
          </span>
        </Button>
      </div>
    </main>
  )
}
