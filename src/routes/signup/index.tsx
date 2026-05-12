import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
  e.preventDefault()
}

function SignUpPage() {
  const [email, setEmail] = useState("")
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [code, setCode] = useState("")
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isEmailValid = email.includes("@")
  const isEmailChanged = email !== verifiedEmail
  const navigate = useNavigate({ from: Route.fullPath })

  useEffect(() => {
    if (remainingSeconds <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [remainingSeconds])

  const handleVerificationClick = () => {
    setVerifiedEmail(email)
    setCode("")
    setIsCodeVisible(true)
    setRemainingSeconds(600)

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    // __root.tsx의 mb-12를 해제하기 위한 -mb-12
    <section className="-mb-12 flex h-screen min-h-74 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <span className="text-heading-3-semibold text-teal-gray-900">
          회원가입
        </span>

        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex flex-col gap-1.5">
            <div>
              <span className="text-body-1-medium text-teal-gray-600">
                이메일
              </span>
              <span className="text-body-1-medium text-error-600">*</span>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <InputBox
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                state="default"
              />
              <Button
                size={"m"}
                color={"primary"}
                variant={"weak"}
                disabled={!isEmailValid || (isCodeVisible && !isEmailChanged)}
                onClick={handleVerificationClick}
              >
                인증하기
              </Button>
            </form>

            <p className="text-body-2-medium text-error-500 h-5.5">
              {/* TODO: "이미 가입된 이메일입니다." or "인증 메일을 받지 못하셨나요?" 출력 */}
            </p>
          </div>

          {isCodeVisible && (
            <div className="flex w-full flex-col gap-1.5">
              <div>
                <span className="text-body-1-medium text-teal-gray-600">
                  인증번호
                </span>
                <span className="text-body-1-medium text-error-600">*</span>
              </div>

              <InputBox
                type="verification"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="숫자 6자리 입력"
                remainingSeconds={remainingSeconds}
                inputMode="numeric"
                maxLength={6}
                className="w-full"
              />

              <p className="text-body-2-medium text-error-500 h-5.5">
                {/* TODO: "인증번호가 일치하지 않아요." or "인증번호 입력 시간이 지났어요." 출력 */}
              </p>
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-4">
            <Button
              size={"m"}
              color={"primary"}
              variant={"fill"}
              disabled={code.length !== 6}
              className="w-full"
            >
              다음
            </Button>

            <button
              onClick={() => navigate({ to: "/login" })}
              className="px-1 py-0.5"
            >
              <span className="text-body-1-regular text-teal-gray-500">
                이미 계정이 있어요
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
