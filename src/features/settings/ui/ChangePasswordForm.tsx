import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { changePassword } from "@/features/auth/api/credentials"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

function isValidPassword(pw: string): boolean {
  if (pw.length < 8) return false
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw)
  return [hasLetter, hasNumber, hasSpecial].filter(Boolean).length >= 2
}

interface ChangePasswordFormProps {
  onSuccess: () => void
  onBack: () => void
}

export function ChangePasswordForm({
  onSuccess,
  onBack,
}: ChangePasswordFormProps) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const addToast = useToastStore((s) => s.addToast)

  const isNextValid = isValidPassword(next)
  const isConfirmMatch = confirm.length > 0 && next === confirm

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await changePassword({ currentPassword: current, newPassword: next })
      addToast({
        message: "비밀번호가 변경되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      onSuccess()
    } catch {
      addToast({
        message: "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
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
    <div className="flex w-full max-w-100 flex-col items-start gap-11">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-heading-7-semibold text-teal-gray-900">
          비밀번호 변경
        </span>

        <div className="flex w-full flex-col items-start gap-8">
          {/* 현재 비밀번호 */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <div className="flex items-center gap-0.5">
              <span className="text-body-1-medium text-teal-gray-600">
                현재 비밀번호
              </span>
              <span className="text-body-1-medium text-error-500">*</span>
            </div>
            <InputBox
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full"
            />
          </div>

          {/* 새 비밀번호 */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <div className="flex items-center gap-0.5">
              <span className="text-body-1-medium text-teal-gray-600">
                새 비밀번호
              </span>
              <span className="text-body-1-medium text-error-500">*</span>
            </div>
            <InputBox
              type="password"
              state={
                next.length > 0
                  ? isNextValid
                    ? "success"
                    : "error"
                  : "default"
              }
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="w-full"
            />
            {/* TODO: API 연결 후 서버 응답 메시지로 대체 */}
            {next.length > 0 && (
              <div className="flex items-center gap-1">
                {isNextValid ? (
                  <>
                    <CheckIcon
                      width={16}
                      height={16}
                      className="text-success-500 shrink-0"
                    />
                    <span className="text-body-3-medium text-success-500">
                      영문, 숫자, 특수문자 중 2종류 이상 포함한 8자 이상
                    </span>
                  </>
                ) : (
                  <span className="text-body-3-medium text-error-500">
                    영문, 숫자, 특수문자 중 2종류 이상 포함한 8자 이상
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="flex w-full flex-col items-start gap-1.5">
            <div className="flex items-center gap-0.5">
              <span className="text-body-1-medium text-teal-gray-600">
                새 비밀번호 확인
              </span>
              <span className="text-body-1-medium text-error-500">*</span>
            </div>
            <InputBox
              type="password"
              state={
                confirm.length > 0
                  ? isConfirmMatch
                    ? "success"
                    : "error"
                  : "default"
              }
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full"
            />
            {confirm.length > 0 && !isConfirmMatch && (
              <span className="text-body-3-medium text-error-500">
                비밀번호가 일치하지 않습니다
              </span>
            )}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="fill"
        color="primary"
        size="s"
        disabled={!current || !isNextValid || !isConfirmMatch || isSubmitting}
        isLoading={isSubmitting}
        onClick={() => void handleSubmit()}
        className="h-11 w-full bg-teal-300 disabled:bg-teal-200"
      >
        변경하기
      </Button>
      <Button
        type="button"
        variant="weak"
        color="neutral"
        size="s"
        onClick={onBack}
        className="absolute right-11 bottom-10 h-11"
      >
        이전
      </Button>
    </div>
  )
}
