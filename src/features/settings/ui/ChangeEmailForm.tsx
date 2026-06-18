import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { changeEmail } from "@/features/auth/api/me"
import { useEmailVerification } from "@/features/auth/hooks/useEmailVerification"
import { authKeys } from "@/features/auth/hooks/useMe"
import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

// 소셜 로그인 사용자 기준으로 하드코딩
const isSocialLogin = true

interface ChangeEmailFormProps {
  onSuccess: () => void
  onBack: () => void
}

export function ChangeEmailForm({
  onSuccess,
  onBack: _,
}: ChangeEmailFormProps) {
  const {
    email: next,
    setEmail: setNext,
    code,
    setCode,
    isLoading,
    isCodeVisible,
    remainingSeconds,
    isDuplicated,
    isCodeInvalid,
    isExpired,
    isEmailValid,
    isRateLimited,
    isAttemptsExceeded,
    handleVerificationClick,
    handleResend,
    handleCodeVerify,
  } = useEmailVerification("CHANGE_EMAIL")
  const [openResendModal, setOpenResendModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const token = await handleCodeVerify()
      if (!token) return
      await changeEmail({ newEmail: next, emailVerificationToken: token })
      await queryClient.invalidateQueries({ queryKey: authKeys.me })
      addToast({
        message: "이메일이 변경되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      onSuccess()
    } catch {
      addToast({
        message: "이메일 변경에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-heading-7-semibold text-teal-gray-900">
          이메일 변경
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-8">
        {/* 새 이메일 */}
        <div className="flex w-full flex-col items-start gap-1.5">
          <div className="flex items-center gap-0.5">
            <span className="text-body-1-medium text-teal-gray-600">
              {isSocialLogin ? "연결할 이메일" : "새 이메일"}
            </span>
            <span className="text-body-1-medium text-error-500">*</span>
          </div>
          <div className="flex h-11 w-full items-start justify-between gap-1.5">
            <InputBox
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="이메일 형식의 아이디"
              state={isDuplicated ? "error" : "default"}
              className="w-full"
            />
            <Button
              variant="weak"
              color="neutral"
              size="s"
              disabled={
                !isEmailValid || isLoading || isDuplicated || isRateLimited
              }
              isLoading={isLoading}
              onClick={() => void handleVerificationClick()}
              className="h-11"
            >
              인증하기
            </Button>
          </div>
          {isDuplicated && (
            <div className="flex items-center gap-1">
              <CheckIcon className="text-error-500 h-4 w-4" />
              <p className="text-error-500 text-body-2-medium">
                이미 가입된 이메일입니다.
              </p>
            </div>
          )}
          {isCodeVisible && (
            <button
              type="button"
              onClick={() => setOpenResendModal(true)}
              className="flex items-center gap-1"
            >
              <CircleBang className="text-teal-gray-300 h-4 w-4" />
              <p className="text-teal-gray-300 text-body-2-medium underline">
                인증 메일을 받지 못하셨나요?
              </p>
            </button>
          )}
        </div>

        {/* 인증번호 */}
        {isCodeVisible && (
          <div className="flex w-full flex-col items-start gap-1.5 pb-[21px]">
            <div className="flex items-center gap-0.5">
              <span className="text-body-1-medium text-teal-gray-600">
                인증번호
              </span>
              <span className="text-body-1-medium text-error-500">*</span>
            </div>
            <InputBox
              type="verification"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="숫자 6자리 입력"
              remainingSeconds={remainingSeconds}
              inputMode="numeric"
              maxLength={6}
              state={
                isAttemptsExceeded
                  ? "disabled"
                  : isCodeInvalid
                    ? "error"
                    : "default"
              }
              className="w-full"
            />
            <div className="flex h-5.5 items-center gap-1">
              {isAttemptsExceeded && (
                <>
                  <CheckIcon className="text-error-500 h-4 w-4" />
                  <p className="text-error-500 text-body-2-medium">
                    인증번호 입력 횟수(5회)를 초과했습니다. 인증번호를 재발송해
                    주세요.
                  </p>
                </>
              )}
              {isCodeInvalid && !isExpired && !isAttemptsExceeded && (
                <>
                  <CheckIcon className="text-error-500 h-4 w-4" />
                  <p className="text-error-500 text-body-2-medium">
                    인증번호가 일치하지 않습니다.
                  </p>
                </>
              )}
              {isExpired && (
                <>
                  <CheckIcon className="text-error-500 h-4 w-4" />
                  <p className="text-error-500 text-body-2-medium">
                    인증번호 입력 시간이 지났습니다.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="fill"
        color="primary"
        size="s"
        disabled={
          !isCodeVisible ||
          code.length !== 6 ||
          isExpired ||
          isAttemptsExceeded ||
          isSubmitting
        }
        isLoading={isSubmitting}
        onClick={() => void handleSubmit()}
        className="h-11 w-full bg-teal-300 disabled:bg-teal-200"
      >
        변경하기
      </Button>

      <CtaModal
        open={openResendModal}
        variant="success"
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
        onOpenChange={setOpenResendModal}
        onCancel={() => setOpenResendModal(false)}
        onConfirm={() => {
          setOpenResendModal(false)
          void handleResend()
        }}
      />
    </div>
  )
}
