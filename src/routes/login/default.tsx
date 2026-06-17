import { createFileRoute, useNavigate } from "@tanstack/react-router"
import axios from "axios"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { loginWithEmail } from "@/features/auth/api/credentials"
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
  normalizeReturnTo,
  rememberLoginReturnTo,
  resolveLoginSuccessPath,
} from "@/features/auth/lib/loginRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"
import {
  Divider,
  Input,
  LoginCircleButton,
  // SmallDivider,
  UmcLogoButton,
} from "@/features/login"
import { emailSchema } from "@/features/signup/validation"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { createMeta, SITE_URL } from "@/shared/seo"
import { Button } from "@/shared/ui/Button"
import { TextButton } from "@/shared/ui/button/TextButton"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

export const Route = createFileRoute("/login/default")({
  head: () =>
    createMeta(
      "UMC 계정 로그인 | UMC 데모데이 팀 매칭 시스템",
      "UMC 계정(이메일)으로 로그인하고 데모데이 팀 매칭을 이용하세요.",
      { canonical: `${SITE_URL}/login/default` },
    ),
  validateSearch: (search: Record<string, unknown>): { returnTo?: string } => ({
    returnTo: normalizeReturnTo(search.returnTo),
  }),
  component: DefaultLoginPage,
})

function DefaultLoginPage() {
  const { returnTo } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const addToast = useToastStore((s) => s.addToast)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isKeepLoggedIn, setIsKeepLoggedIn] = useState(false)

  const [loginError, setLoginError] = useState("")

  const isDisabled = email.trim() === "" || password.trim() === ""

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
      rememberLoginReturnTo(returnTo)
      const { authorizationCode } = await signInWithApple()
      const res = await loginWithApple({ authorizationCode })
      const result = handleLoginResponse(res, isKeepLoggedIn)
      if (result === "LOGIN_SUCCESS") {
        await navigate({ to: resolveLoginSuccessPath(returnTo) })
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
      rememberLoginReturnTo(returnTo)
      const { accessToken } = await signInWithGoogle()
      const res = await loginWithGoogle({ accessToken })
      const result = handleLoginResponse(res, isKeepLoggedIn)
      if (result === "LOGIN_SUCCESS") {
        await navigate({ to: resolveLoginSuccessPath(returnTo) })
      } else {
        await navigate({ to: "/signup/oauth" })
      }
    } catch (error) {
      if (isGooglePopupCancelled(error)) return
      showToast("Google 로그인에 실패했습니다. 다시 시도해주세요.", "red")
    }
  }

  const handleKakaoSignIn = async () => {
    try {
      sessionStorage.setItem("kakao_keep_logged_in", String(isKeepLoggedIn))
      await startKakaoSignIn(returnTo)
    } catch (error) {
      console.error("[Kakao Sign-In]", error)
      showToast("Kakao 로그인에 실패했습니다. 다시 시도해주세요.", "red")
    }
  }

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isDisabled || isLoading) return

    if (!emailSchema.safeParse(email).success) {
      setLoginError("@를 포함한 이메일 형식의 아이디를 입력해 주세요")
      return
    }

    setIsLoading(true)
    setLoginError("")

    try {
      rememberLoginReturnTo(returnTo)
      const res = await loginWithEmail({ email, password, clientType: "WEB" })
      useAuthStore.getState().setTokens(
        {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          memberId: res.memberId,
        },
        isKeepLoggedIn,
      )
      await navigate({ to: resolveLoginSuccessPath(returnTo) })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLoginError("이메일 또는 비밀번호가 올바르지 않습니다")
      } else {
        showToast("잠시 후 다시 시도해 주세요.", "red")
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
                  placeholder={"이메일"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (loginError) setLoginError("")
                  }}
                  onBlur={() => {
                    if (
                      email.trim() !== "" &&
                      !emailSchema.safeParse(email).success
                    ) {
                      setLoginError(
                        "@를 포함한 이메일 형식의 아이디를 입력해 주세요",
                      )
                    }
                  }}
                />

                <Input
                  variant={"password"}
                  placeholder={"비밀번호"}
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

              <div className="flex w-full flex-col gap-2">
                <p className="text-body-2-medium text-error-500 flex h-5.5 items-center gap-1 text-left">
                  {loginError && (
                    <>
                      <CheckIcon className="text-error-500 h-4 w-4 shrink-0" />
                      {loginError}
                    </>
                  )}
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
              {/* <TextButton className="text-body-1-regular text-teal-gray-500 flex items-center justify-center px-1 py-0.5">
                아이디/비밀번호 찾기
              </TextButton>

              <SmallDivider /> */}

              <TextButton
                onClick={() => navigate({ to: "/signup" })}
                className="text-body-1-regular flex items-center justify-center px-1 py-0.5 text-teal-500"
              >
                회원가입
              </TextButton>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Divider />

            <div className="flex items-center gap-8">
              <LoginCircleButton
                social={"kakao"}
                onClick={() => void handleKakaoSignIn()}
              />

              <LoginCircleButton
                social={"apple"}
                onClick={() => void handleAppleSignIn()}
              />

              <LoginCircleButton
                social={"google"}
                onClick={() => void handleGoogleSignIn()}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
