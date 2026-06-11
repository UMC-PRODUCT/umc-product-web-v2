import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect, useReducer, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  completeEmailVerification,
  getEmailAvailability,
  resendEmailVerification,
  sendEmailVerification,
} from "@/features/auth/api/emailVerification"
import { registerMemberByOAuth } from "@/features/auth/api/register"
import { getTerms } from "@/features/auth/api/terms"
import { useSchools } from "@/features/auth/hooks/useSchools"
import { OAUTH_VERIFICATION_TOKEN_KEY } from "@/features/auth/lib/handleLoginResponse"
import {
  ProfileInfoStep,
  TermsAgreementStep,
  VerificationStep,
} from "@/features/signup"
import {
  type OAuthSignUpFormData,
  oauthSignUpSchema,
} from "@/features/signup/validation"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type {
  RegisterMemberRequest,
  SchoolNameItem,
} from "@/features/auth/model/types"

const REMAINING_SECONDS = 600 // 10분

type SignUpState = {
  signupData: Partial<RegisterMemberRequest>
  email: {
    verifiedValue: string
    isCodeVisible: boolean
    remainingSeconds: number
    showSent: boolean
    showSpamModal: boolean
    isCodeInvalid: boolean
    isCodeExpired: boolean
    hasExpiredBefore: boolean
    isRequested: boolean
    isLoading: boolean
    isDuplicated: boolean
    verificationId: number | null
  }

  oAuthVerificationToken: string | null
  schoolList: SchoolNameItem[]
  isSignupLoading: boolean
}

type SignUpAction =
  | { type: "SET_OAUTH_TOKEN"; payload: string | null }
  | { type: "SET_SCHOOL_LIST"; payload: SchoolNameItem[] }
  | { type: "EMAIL_REQUEST_START" }
  | { type: "EMAIL_REQUEST_SUCCESS"; payload: { id: number; value: string } }
  | { type: "EMAIL_REQUEST_FAILURE"; payload: { isDuplicated: boolean } }
  | { type: "EMAIL_CODE_CHANGE"; payload: boolean }
  | { type: "EMAIL_INPUT_CHANGE" }
  | { type: "EMAIL_TICK" }
  | { type: "EMAIL_EXPIRED" }
  | { type: "EMAIL_VERIFIED"; payload: string }
  | { type: "EMAIL_SET_SPAM_MODAL"; payload: boolean }
  | { type: "SIGNUP_START" }
  | { type: "SIGNUP_FINISH" }

const initialState: SignUpState = {
  signupData: {
    termsAgreements: [],
  },
  email: {
    verifiedValue: "",
    isCodeVisible: false,
    remainingSeconds: 0,
    showSent: false,
    showSpamModal: false,
    isCodeInvalid: false,
    isCodeExpired: false,
    hasExpiredBefore: false,
    isRequested: false,
    isLoading: false,
    isDuplicated: false,
    verificationId: null,
  },

  oAuthVerificationToken: null,
  schoolList: [],
  isSignupLoading: false,
}

