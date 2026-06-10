import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useReducer, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  completeEmailVerification,
  getEmailAvailability,
  resendEmailVerification,
  sendEmailVerification,
} from "@/features/auth/api/emailVerification"
import { registerMemberByEmail } from "@/features/auth/api/register"
import { getTerms } from "@/features/auth/api/terms"
import { useSchools } from "@/features/auth/hooks/useSchools"
import { OAUTH_VERIFICATION_TOKEN_KEY } from "@/features/auth/lib/handleLoginResponse"
import {
  AccountCreationStep,
  // PhoneVerificationStep,
  ProfileInfoStep,
  TermsAgreementStep,
  VerificationStep,
} from "@/features/signup"
import { type SignUpFormData, signUpSchema } from "@/features/signup/validation"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type {
  EmailRegisterMemberRequest,
  SchoolNameItem,
} from "@/features/auth/model/types"

const REMAINING_SECONDS = 600 // 10분

type SignUpState = {
  signupData: Partial<EmailRegisterMemberRequest> & {
    isPhoneVerified?: boolean
  }
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
  phone: {
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
  }
  oAuthVerificationToken: string | null
  schoolList: SchoolNameItem[]
  isSignupLoading: boolean
  isIdDuplicated: boolean
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
  | { type: "PHONE_REQUEST_START" }
  | { type: "PHONE_REQUEST_SUCCESS"; payload: string }
  | { type: "PHONE_REQUEST_FAILURE"; payload: { isDuplicated: boolean } }
  | { type: "PHONE_CODE_CHANGE"; payload: boolean }
  | { type: "PHONE_INPUT_CHANGE" }
  | { type: "PHONE_TICK" }
  | { type: "PHONE_EXPIRED" }
  | { type: "PHONE_VERIFIED" }
  | { type: "PHONE_SET_SPAM_MODAL"; payload: boolean }
  | { type: "SET_ID_DUPLICATED"; payload: boolean }
  | { type: "SET_PASSWORD"; payload: string }
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
  phone: {
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
  },
  oAuthVerificationToken: null,
  schoolList: [],
  isSignupLoading: false,
  isIdDuplicated: false,
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
    case "PHONE_REQUEST_START":
      return { ...state, phone: { ...state.phone, isLoading: true } }
    case "PHONE_REQUEST_SUCCESS":
      return {
        ...state,
        phone: {
          ...state.phone,
          isLoading: false,
          verifiedValue: action.payload,
          isCodeVisible: true,
          showSent: true,
          isCodeInvalid: false,
          isCodeExpired: false,
          isRequested: true,
          remainingSeconds: REMAINING_SECONDS,
        },
      }
    case "PHONE_REQUEST_FAILURE":
      return {
        ...state,
        phone: {
          ...state.phone,
          isLoading: false,
          isDuplicated: action.payload.isDuplicated,
        },
      }
    case "PHONE_CODE_CHANGE":
      return {
        ...state,
        phone: { ...state.phone, isCodeInvalid: action.payload },
      }
    case "PHONE_INPUT_CHANGE":
      return {
        ...state,
        phone: {
          ...state.phone,
          showSent: false,
          isRequested: false,
          isDuplicated: false,
        },
      }
    case "PHONE_TICK":
      return {
        ...state,
        phone: {
          ...state.phone,
          remainingSeconds: Math.max(0, state.phone.remainingSeconds - 1),
        },
      }
    case "PHONE_EXPIRED":
      return {
        ...state,
        phone: {
          ...state.phone,
          isCodeExpired: true,
          hasExpiredBefore: true,
          isRequested: false,
          remainingSeconds: 0,
        },
      }
    case "PHONE_VERIFIED":
      return {
        ...state,
        signupData: { ...state.signupData, isPhoneVerified: true },
      }
    case "PHONE_SET_SPAM_MODAL":
      return {
        ...state,
        phone: { ...state.phone, showSpamModal: action.payload },
      }
    case "SET_ID_DUPLICATED":
      return { ...state, isIdDuplicated: action.payload }
    case "SET_PASSWORD":
      return {
        ...state,
        signupData: { ...state.signupData, rawPassword: action.payload },
      }
    case "SIGNUP_START":
      return { ...state, isSignupLoading: true }
    case "SIGNUP_FINISH":
      return { ...state, isSignupLoading: false }
    default:
      return state
  }
}

export const Route = createFileRoute("/signup/")({
  component: SignUpPage,
})

