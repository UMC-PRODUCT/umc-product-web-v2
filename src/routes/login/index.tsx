import { createFileRoute } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"

import { useToastStore } from "@/components/toast/useToastStore"
import { loginWithApple } from "@/features/auth/api/socialLogin"
import {
  isApplePopupCancelled,
  signInWithApple,
} from "@/features/auth/lib/appleSignIn"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import { redirectToOAuth } from "@/features/auth/lib/oauthRedirect"
import { Divider, LoginButton, UmcLogoButton } from "@/features/login"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/login/")({
  component: SocialLoginPage,
})

function SocialLoginPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const addToast = useToastStore((s) => s.addToast)

  const showToast = (message: string, color: "primary" | "red" = "primary") => {
    addToast({
      message,
      color,
      variant: "deep",
      type: "default",
      duration: 3,
    })
  }

  const handleAppleSignIn = async () => {
    try {
      const { authorizationCode } = await signInWithApple()
      const res = await loginWithApple({ authorizationCode })
      const result = handleLoginResponse(res)
      if (result === "LOGIN_SUCCESS") {
        void navigate({ to: "/" })
      } else {
        void navigate({ to: "/" })
      }
    } catch (error) {
      if (isApplePopupCancelled(error)) return
      showToast("Apple 로그인에 실패했습니다. 다시 시도해주세요.", "red")
    }
  }

  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-125 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-16 pb-6.5">
        <UmcLogoButton onClick={() => navigate({ to: "/" })} />

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <LoginButton
              social={"apple"}
              onClick={() => void handleAppleSignIn()}
            />
            <LoginButton
              social={"google"}
              onClick={() => redirectToOAuth("GOOGLE")}
            />
            <LoginButton
              social={"kakao"}
              onClick={() => redirectToOAuth("KAKAO")}
            />
          </div>

          <Divider />

          <div className="flex flex-col items-center gap-3.5">
            <Button
              variant={"weak"}
              color={"primary"}
              className="h-12.5 w-90 rounded-[10px] px-4 py-1 text-[16px]"
              onClick={() => navigate({ to: "/login/default" })}
            >
              UMC 계정 로그인
            </Button>
            {/* TODO: 아이디/비밀번호 찾기 연동 */}
            <button className="text-body-1-regular text-teal-gray-500 flex h-7 items-center justify-center px-1 py-0.5">
              아이디/비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