function signUpReducer(state: SignUpState, action: SignUpAction): SignUpState {
  switch (action.type) {
    case "SET_OAUTH_TOKEN":
      return { ...state, oAuthVerificationToken: action.payload }
    case "SET_SCHOOL_LIST":
      return { ...state, schoolList: action.payload }
    case "EMAIL_REQUEST_START":
      return { ...state, email: { ...state.email, isLoading: true } }
    case "EMAIL_REQUEST_SUCCESS":
      return {
        ...state,
        email: {
          ...state.email,
          isLoading: false,
          verificationId: action.payload.id,
          verifiedValue: action.payload.value,
          isCodeVisible: true,
          showSent: true,
          isCodeInvalid: false,
          isCodeExpired: false,
          isRequested: true,
          remainingSeconds: REMAINING_SECONDS,
        },
      }
    case "EMAIL_REQUEST_FAILURE":
      return {
        ...state,
        email: {
          ...state.email,
          isLoading: false,
          isDuplicated: action.payload.isDuplicated,
        },
      }
    case "EMAIL_CODE_CHANGE":
      return {
        ...state,
        email: { ...state.email, isCodeInvalid: action.payload },
      }
    case "EMAIL_INPUT_CHANGE":
      return {
        ...state,
        email: {
          ...state.email,
          showSent: false,
          isRequested: false,
          isDuplicated: false,
        },
      }
    case "EMAIL_TICK":
      return {
        ...state,
        email: {
          ...state.email,
          remainingSeconds: Math.max(0, state.email.remainingSeconds - 1),
        },
      }
    case "EMAIL_EXPIRED":
      return {
        ...state,
        email: {
          ...state.email,
          isCodeExpired: true,
          hasExpiredBefore: true,
          isRequested: false,
          remainingSeconds: 0,
        },
      }
    case "EMAIL_VERIFIED":
      return {
        ...state,
        signupData: {
          ...state.signupData,
          emailVerificationToken: action.payload,
        },
      }
    case "EMAIL_SET_SPAM_MODAL":
      return {
        ...state,
        email: { ...state.email, showSpamModal: action.payload },
      }
    case "SIGNUP_START":
      return { ...state, isSignupLoading: true }
    case "SIGNUP_FINISH":
      return { ...state, isSignupLoading: false }
    default:
      return state
  }
}

export const Route = createFileRoute("/signup/oauth")({
  beforeLoad: () => {
    const token = sessionStorage.getItem(OAUTH_VERIFICATION_TOKEN_KEY)
    if (!token) {
      throw redirect({ to: "/login" })
    }
  },
  component: OAuthSignupPage,
})

