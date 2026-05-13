import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"

import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

const REMAINING_SECONDS = 3 // 10분
const VERIFICATION_CODE = "123456" // 임시 인증 번호

const idSchema = z
  .string()
  .min(5, "아이디는 5자 이상이어야 합니다")
  .max(20, "아이디는 20자 이하여야 합니다")
  .regex(/^[a-z0-9_-]*$/, "5~20자의 영문, 숫자와 특수기호(_),(-) 사용 가능")

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .max(16, "비밀번호는 16자 이하여야 합니다")
  .refine((pw) => {
    const hasLetter = /[a-zA-Z]/.test(pw)
    const hasNumber = /[0-9]/.test(pw)
    const hasSpecial = /[!#$&*@?]/.test(pw)
    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
    return typeCount >= 2
  }, "영문, 숫자, 특수문자 중 2종류 이상 포함한 8-16자")
  .refine(
    (pw) => /^[a-zA-Z0-9!#$&*@?]*$/.test(pw),
    "사용 가능한 특수문자 !#$&*@?",
  )

type ValidationState = "default" | "pending" | "valid" | "invalid"

const getValidationColor = (state: ValidationState): string => {
  const colorMap: Record<ValidationState, string> = {
    default: "text-teal-gray-500",
    pending: "text-teal-gray-500",
    valid: "text-success-600",
    invalid: "text-error-500",
  }
  return colorMap[state]
}

const getIdValidationState = (
  id: string,
  isValid: boolean,
): ValidationState => {
  if (id === "") return "default"
  return isValid ? "valid" : "invalid"
}

const getPasswordValidationState = (
  password: string,
  isValid: boolean,
  hasInvalidSpecialChar: boolean,
): ValidationState => {
  if (password === "") return "default"
  if (hasInvalidSpecialChar) return "invalid"
  return isValid ? "valid" : "invalid"
}

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

function SignUpPage() {
  const [email, setEmail] = useState("")
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [code, setCode] = useState("")
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [showVerificationSent, setShowVerificationSent] = useState(false)
  // TODO: 이메일 검사 API 연동
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEmailDuplicated, setIsEmailDuplicated] = useState(false)
  const [isCodeInvalid, setIsCodeInvalid] = useState(false)
  const [isCodeExpired, setIsCodeExpired] = useState(false)
  const [hasExpiredBefore, setHasExpiredBefore] = useState(false)
  const [isVerificationRequested, setIsVerificationRequested] = useState(false)
  const [isVerificationComplete, setIsVerificationComplete] = useState(false)
  const [isIdValid, setIsIdValid] = useState(false)
  const [isIdDuplicated, setIsIdDuplicated] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [hasInvalidSpecialChar, setHasInvalidSpecialChar] = useState(false)
  const [isPasswordMatch, setIsPasswordMatch] = useState(false)

  const isEmailValid = email.includes("@")
  const isEmailChanged = email !== verifiedEmail

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate({ from: Route.fullPath })

  const handleEmailSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleIdSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleIdChange = (value: string) => {
    setId(value)
    setIsIdDuplicated(false)

    const result = idSchema.safeParse(value)
    setIsIdValid(result.success)
  }

  const handleIdDuplicateCheck = () => {
    // TODO: 아이디 중복 확인 API 연결
    // API 성공 시 setIsIdDuplicated(false)
    // API 중복 시 setIsIdDuplicated(true)
  }

  const getPasswordValidationError = (value: string) => {
    const result = passwordSchema.safeParse(value)
    return !result.success
      ? result.error.issues.some((issue) =>
          issue.message.includes("사용 가능한 특수문자"),
        )
      : false
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)

    const hasSpecialError = getPasswordValidationError(value)
    setHasInvalidSpecialChar(hasSpecialError)

    const result = passwordSchema.safeParse(value)
    const isValid = result.success && !hasSpecialError
    setIsPasswordValid(isValid)

    if (confirmPassword) {
      setIsPasswordMatch(value === confirmPassword)
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setIsPasswordMatch(password === value)
  }

  const handleCodeComplete = () => {
    if (code === VERIFICATION_CODE) {
      setIsVerificationComplete(true)
    } else {
      setIsCodeInvalid(true)
    }
  }

  const startVerificationTimer = () => {
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

  const handleVerificationClick = () => {
    setVerifiedEmail(email)
    setCode("")
    setIsCodeVisible(true)
    setShowVerificationSent(true)
    setIsCodeInvalid(false)
    setIsCodeExpired(false)
    setIsVerificationRequested(true)
    setRemainingSeconds(REMAINING_SECONDS)
    startVerificationTimer()
  }

  useEffect(() => {
    if (remainingSeconds <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      if (isCodeVisible && remainingSeconds === 0) {
        setIsCodeExpired(true)
        setHasExpiredBefore(true)
        setIsVerificationRequested(false)
      }
    }
  }, [remainingSeconds, isCodeVisible])

  const verificationButtonDisabled = isVerificationRequested
    ? true
    : hasExpiredBefore || isCodeExpired
      ? false
      : !isEmailValid || (isCodeVisible && !isEmailChanged)

  const verificationButtonText =
    hasExpiredBefore || isCodeExpired ? "다시 받기" : "인증하기"

  const nextButtonDisabled = !isVerificationComplete
    ? code.length !== 6 || isCodeInvalid || isCodeExpired
    : !isIdValid || isIdDuplicated || !isPasswordValid || !isPasswordMatch

  const idValidationState = getIdValidationState(id, isIdValid)
  const idValidationColor = getValidationColor(idValidationState)

  const passwordValidationState = getPasswordValidationState(
    password,
    isPasswordValid,
    hasInvalidSpecialChar,
  )
  const passwordValidationColor = getValidationColor(passwordValidationState)

  return (
    <section className="-mb-12 flex h-screen min-h-74 w-full min-w-90 items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <span className="text-heading-3-semibold text-teal-gray-900">
          회원가입
        </span>

        <div className="flex w-full flex-col items-center gap-8">
          {!isVerificationComplete && (
            <>
              <div className="flex flex-col gap-1.5">
                <div>
                  <span className="text-body-1-medium text-teal-gray-600">
                    이메일
                  </span>
                  <span className="text-body-1-medium text-error-600">*</span>
                </div>

                <form
                  onSubmit={handleEmailSubmit}
                  className="flex items-center gap-1.5"
                >
                  <InputBox
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setShowVerificationSent(false)
                      setIsVerificationRequested(false)
                    }}
                    state="default"
                  />
                  <Button
                    size={"m"}
                    color={"primary"}
                    variant={"weak"}
                    disabled={verificationButtonDisabled}
                    onClick={handleVerificationClick}
                  >
                    {verificationButtonText}
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
                        <CheckIcon className="text-error-500 h-4 w-4" />
                        <p className="text-error-500 text-body-2-medium">
                          인증번호가 일치하지 않아요.
                        </p>
                      </>
                    )}

                    {isCodeExpired && (
                      <>
                        <CheckIcon className="text-error-500 h-4 w-4" />
                        <p className="text-error-500 text-body-2-medium">
                          인증번호 입력 시간이 지났어요.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {isVerificationComplete && (
            <>
              <div className="flex flex-col gap-1.5">
                <div>
                  <span className="text-body-1-medium text-teal-gray-600">
                    아이디
                  </span>
                  <span className="text-body-1-medium text-error-600">*</span>
                </div>

                <form
                  onSubmit={handleIdSubmit}
                  className="flex items-center gap-1.5"
                >
                  <InputBox
                    value={id}
                    onChange={(e) => handleIdChange(e.target.value)}
                    state={
                      isIdDuplicated || (id !== "" && !isIdValid)
                        ? "error"
                        : "default"
                    }
                    rightAdornment={<></>}
                  />
                  <Button
                    size={"m"}
                    color={"primary"}
                    variant={"weak"}
                    disabled={!isIdValid}
                    onClick={handleIdDuplicateCheck}
                  >
                    중복 확인
                  </Button>
                </form>

                <div className="flex h-5.5 items-center gap-1">
                  {!isIdDuplicated && (
                    <>
                      <CheckIcon className={`h-4 w-4 ${idValidationColor}`} />
                      <p className={`text-body-2-medium ${idValidationColor}`}>
                        5~20자의 영문, 숫자와 특수기호(_),(-) 사용 가능
                      </p>
                    </>
                  )}

                  {isIdDuplicated && (
                    <>
                      <CheckIcon className="text-error-500 h-4 w-4" />
                      <p className="text-error-500 text-body-2-medium">
                        중복된 아이디입니다.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-1.5">
                <div>
                  <span className="text-body-1-medium text-teal-gray-600">
                    비밀번호
                  </span>
                  <span className="text-body-1-medium text-error-600">*</span>
                </div>

                <InputBox
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  state={
                    password !== "" &&
                    !isPasswordValid &&
                    !hasInvalidSpecialChar
                      ? "error"
                      : "default"
                  }
                  className="w-full"
                />

                <div className="flex h-5.5 items-center gap-1">
                  <>
                    <CheckIcon
                      className={`h-4 w-4 ${passwordValidationColor}`}
                    />
                    <p
                      className={`text-body-2-medium ${passwordValidationColor}`}
                    >
                      영문, 숫자, 특수문자 중 2종류 이상 포함한 8-16자
                    </p>
                  </>

                  {hasInvalidSpecialChar && (
                    <>
                      <CheckIcon className="text-error-500 h-4 w-4" />
                      <p className="text-error-500 text-body-2-medium">
                        사용 가능한 특수문자 !#$&*@?
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-1.5">
                <div>
                  <span className="text-body-1-medium text-teal-gray-600">
                    비밀번호 확인
                  </span>
                  <span className="text-body-1-medium text-error-600">*</span>
                </div>

                <InputBox
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  state={
                    confirmPassword !== "" && !isPasswordMatch
                      ? "error"
                      : "default"
                  }
                  className="w-full"
                />

                {confirmPassword && !isPasswordMatch && (
                  <div className="flex h-5.5 items-center gap-1">
                    <CheckIcon className="text-error-500 h-4 w-4" />
                    <p className="text-error-500 text-body-2-medium">
                      비밀번호와 일치하지 않습니다.
                    </p>
                  </div>
                )}

                {confirmPassword && isPasswordMatch && (
                  <div className="flex h-5.5 items-center gap-1">
                    <CheckIcon className="text-success-600 h-4 w-4" />
                    <p className="text-success-600 text-body-2-medium">
                      비밀번호 일치
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex w-full flex-col items-center gap-4">
            <Button
              size={"m"}
              color={"primary"}
              variant={"fill"}
              disabled={nextButtonDisabled}
              className="w-full"
              onClick={() => {
                if (!isVerificationComplete && code.length === 6) {
                  handleCodeComplete()
                }
              }}
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