function SignUpPage() {
  const { data: termsData, isLoading: isLoadingTerms } = useQuery({
    queryKey: ["terms"],
    queryFn: getTerms,
  })

  const terms = termsData?.terms || []

  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      code: "",
      phoneNumber: "",
      phoneCode: "",
      id: "",
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
    formState: { errors },
  } = methods
  const email = watch("email")
  const code = watch("code")
  const phoneNumber = watch("phoneNumber")
  const phoneCode = watch("phoneCode")
  const id = watch("id")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const school = watch("school")
  const name = watch("name")
  const nickname = watch("nickname")

  const [state, dispatch] = useReducer(signUpReducer, initialState)
  const [showTerms, setShowTerms] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phoneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
      if (phoneIntervalRef.current) clearInterval(phoneIntervalRef.current)
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

  // 전화번호 변경 시 사이드 이펙트
  useEffect(() => {
    dispatch({ type: "PHONE_INPUT_CHANGE" })
  }, [phoneNumber])

  // 전화번호 인증번호 변경 시 사이드 이펙트
  useEffect(() => {
    dispatch({ type: "PHONE_CODE_CHANGE", payload: false })
  }, [phoneCode])

  // 아이디 변경 시 사이드 이펙트
  useEffect(() => {
    dispatch({ type: "SET_ID_DUPLICATED", payload: false })
  }, [id])

  // 인증번호 타이머
  useEffect(() => {
    if (state.email.remainingSeconds <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      if (state.email.isCodeVisible && state.email.remainingSeconds === 0) {
        dispatch({ type: "EMAIL_EXPIRED" })
      }
    }
  }, [state.email.remainingSeconds, state.email.isCodeVisible])

  // 전화번호 인증번호 타이머
  useEffect(() => {
    if (state.phone.remainingSeconds <= 0 && phoneIntervalRef.current) {
      clearInterval(phoneIntervalRef.current)
      phoneIntervalRef.current = null
      if (state.phone.isCodeVisible && state.phone.remainingSeconds === 0) {
        dispatch({ type: "PHONE_EXPIRED" })
      }
    }
  }, [state.phone.remainingSeconds, state.phone.isCodeVisible])

  const startVerificationTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      dispatch({ type: "EMAIL_TICK" })
    }, 1000)
  }

  // const startPhoneVerificationTimer = () => {
  //   if (phoneIntervalRef.current) clearInterval(phoneIntervalRef.current)
  //   phoneIntervalRef.current = setInterval(() => {
  //     dispatch({ type: "PHONE_TICK" })
  //   }, 1000)
  // }

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

  // const handlePhoneVerificationClick = async () => {
  //   dispatch({ type: "PHONE_REQUEST_START" })
  //   try {
  //     // TODO: 전화번호 인증번호 발송 API 연동 필요
  //     dispatch({ type: "PHONE_REQUEST_SUCCESS", payload: phoneNumber })
  //     setValue("phoneCode", "")
  //     startPhoneVerificationTimer()
  //   } catch (err) {
  //     const message =
  //       err instanceof Error ? err.message : "인증 문자 발송에 실패했습니다."
  //     addToast({
  //       message,
  //       color: "red",
  //       variant: "deep",
  //       type: "default",
  //       duration: 3000,
  //     })
  //     dispatch({
  //       type: "PHONE_REQUEST_FAILURE",
  //       payload: { isDuplicated: false },
  //     })
  //   }
  // }

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

  // const handlePhoneSpamGuideConfirm = async () => {
  //   // TODO: 전화번호 인증번호 재발송 API 연동 필요
  //   void handlePhoneVerificationClick()
  //   dispatch({ type: "PHONE_SET_SPAM_MODAL", payload: false })
  // }

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

  // const handlePhoneCodeComplete = async () => {
  //   try {
  //     // TODO: 전화번호 인증 완료 API 연동 필요
  //     dispatch({ type: "PHONE_VERIFIED" })
  //   } catch {
  //     dispatch({ type: "PHONE_CODE_CHANGE", payload: true })
  //   }
  // }

  const handleAccountCreationComplete = () => {
    dispatch({ type: "SET_PASSWORD", payload: password })
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
      const isAgreed = watch("termsAgreements")?.[term.id]
      return {
        termsId: term.id,
        isAgreed: !!isAgreed,
      }
    })

    const payload: EmailRegisterMemberRequest = {
      rawPassword: password,
      name,
      nickname,
      emailVerificationToken,
      schoolId: selectedSchool.schoolId,
      termsAgreements,
    }

    dispatch({ type: "SIGNUP_START" })
    try {
      await registerMemberByEmail(payload)
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

  // const handleIdDuplicateCheck = () => {
  //   // TODO: 아이디 중복 확인 API 연동
  // }

  // 각종 버튼 상태
  const isEmailValid = email !== "" && !errors.email
  // const isPhoneValid = phoneNumber !== "" && !errors.phoneNumber

  const isEmailChanged =
    state.email.isCodeVisible && email !== state.email.verifiedValue
  // const isPhoneChanged =
  //   state.phone.isCodeVisible && phoneNumber !== state.phone.verifiedValue

  const verificationButtonDisabled = state.email.isRequested
    ? true
    : state.email.hasExpiredBefore || state.email.isCodeExpired
      ? false
      : !isEmailValid || (state.email.isCodeVisible && !isEmailChanged)

  const verificationButtonText =
    state.email.hasExpiredBefore || state.email.isCodeExpired
      ? "다시 받기"
      : "인증하기"

  // const phoneVerificationButtonDisabled = state.phone.isRequested
  //   ? true
  //   : state.phone.hasExpiredBefore || state.phone.isCodeExpired
  //     ? false
  //     : !isPhoneValid || (state.phone.isCodeVisible && !isPhoneChanged)

  // const phoneVerificationButtonText =
  //   state.phone.hasExpiredBefore || state.phone.isCodeExpired
  //     ? "다시 받기"
  //     : "인증하기"

  const isPasswordValid = password !== "" && !errors.password
  const isPasswordMatch = password !== "" && password === confirmPassword

  const isNicknameValid = nickname !== "" && !errors.nickname

  // 단계별 완료 여부 (상태 A에서 유도)
  const isEmailVerified = !!state.signupData.emailVerificationToken
  const isAccountCreated =
    !!state.oAuthVerificationToken || !!state.signupData.rawPassword
  // const isPhoneVerified = !!state.signupData.isPhoneVerified

  // 현재 활성 단계 결정
  const currentStep = !isEmailVerified
    ? "EMAIL"
    : !isAccountCreated
      ? "PASSWORD"
      : showTerms
        ? "TERMS"
        : "PROFILE"
  // : !isPhoneVerified
  //   ? "PHONE"
  //   : "PROFILE"

  const nextButtonDisabled =
    currentStep === "EMAIL"
      ? code.length !== 6 ||
        state.email.isCodeInvalid ||
        state.email.isCodeExpired
      : currentStep === "PASSWORD"
        ? !isPasswordValid || !isPasswordMatch
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

            {currentStep === "PASSWORD" && <AccountCreationStep />}

            {/* {currentStep === "PHONE" && (
              <PhoneVerificationStep
                remainingSeconds={state.phone.remainingSeconds}
                showVerificationSent={state.phone.showSent}
                isCodeVisible={state.phone.isCodeVisible}
                isCodeInvalid={state.phone.isCodeInvalid}
                isCodeExpired={state.phone.isCodeExpired}
                verificationButtonDisabled={phoneVerificationButtonDisabled}
                verificationButtonText={phoneVerificationButtonText}
                isVerificationLoading={state.phone.isLoading}
                isPhoneDuplicated={state.phone.isDuplicated}
                onVerificationClick={handlePhoneVerificationClick}
                onSpamGuideClick={() =>
                  dispatch({ type: "PHONE_SET_SPAM_MODAL", payload: true })
                }
              />
            )} */}

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
                  } else if (currentStep === "PASSWORD") {
                    handleAccountCreationComplete()
                    // } else if (currentStep === "PHONE") {
                    //   void handlePhoneCodeComplete()
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

      {/* <CtaModal
        open={state.phone.showSpamModal}
        title="인증 문자를 받지 못하셨나요?"
        content={
          <>
            문자 수신까지 시간이 걸릴 수 있어요.
            <br />
            잠시 기다린 뒤에도 받지 못했다면 다시 요청해 주세요.
          </>
        }
        cancelText="닫기"
        confirmText="다시 보내기"
        variant="success"
        overlayTone="light"
        onOpenChange={(open) =>
          dispatch({ type: "PHONE_SET_SPAM_MODAL", payload: open })
        }
        onCancel={() =>
          dispatch({ type: "PHONE_SET_SPAM_MODAL", payload: false })
        }
        onConfirm={handlePhoneSpamGuideConfirm}
      /> */}
    </FormProvider>
  )
}
