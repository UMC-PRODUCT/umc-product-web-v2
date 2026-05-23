import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  completeEmailVerification,
  resendEmailVerification,
  sendEmailVerification,
} from "@/features/auth/api/emailVerification"
import {
  registerMemberByIdPw,
  registerMemberByOAuth,
} from "@/features/auth/api/register"
import { getAllSchools } from "@/features/auth/api/school"
import { OAUTH_VERIFICATION_TOKEN_KEY } from "@/features/auth/lib/handleLoginResponse"
import {
  AccountCreationStep,
  ProfileInfoStep,
  VerificationStep,
} from "@/features/signup"
import { type SignUpFormData, signUpSchema } from "@/features/signup/validation"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type { SchoolNameItem } from "@/features/auth/model/types"

const REMAINING_SECONDS = 600 // 10분

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

function SignUpPage() {
  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      code: "",
      id: "",
      password: "",
      confirmPassword: "",
      school: "",
      name: "",
      nickname: "",
    },
  })

  const {
    watch,
    setValue,
    formState: { errors },
  } = methods
  const email = watch("email")
  const code = watch("code")
  const id = watch("id")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const school = watch("school")
  const name = watch("name")
  const nickname = watch("nickname")

  // 인증 상태
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [isEmailChanged, setIsEmailChanged] = useState(false)
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [showVerificationSent, setShowVerificationSent] = useState(false)
  const [showSpamGuideModal, setShowSpamGuideModal] = useState(false)
  const [isCodeInvalid, setIsCodeInvalid] = useState(false)
  const [isCodeExpired, setIsCodeExpired] = useState(false)
  const [hasExpiredBefore, setHasExpiredBefore] = useState(false)
  const [isVerificationRequested, setIsVerificationRequested] = useState(false)
  const [isVerificationComplete, setIsVerificationComplete] = useState(false)

  // API 연동을 위한 추가 상태
  const [emailVerificationId, setEmailVerificationId] = useState<number | null>(
    null,
  )
  const [emailVerificationToken, setEmailVerificationToken] = useState("")
  const [oAuthVerificationToken, setOAuthVerificationToken] = useState<
    string | null
  >(null)
  const [schoolList, setSchoolList] = useState<SchoolNameItem[]>([])
  const [isVerificationLoading, setIsVerificationLoading] = useState(false)
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  const isOAuth = !!oAuthVerificationToken
  const addToast = useToastStore((s) => s.addToast)

  // 계정 생성 상태
  const [isIdDuplicated, setIsIdDuplicated] = useState(false)
  const [isAccountCreationComplete, setIsAccountCreationComplete] =
    useState(false)

  const isEmailValid = email !== "" && !errors.email

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate({ from: Route.fullPath })

  // 초기 로드: OAuth 토큰 및 학교 목록 가져오기
  useEffect(() => {
    const token = sessionStorage.getItem(OAUTH_VERIFICATION_TOKEN_KEY)
    setOAuthVerificationToken(token)

    const fetchSchools = async () => {
      try {
        const res = await getAllSchools()
        setSchoolList(res.schools)
      } catch {
        addToast({
          message: "학교 목록을 불러오는데 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    }
    void fetchSchools()
  }, [addToast])

  // 이메일 변경 시 사이드 이펙트
  useEffect(() => {
    setShowVerificationSent(false)
    setIsVerificationRequested(false)
  }, [email])

  // 인증번호 변경 시 사이드 이펙트
  useEffect(() => {
    setIsCodeInvalid(false)
  }, [code])

  // 아이디 변경 시 사이드 이펙트
  useEffect(() => {
    setIsIdDuplicated(false)
  }, [id])

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

  const handleVerificationClick = async () => {
    setIsVerificationLoading(true)
    try {
      const res = await sendEmailVerification({
        email,
        purpose: "REGISTER",
      })
      setEmailVerificationId(Number(res.emailVerificationId))
      setVerifiedEmail(email)
      setValue("code", "")
      setIsCodeVisible(true)
      setShowVerificationSent(true)
      setIsCodeInvalid(false)
      setIsCodeExpired(false)
      setIsVerificationRequested(true)
      setRemainingSeconds(REMAINING_SECONDS)
      setIsEmailChanged(false)
      startVerificationTimer()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "인증 메일 발송에 실패했습니다."
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsVerificationLoading(false)
    }
  }

  const handleSpamGuideConfirm = async () => {
    try {
      if (emailVerificationId) {
        await resendEmailVerification({
          emailVerificationId,
        })
        handleVerificationClick()
        setShowSpamGuideModal(false)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "인증 메일 재발송에 실패했습니다."
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const handleCodeComplete = async () => {
    try {
      if (emailVerificationId) {
        const res = await completeEmailVerification({
          emailVerificationId,
          verificationCode: code,
        })
        setEmailVerificationToken(res.emailVerificationToken)
        setIsVerificationComplete(true)
        // OAuth의 경우 계정 생성 단계를 스킵함
        if (isOAuth) {
          setIsAccountCreationComplete(true)
        }
      }
    } catch {
      setIsCodeInvalid(true)
    }
  }

  const handleAccountCreationComplete = () => {
    // TODO: 회원가입 정보 제출 API 연동 필요 (학교/이름/닉네임 입력 후)
    setIsAccountCreationComplete(true)
  }

  const handleFinalSignup = async () => {
    setIsSignupLoading(true)
    const selectedSchool = schoolList.find((s) => s.schoolName === school)
    if (!selectedSchool) {
      addToast({
        message: "유효한 학교를 선택해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      setIsSignupLoading(false)
      return
    }

    try {
      if (isOAuth) {
        await registerMemberByOAuth({
          oAuthVerificationToken: oAuthVerificationToken!,
          name,
          nickname,
          emailVerificationToken,
          schoolId: selectedSchool.schoolId,
          termsAgreements: [], // TODO: 약관 동의 기능 추가 시 연동
        })
      } else {
        await registerMemberByIdPw({
          rawPassword: password,
          name,
          nickname,
          emailVerificationToken,
          schoolId: selectedSchool.schoolId,
          termsAgreements: [], // TODO: 약관 동의 기능 추가 시 연동
        })
      }

      addToast({
        message: "회원가입이 완료되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      sessionStorage.removeItem(OAUTH_VERIFICATION_TOKEN_KEY)
      void navigate({ to: "/login" })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "회원가입에 실패했습니다."
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSignupLoading(false)
    }
  }

  // const handleIdDuplicateCheck = () => {
  //   // TODO: 아이디 중복 확인 API 연동
  // }

  // 각종 버튼 상태
  const verificationButtonDisabled = isVerificationRequested
    ? true
    : hasExpiredBefore || isCodeExpired
      ? false
      : !isEmailValid || (isCodeVisible && !isEmailChanged)

  const verificationButtonText =
    hasExpiredBefore || isCodeExpired ? "다시 받기" : "인증하기"

  const isIdValid = id !== "" && !errors.id
  const isPasswordValid = password !== "" && !errors.password
  const isPasswordMatch = password !== "" && password === confirmPassword

  const accountCreationNextButtonDisabled = !isVerificationComplete
    ? code.length !== 6 || isCodeInvalid || isCodeExpired
    : isOAuth
      ? false // OAuth는 이 단계를 스킵하므로 버튼 활성화 여부가 중요하지 않음
      : !isIdValid || isIdDuplicated || !isPasswordValid || !isPasswordMatch

  const isNicknameValid = nickname !== "" && !errors.nickname
  const profileInfoNextButtonDisabled = !school || !name || !isNicknameValid

  return (
    <FormProvider {...methods}>
      <section className="-mb-12 flex h-screen min-h-74 w-full min-w-90 items-center justify-center">
        <div className="flex flex-col items-center gap-10">
          <span className="text-heading-3-semibold text-teal-gray-900">
            회원가입
          </span>

          <div className="flex w-full flex-col items-center gap-8">
            {!isVerificationComplete && (
              <VerificationStep
                remainingSeconds={remainingSeconds}
                showVerificationSent={showVerificationSent}
                isCodeVisible={isCodeVisible}
                isCodeInvalid={isCodeInvalid}
                isCodeExpired={isCodeExpired}
                verificationButtonDisabled={verificationButtonDisabled}
                verificationButtonText={verificationButtonText}
                isVerificationLoading={isVerificationLoading}
                onVerificationClick={handleVerificationClick}
                onSpamGuideClick={() => setShowSpamGuideModal(true)}
              />
            )}

            {isVerificationComplete && !isAccountCreationComplete && (
              <AccountCreationStep
              // isIdDuplicated={isIdDuplicated}
              // onIdDuplicateCheck={handleIdDuplicateCheck}
              />
            )}

            {isAccountCreationComplete && <ProfileInfoStep />}

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
                isLoading={isSignupLoading}
                className="w-full"
                onClick={() => {
                  if (!isVerificationComplete && code.length === 6) {
                    void handleCodeComplete()
                  } else if (
                    isVerificationComplete &&
                    !isAccountCreationComplete
                  ) {
                    handleAccountCreationComplete()
                  } else if (isAccountCreationComplete) {
                    void handleFinalSignup()
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
    </FormProvider>
  )
}
