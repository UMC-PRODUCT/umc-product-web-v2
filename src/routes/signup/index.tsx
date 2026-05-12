import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

function SignUpPage() {
  const [email, setEmail] = useState("")
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [code, setCode] = useState("")
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [showVerificationSent, setShowVerificationSent] = useState(false)
  // TODO: 이메일 인증 API 연결
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEmailDuplicated, setIsEmailDuplicated] = useState(false)
  const [isCodeInvalid, setIsCodeInvalid] = useState(false)
  const [isCodeExpired, setIsCodeExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isEmailValid = email.includes("@")
  const isEmailChanged = email !== verifiedEmail
  const navigate = useNavigate({ from: Route.fullPath })

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    // TODO: 이메일 인증 API 연결
  }

  useEffect(() => {
    if (remainingSeconds <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      if (isCodeVisible && remainingSeconds === 0) {
        setIsCodeExpired(true)
      }
    }
  }, [remainingSeconds, isCodeVisible])

  const handleVerificationClick = () => {
    setVerifiedEmail(email)
    setCode("")
    setIsCodeVisible(true)
    setShowVerificationSent(true)
    setIsCodeInvalid(false)
    setIsCodeExpired(false)
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
                onChange={(e) => {
                  setEmail(e.target.value)
                  setShowVerificationSent(false)
                }}
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

            <div className="flex h-5.5 items-center gap-1">
              {showVerificationSent && (
                <>
                  <CircleBang className="text-teal-gray-300 h-4 w-4" />
                  <p className="text-teal-gray-300 text-body-2-medium underline">
                    인증 메일을 받지 못하셨나요?
                  </p>
                </>
              )}

              {isEmailDuplicated && (
                <>
                  <CheckIcon className="text-error-500 h-4 w-4" />
                  <p className="text-error-500 text-body-2-medium">
                    이미 가입된 이메일입니다.
                  </p>
                </>
              )}
            </div>
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
                onChange={(e) => {
                  setCode(e.target.value)
                  setIsCodeInvalid(false)
                }}
                placeholder="숫자 6자리 입력"
                remainingSeconds={remainingSeconds}
                inputMode="numeric"
                maxLength={6}
                state={isCodeInvalid ? "error" : "default"}
                className="w-full"
              />

              <div className="flex h-5.5 items-center gap-1">
                {isCodeInvalid && (
                  <>
                    <CircleBang className="text-error-500 h-4 w-4" />
                    <p className="text-error-500 text-body-2-medium underline">
                      인증번호가 일치하지 않아요.
                    </p>
                  </>
                )}

                {isCodeExpired && (
                  <>
                    <CircleBang className="text-error-500 h-4 w-4" />
                    <p className="text-error-500 text-body-2-medium underline">
                      인증번호 입력 시간이 지났어요.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-4">
            <Button
              size={"m"}
              color={"primary"}
              variant={"fill"}
              disabled={code.length !== 6 || isCodeInvalid || isCodeExpired}
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
