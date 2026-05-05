import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Divider, Input, LoginCircleButton } from "@/features/login"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { Button } from "@/shared/ui/Button"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

export const Route = createFileRoute("/login/default")({
  component: DefaultLoginPage,
})

function DefaultLoginPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isKeepLoggedIn, setIsKeepLoggedIn] = useState(false)

  const isDisabled = id.trim() === "" && password.trim() === ""

  const handleLogin = () => {
    if (isDisabled || isLoading) return
    setIsLoading(true)

    // 임시 로그인 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
      navigate({ to: "/" })
    }, 1000)
  }
  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-125 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex flex-col items-center gap-4.5"
        >
          <UmcLogo className="h-12.5" />

          <p className="text-label-2-medium text-teal-gray-900 h-5">
            UNIVERSITY MAKEUS CHALLENGE
          </p>
        </button>

        <div className="flex flex-col items-center gap-6.5">
          <div className="flex flex-col items-center gap-3.5">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col gap-3">
                <Input
                  variant={"id"}
                  placeholder={"ID"}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />

                <Input
                  variant={"password"}
                  placeholder={"Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <p className="text-body-2-medium text-error-500 h-5.5">
                  {/* TODO: 로그인 에러 메시지 출력 */}
                </p>

                <Button
                  size={"m"}
                  variant={"fill"}
                  color={"primary"}
                  disabled={isDisabled}
                  isLoading={isLoading}
                  onClick={handleLogin}
                  className="w-90 rounded-[10px]"
                >
                  로그인
                </Button>
              </div>
            </div>
            {/* TODO: 아이디/비밀번호 찾기 연동 */}
            <button className="text-body-1-regular text-teal-gray-500 flex h-7 items-center justify-center px-1 py-0.5">
              아이디/비밀번호 찾기
            </button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Divider />

            <div className="flex items-center gap-8">
              {/* TODO: 소셜 로그인 연동 */}
              <LoginCircleButton social={"kakao"} />

              <LoginCircleButton social={"apple"} />

              <LoginCircleButton social={"google"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
