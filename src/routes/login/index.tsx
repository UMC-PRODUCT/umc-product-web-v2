import { createFileRoute } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  loginWithApple,
  loginWithGoogle,
} from "@/features/auth/api/socialLogin"
import {
  isApplePopupCancelled,
  signInWithApple,
} from "@/features/auth/lib/appleSignIn"
import {
  isGooglePopupCancelled,
  signInWithGoogle,
} from "@/features/auth/lib/googleSignIn"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import { startKakaoSignIn } from "@/features/auth/lib/kakaoSignIn"
import {
  Divider,
  LoginButton,
  SmallDivider,
  UmcLogoButton,
} from "@/features/login"
import { Button } from "@/shared/ui/Button"
import { TextButton } from "@/shared/ui/button/TextButton"

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
      duration: 3000,
    })
  }

  const handleAppleSignIn = async () => {
    try {
      const { authorizationCode } = await signInWithApple()
      const res = await loginWithApple({ authorizationCode })
      const result = handleLoginResponse(res)
      if (result === "LOGIN_SUCCESS") {
        await navigate({ to: "/" })
      } else {
        await navigate({ to: "/signup/oauth" })
      }
    } catch (error) {
      if (isApplePopupCancelled(error)) return
      showToast("Apple 로그인에 실패했습니다. 다시 시도해주세요.", "red")
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { accessToken } = await signInWithGoogle()
      const res = await loginWithGoogle({ accessToken })
      const result = handleLoginResponse(res)
      if (result === "LOGIN_SUCCESS") {
        await navigate({ to: "/" })
      } else {
        await navigate({ to: "/signup/oauth" })
      }
    } catch (error) {
      if (isGooglePopupCancelled(error)) return
      showToast("Google 로그인에 실패했습니다. 다시 시도해주세요.", "red")
    }
  }

  const handleKakaoSignIn = () => {
    try {
      startKakaoSignIn()
    } catch (error) {
      console.error("[Kakao Sign-In]", error)
      showToast("Kakao 로그인에 실패했습니다. 다시 시도해주세요.", "red")
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
              onClick={() => void handleGoogleSignIn()}
            />
            <LoginButton social={"kakao"} onClick={handleKakaoSignIn} />
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

            <div className="flex h-7 items-center gap-3">
              {/* TODO: 아이디/비밀번호 찾기 연동 */}
              <TextButton className="text-body-1-regular text-teal-gray-500 flex items-center justify-center px-1 py-0.5">
                아이디/비밀번호 찾기
              </TextButton>

              <SmallDivider />

              <TextButton
                onClick={() => navigate({ to: "/signup" })}
                className="text-body-1-regular flex items-center justify-center px-1 py-0.5 text-teal-500"
              >
                회원가입
              </TextButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
