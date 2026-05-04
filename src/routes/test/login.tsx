import { createFileRoute } from "@tanstack/react-router"
import { Chrome, MessageCircle } from "lucide-react"

import { useToastStore } from "@/components/toast/useToastStore"
import { loginWithApple } from "@/features/auth/api/socialLogin"
import {
  isApplePopupCancelled,
  signInWithApple,
} from "@/features/auth/lib/appleSignIn"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import { redirectToOAuth } from "@/features/auth/lib/oauthRedirect"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/test/login")({
  component: LoginPage,
})

function LoginPage() {
  const addToast = useToastStore((s) => s.addToast)

  const handleAppleSignIn = async () => {
    try {
      const { authorizationCode } = await signInWithApple()
      const res = await loginWithApple({ authorizationCode })
      handleLoginResponse(res)
    } catch (error) {
      if (isApplePopupCancelled(error)) return
      addToast({
        message: "Apple 로그인에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
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
      <div className="flex w-full max-w-90 flex-col gap-3">
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => redirectToOAuth("GOOGLE")}
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
          onClick={() => redirectToOAuth("KAKAO")}
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={20} />
            Kakao로 시작하기
          </span>
        </Button>
        <Button
          variant="weak"
          color="neutral"
          size="xl"
          className="w-full"
          onClick={() => void handleAppleSignIn()}
        >
          <span className="flex items-center gap-2">
            <AppleIcon size={20} />
            Apple로 시작하기
          </span>
        </Button>
      </div>
    </main>
  )
}

function AppleIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}
