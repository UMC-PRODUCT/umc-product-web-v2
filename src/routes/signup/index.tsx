import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import {
  AccountCreationStep,
  ProfileInfoStep,
  type School,
  VerificationStep,
} from "@/features/signup"
import {
  getPasswordValidationError,
  idSchema,
  nicknameSchema,
  passwordSchema,
} from "@/features/signup/validation"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

const REMAINING_SECONDS = 600 // 10분
// TODO: API 연동 후 실제 인증번호 사용
const VERIFICATION_CODE = "123456" // 임시 인증 번호

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

function SignUpPage() {
  // 이메일 상태
  const [email, setEmail] = useState("")
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [code, setCode] = useState("")
  const [isEmailChanged, setIsEmailChanged] = useState(false)

  // 인증번호 상태
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [showVerificationSent, setShowVerificationSent] = useState(false)
  const [showSpamGuideModal, setShowSpamGuideModal] = useState(false)
  const [isCodeInvalid, setIsCodeInvalid] = useState(false)
  const [isCodeExpired, setIsCodeExpired] = useState(false)
  const [hasExpiredBefore, setHasExpiredBefore] = useState(false)
  const [isVerificationRequested, setIsVerificationRequested] = useState(false)
  const [isVerificationComplete, setIsVerificationComplete] = useState(false)

  // 아이디, 비밀번호 상태
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isIdValid, setIsIdValid] = useState(false)
  const [isIdDuplicated, setIsIdDuplicated] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [hasInvalidSpecialChar, setHasInvalidSpecialChar] = useState(false)
  const [isPasswordMatch, setIsPasswordMatch] = useState(false)
  const [isAccountCreationComplete, setIsAccountCreationComplete] =
    useState(false)

  // 학교, 이름, 닉네임 상태
  const [school, setSchool] = useState<School | undefined>(undefined)
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [isNicknameValid, setIsNicknameValid] = useState(false)

  const isEmailValid = email.includes("@")

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate({ from: Route.fullPath })

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setShowVerificationSent(false)
    setIsVerificationRequested(false)
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    setIsCodeInvalid(false)
  }

  const handleIdChange = (value: string) => {
    setId(value)
    setIsIdDuplicated(false)

    const result = idSchema.safeParse(value)
    setIsIdValid(result.success)
  }

  const handleIdDuplicateCheck = () => {
    // TODO: 아이디 중복 확인 API 연동
    // API 요청 후:
    // - 사용 가능한 아이디: setIsIdDuplicated(false)
    // - 중복된 아이디: setIsIdDuplicated(true)
  }

  // Password Handlers
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

  const handleNicknameChange = (value: string) => {
    setNickname(value)

    const result = nicknameSchema.safeParse(value)
    setIsNicknameValid(result.success)
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
    setIsEmailChanged(false)
    startVerificationTimer()
  }

  const handleSpamGuideConfirm = () => {
    handleVerificationClick()
    setShowSpamGuideModal(false)
  }

  const handleCodeComplete = () => {
    // TODO: 인증번호 검증 API 연동
    // API 요청 후:
    // - 인증번호 일치: setIsVerificationComplete(true)
    // - 인증번호 불일치: setIsCodeInvalid(true)
    if (code === VERIFICATION_CODE) {
      setIsVerificationComplete(true)
    } else {
      setIsCodeInvalid(true)
    }
  }

  const handleAccountCreationComplete = () => {
    // TODO: 회원가입 정보 제출 API 연동 필요 (학교/이름/닉네임 입력 후)
    setIsAccountCreationComplete(true)
  }

  // 이메일 검증
  useEffect(() => {
    if (isCodeVisible && email !== verifiedEmail) {
      setIsEmailChanged(true)
    } else {
      setIsEmailChanged(false)
    }
  }, [email, verifiedEmail, isCodeVisible])

  // 인증번호 타이머
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

  // 각종 버튼 상태
  const verificationButtonDisabled = isVerificationRequested
    ? true
    : hasExpiredBefore || isCodeExpired
      ? false
      : !isEmailValid || (isCodeVisible && !isEmailChanged)

  const verificationButtonText =
    hasExpiredBefore || isCodeExpired ? "다시 받기" : "인증하기"

  const accountCreationNextButtonDisabled = !isVerificationComplete
    ? code.length !== 6 || isCodeInvalid || isCodeExpired
    : !isIdValid || isIdDuplicated || !isPasswordValid || !isPasswordMatch

  const profileInfoNextButtonDisabled = !school || !name || !isNicknameValid

  return (
    <>
      <section className="-mb-12 flex h-screen min-h-74 w-full min-w-90 items-center justify-center">
        <div className="flex flex-col items-center gap-10">
          <span className="text-heading-3-semibold text-teal-gray-900">
            회원가입
          </span>

          <div className="flex w-full flex-col items-center gap-8">
            {!isVerificationComplete && (
              <VerificationStep
                email={email}
                code={code}
                remainingSeconds={remainingSeconds}
                showVerificationSent={showVerificationSent}
                isCodeVisible={isCodeVisible}
                isCodeInvalid={isCodeInvalid}
                isCodeExpired={isCodeExpired}
                verificationButtonDisabled={verificationButtonDisabled}
                verificationButtonText={verificationButtonText}
                onEmailChange={handleEmailChange}
                onCodeChange={handleCodeChange}
                onVerificationClick={handleVerificationClick}
                onSpamGuideClick={() => setShowSpamGuideModal(true)}
              />
            )}

            {isVerificationComplete && !isAccountCreationComplete && (
              <AccountCreationStep
                id={id}
                password={password}
                confirmPassword={confirmPassword}
                isIdValid={isIdValid}
                isIdDuplicated={isIdDuplicated}
                isPasswordValid={isPasswordValid}
                hasInvalidSpecialChar={hasInvalidSpecialChar}
                isPasswordMatch={isPasswordMatch}
                onIdChange={handleIdChange}
                onPasswordChange={handlePasswordChange}
                onConfirmPasswordChange={handleConfirmPasswordChange}
                onIdDuplicateCheck={handleIdDuplicateCheck}
              />
            )}

            {isAccountCreationComplete && (
              <ProfileInfoStep
                school={school}
                name={name}
                nickname={nickname}
                isNicknameValid={isNicknameValid}
                onSchoolChange={setSchool}
                onNameChange={setName}
                onNicknameChange={handleNicknameChange}
              />
            )}

            <div className="flex w-full flex-col items-center gap-4">
              <Button
                size={"m"}
                color={"primary"}
                variant={"fill"}
                disabled={
                  isAccountCreationComplete
                    ? profileInfoNextButtonDisabled
                    : accountCreationNextButtonDisabled
                }
                className="w-full"
                onClick={() => {
                  if (!isVerificationComplete && code.length === 6) {
                    handleCodeComplete()
                  } else if (
                    isVerificationComplete &&
                    !isAccountCreationComplete
                  ) {
                    handleAccountCreationComplete()
                  } else if (isAccountCreationComplete) {
                    // TODO: 최종 회원가입 API 연동
                    // 이메일, 아이디, 비밀번호, 이름, 닉네임, 학교 정보를 서버로 전송
                    // API 성공 시 로그인 페이지로 이동
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

      <CtaModal
        open={showSpamGuideModal}
        title="인증 메일을 받지 못하셨나요?"
        content={
          <>
            인증 메일이 스팸 메일함으로 분류되었을 수 있습니다.
            <br />
            스팸 메일함을 먼저 확인한 뒤 다시 보내기를 눌러주세요.
          </>
        }
        cancelText="닫기"
        confirmText="다시 보내기"
        variant="success"
        overlayTone="light"
        onOpenChange={setShowSpamGuideModal}
        onCancel={() => setShowSpamGuideModal(false)}
        onConfirm={handleSpamGuideConfirm}
      />
    </>
  )
}