function OAuthSignupPage() {
  const { data: termsData, isLoading: isLoadingTerms } = useQuery({
    queryKey: ["terms"],
    queryFn: getTerms,
  })

  const terms = termsData?.terms || []

  const methods = useForm<OAuthSignUpFormData>({
    resolver: zodResolver(oauthSignUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
      school: "",
      name: "",
      nickname: "",
      termsAgreements: {},
    },
  })

  const {
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods
  const email = watch("email")
  const code = watch("code")
  const school = watch("school")
  const name = watch("name")
  const nickname = watch("nickname")

  const [state, dispatch] = useReducer(signUpReducer, initialState)
  const isEmailVerified = !!state.signupData.emailVerificationToken
  const [showTerms, setShowTerms] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const navigate = useNavigate({ from: Route.fullPath })
  const addToast = useToastStore((s) => s.addToast)

  const { schools: hookSchools, isError: isSchoolsError } = useSchools({
    nameType: "short",
  })

  // 초기 로드: OAuth 토큰
  useEffect(() => {
    const token = sessionStorage.getItem(OAUTH_VERIFICATION_TOKEN_KEY)
    dispatch({ type: "SET_OAUTH_TOKEN", payload: token })
  }, [])

  useEffect(() => {
    if (hookSchools.length > 0) {
      dispatch({ type: "SET_SCHOOL_LIST", payload: hookSchools })
    }
  }, [hookSchools])

  useEffect(() => {
    if (isSchoolsError) {
      addToast({
        message: "학교 목록을 불러오는데 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }, [isSchoolsError, addToast])

  // 타이머 정리 (언마운트 시)
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // 이메일 변경 시 사이드 이펙트
  useEffect(() => {
    dispatch({ type: "EMAIL_INPUT_CHANGE" })
  }, [email])

  // 인증번호 변경 시 사이드 이펙트
  useEffect(() => {
    dispatch({ type: "EMAIL_CODE_CHANGE", payload: false })
  }, [code])

  // 인증번호 타이머
  useEffect(() => {
    if (isEmailVerified) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (state.email.remainingSeconds <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      if (state.email.isCodeVisible && state.email.remainingSeconds === 0) {
        dispatch({ type: "EMAIL_EXPIRED" })
      }
    }
  }, [state.email.remainingSeconds, state.email.isCodeVisible, isEmailVerified])

  const startVerificationTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      dispatch({ type: "EMAIL_TICK" })
    }, 1000)
  }

  const handleVerificationClick = async () => {
    dispatch({ type: "EMAIL_REQUEST_START" })
    try {
      const availability = await getEmailAvailability({ email })
      if (!availability.available) {
        dispatch({
          type: "EMAIL_REQUEST_FAILURE",
          payload: { isDuplicated: true },
        })
        return
      }

      const res = await sendEmailVerification({
        email,
        purpose: "REGISTER",
      })
      dispatch({
        type: "EMAIL_REQUEST_SUCCESS",
        payload: { id: Number(res.emailVerificationId), value: email },
      })
      setValue("code", "")
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
      dispatch({
        type: "EMAIL_REQUEST_FAILURE",
        payload: { isDuplicated: false },
      })
    }
  }

  const handleSpamGuideConfirm = async () => {
    try {
      if (state.email.verificationId) {
        dispatch({ type: "EMAIL_REQUEST_START" })
        await resendEmailVerification({
          emailVerificationId: state.email.verificationId,
        })
        dispatch({
          type: "EMAIL_REQUEST_SUCCESS",
          payload: { id: state.email.verificationId, value: email },
        })
        setValue("code", "")
        startVerificationTimer()
        dispatch({ type: "EMAIL_SET_SPAM_MODAL", payload: false })
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
      dispatch({
        type: "EMAIL_REQUEST_FAILURE",
        payload: { isDuplicated: false },
      })
    }
  }

  const handleCodeComplete = async () => {
    try {
      if (state.email.verificationId) {
        const res = await completeEmailVerification({
          emailVerificationId: state.email.verificationId,
          verificationCode: code,
        })
        dispatch({
          type: "EMAIL_VERIFIED",
          payload: res.emailVerificationToken,
        })
      }
    } catch {
      dispatch({ type: "EMAIL_CODE_CHANGE", payload: true })
    }
  }

  const handleFinalSignup = async () => {
    const emailVerificationToken = state.signupData.emailVerificationToken
    if (!emailVerificationToken) {
      addToast({
        message: "이메일 인증이 완료되지 않았습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    const oAuthVerificationToken = state.oAuthVerificationToken
    if (!oAuthVerificationToken) {
      addToast({
        message: "소셜 로그인 정보가 유효하지 않습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    const selectedSchool = state.schoolList.find((s) => s.schoolName === school)
    if (!selectedSchool) {
      addToast({
        message: "유효한 학교를 선택해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    const termsAgreements = terms.map((term) => {
      const isAgreed = getValues("termsAgreements")?.[term.id]
      return {
        termsId: term.id,
        isAgreed: !!isAgreed,
      }
    })

    const payload: RegisterMemberRequest = {
      oAuthVerificationToken,
      name,
      nickname,
      emailVerificationToken,
      schoolId: selectedSchool.schoolId,
      termsAgreements,
    }

    dispatch({ type: "SIGNUP_START" })
    try {
      await registerMemberByOAuth(payload)

      // 세션 스토리지 정리
      sessionStorage.removeItem(OAUTH_VERIFICATION_TOKEN_KEY)
      sessionStorage.removeItem("oauth_provider")

      setIsSuccessModalOpen(true)
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
      dispatch({ type: "SIGNUP_FINISH" })
    }
  }

  // 각종 버튼 상태
  const isEmailValid = email !== "" && !errors.email

  const isEmailChanged =
    state.email.isCodeVisible && email !== state.email.verifiedValue

  const verificationButtonDisabled = state.email.isRequested
    ? true
    : state.email.hasExpiredBefore || state.email.isCodeExpired
      ? false
      : !isEmailValid || (state.email.isCodeVisible && !isEmailChanged)

  const verificationButtonText =
    state.email.hasExpiredBefore || state.email.isCodeExpired
      ? "다시 받기"
      : "인증하기"

  const isNicknameValid = nickname !== "" && !errors.nickname

  // 단계별 완료 여부 (상태 A에서 유도)

  // 현재 활성 단계 결정
  const currentStep = !isEmailVerified
    ? "EMAIL"
    : showTerms
      ? "TERMS"
      : "PROFILE"

  const nextButtonDisabled =
    currentStep === "EMAIL"
      ? code.length !== 6 ||
        state.email.isCodeInvalid ||
        state.email.isCodeExpired
      : currentStep === "PROFILE"
        ? !school || !name || !isNicknameValid
        : currentStep === "TERMS"
          ? terms
              .filter((t) => t.isMandatory)
              .some((t) => !watch("termsAgreements")?.[t.id])
          : false

  return (
    <FormProvider {...methods}>
      <section className="-mb-12 flex h-screen min-h-74 w-full min-w-90 items-center justify-center">
        <div className="flex flex-col items-center gap-10">
          <span className="text-heading-3-semibold text-teal-gray-900">
            회원가입
          </span>

          <div className="flex w-full flex-col items-center gap-8">
            {currentStep === "EMAIL" && (
              <VerificationStep
                remainingSeconds={state.email.remainingSeconds}
                showVerificationSent={state.email.showSent}
                isCodeVisible={state.email.isCodeVisible}
                isCodeInvalid={state.email.isCodeInvalid}
                isCodeExpired={state.email.isCodeExpired}
                verificationButtonDisabled={verificationButtonDisabled}
                verificationButtonText={verificationButtonText}
                isVerificationLoading={state.email.isLoading}
                isEmailDuplicated={state.email.isDuplicated}
                onVerificationClick={handleVerificationClick}
                onSpamGuideClick={() =>
                  dispatch({ type: "EMAIL_SET_SPAM_MODAL", payload: true })
                }
              />
            )}

            {currentStep === "PROFILE" && <ProfileInfoStep />}

            {currentStep === "TERMS" && (
              <TermsAgreementStep terms={terms} isLoading={isLoadingTerms} />
            )}

            <div className="flex w-full flex-col items-center gap-4">
              <Button
                size={"m"}
                color={"primary"}
                variant={"fill"}
                disabled={nextButtonDisabled}
                isLoading={state.isSignupLoading}
                className="w-full"
                onClick={() => {
                  if (currentStep === "EMAIL") {
                    void handleCodeComplete()
                  } else if (currentStep === "PROFILE") {
                    setShowTerms(true)
                  } else if (currentStep === "TERMS") {
                    void handleFinalSignup()
                  }
                }}
              >
                {currentStep === "TERMS" ? "가입하기" : "다음"}
              </Button>

              <button
                onClick={() => navigate({ to: "/login" })}
                className="px-1 py-0.5"
              >
                <span className="text-body-1-regular text-teal-gray-500">
                  {currentStep === "EMAIL"
                    ? "이미 계정이 있어요"
                    : "로그인으로"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <CtaModal
        open={state.email.showSpamModal}
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
        onOpenChange={(open) =>
          dispatch({ type: "EMAIL_SET_SPAM_MODAL", payload: open })
        }
        onCancel={() =>
          dispatch({ type: "EMAIL_SET_SPAM_MODAL", payload: false })
        }
        onConfirm={handleSpamGuideConfirm}
      />

      <CtaModal
        open={isSuccessModalOpen}
        title="가입 완료"
        content="회원가입이 완료되었습니다."
        confirmText="로그인하기"
        variant="success"
        overlayTone="light"
        onOpenChange={setIsSuccessModalOpen}
        onConfirm={() => {
          setIsSuccessModalOpen(false)
          navigate({ to: "/login" })
        }}
      />
    </FormProvider>
  )
}
