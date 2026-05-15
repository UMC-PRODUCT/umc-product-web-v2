import { createFileRoute, useNavigate } from "@tanstack/react-router"
import axios from "axios"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { loginWithIdPw } from "@/features/auth/api/credentials"
import { loginWithApple } from "@/features/auth/api/socialLogin"
import {
  isApplePopupCancelled,
  signInWithApple,
} from "@/features/auth/lib/appleSignIn"
import { handleLoginResponse } from "@/features/auth/lib/handleLoginResponse"
import { redirectToOAuth } from "@/features/auth/lib/oauthRedirect"
import {
  Divider,
  Input,
  LoginCircleButton,
  SmallDivider,
  UmcLogoButton,
} from "@/features/login"
import { Button } from "@/shared/ui/Button"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

export const Route = createFileRoute("/login/default")({
  component: DefaultLoginPage,
})

function DefaultLoginPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const addToast = useToastStore((s) => s.addToast)
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isKeepLoggedIn, setIsKeepLoggedIn] = useState(false)

  const [loginError, setLoginError] = useState("")

  const isDisabled = id.trim() === "" || password.trim() === ""

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

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isDisabled || isLoading) return
    setIsLoading(true)
    setLoginError("")

    try {
      const res = await loginWithIdPw({ loginId: id, password })
      localStorage.setItem("access_token", res.accessToken)
      localStorage.setItem("refresh_token", res.refreshToken)
      void navigate({ to: "/" })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
      } else {
        showToast("로그인 중 오류가 발생했습니다.", "red")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-125 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <UmcLogoButton onClick={() => navigate({ to: "/" })} />

        <div className="flex flex-col items-center gap-6.5">
          <div className="flex flex-col items-center gap-3.5">
            <form
              onSubmit={handleLogin}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex flex-col gap-3">
                <Input
                  variant={"id"}
                  placeholder={"ID"}
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value)
                    if (loginError) setLoginError("")
                  }}
                />

                <Input
                  variant={"password"}
                  placeholder={"Password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (loginError) setLoginError("")
                  }}
                />

                <div className="flex items-center gap-2">
                  <Checkbox
                    variant="primary"
                    checked={isKeepLoggedIn}
                    onChange={() => setIsKeepLoggedIn((prev) => !prev)}
                    aria-label="로그인 유지"
                  />

                  <span className="text-label-1-medium text-teal-gray-500">
                    로그인 유지
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-body-2-medium text-error-500 h-5.5 text-center">
                  {loginError}
                </p>

                <Button
                  type="submit"
                  size={"m"}
                  variant={"fill"}
                  color={"primary"}
                  disabled={isDisabled}
                  isLoading={isLoading}
                  className="w-90 rounded-[10px]"
                >
                  로그인
                </Button>
              </div>
            </form>
            <div className="flex h-7 items-center gap-3">
              {/* TODO: 아이디/비밀번호 찾기 연동 */}
              <button className="text-body-1-regular text-teal-gray-500 flex items-center justify-center px-1 py-0.5">
                아이디/비밀번호 찾기
              </button>

              <SmallDivider />

              <button
                onClick={() => navigate({ to: "/signup" })}
                className="text-body-1-regular flex items-center justify-center px-1 py-0.5 text-teal-500"
              >
                회원가입
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Divider />

            <div className="flex items-center gap-8">
              <LoginCircleButton
                social={"kakao"}
                onClick={() => redirectToOAuth("KAKAO")}
              />

              <LoginCircleButton
                social={"apple"}
                onClick={() => void handleAppleSignIn()}
              />

              <LoginCircleButton
                social={"google"}
                onClick={() => redirectToOAuth("GOOGLE")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
