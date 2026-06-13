import { useEffect, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  completeEmailVerification,
  getEmailAvailability,
  sendEmailVerification,
} from "@/features/auth/api/emailVerification"

import type { EmailVerificationPurpose } from "@/features/auth/model/types"

const VERIFICATION_SECONDS = 600
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 이메일 인증 플로우를 관리하는 훅
 * 1단계: 이메일 입력 → 중복 확인 → 인증 코드 발송
 * 2단계: 인증 코드 입력 → 코드 검증 → emailVerificationToken 발급
 *
 * @param purpose 인증 목적 (REGISTER | PASSWORD_RESET 등 백엔드 정의 값)
 * @returns 이메일/코드 상태, 각 단계 핸들러, UI 조건 플래그
 */
export function useEmailVerification(purpose: EmailVerificationPurpose) {
  const [email, setEmailState] = useState("")
  const [code, setCodeState] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [verificationId, setVerificationId] = useState<number | null>(null)
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isDuplicated, setIsDuplicated] = useState(false)
  const [isCodeInvalid, setIsCodeInvalid] = useState(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  )
  const addToast = useToastStore((s) => s.addToast)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** 10분 카운트다운 타이머 시작 (재발송 시 리셋) */
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRemainingSeconds(VERIFICATION_SECONDS)
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const isEmailValid = EMAIL_REGEX.test(email)
  /** 타이머가 만료된 상태 (코드 입력 불가) */
  const isExpired = isCodeVisible && remainingSeconds === 0

  /**
   * 이메일 입력 변경 시 호출
   * 중복 에러 및 진행 중이던 인증 상태를 초기화한다
   */
  const setEmail = (value: string) => {
    setEmailState(value)
    setIsDuplicated(false)
    if (isCodeVisible) {
      setIsCodeVisible(false)
      setVerificationToken(null)
    }
  }

  /**
   * 인증 코드 입력 변경 시 호출
   * 코드 불일치 에러 및 이전 토큰을 초기화한다
   */
  const setCode = (value: string) => {
    setCodeState(value)
    setIsCodeInvalid(false)
    setVerificationToken(null)
  }

  /**
   * [인증하기] 버튼 핸들러
   * 이메일 중복 확인 후 인증 코드 발송, 타이머 시작
   */
  const handleVerificationClick = async () => {
    setIsLoading(true)
    setIsDuplicated(false)
    try {
      const availability = await getEmailAvailability({ email })
      if (!availability.available) {
        setIsDuplicated(true)
        return
      }
      const res = await sendEmailVerification({ email, purpose })
      setVerificationId(Number(res.emailVerificationId))
      setIsCodeVisible(true)
      setCodeState("")
      setVerificationToken(null)
      startTimer()
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
      setIsLoading(false)
    }
  }

  /**
   * [확인] 버튼 핸들러
   * 입력한 코드로 인증을 완료하고 emailVerificationToken을 발급받는다
   * 이후 폼에서 변경 API 호출 시 이 토큰을 사용한다
   */
  const handleCodeVerify = async () => {
    if (!verificationId) return
    setIsCodeInvalid(false)
    try {
      const res = await completeEmailVerification({
        emailVerificationId: verificationId,
        verificationCode: code,
      })
      setVerificationToken(res.emailVerificationToken)
    } catch {
      setIsCodeInvalid(true)
    }
  }

  return {
    email,
    setEmail,
    code,
    setCode,
    isLoading,
    isCodeVisible,
    remainingSeconds,
    isDuplicated,
    isCodeInvalid,
    isExpired,
    isEmailValid,
    verificationToken,
    handleVerificationClick,
    handleCodeVerify,
  }
}
