import { AxiosError } from "axios"
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
  const hasSpecial = /[!#$&*@?]/.test(pw)
  return [hasLetter, hasNumber, hasSpecial].filter(Boolean).length >= 2
}

interface ChangePasswordFormProps {
  onSuccess: () => void
  onBack: () => void
}

export function ChangePasswordForm({
  onSuccess,
  onBack: _,
}: ChangePasswordFormProps) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const addToast = useToastStore((s) => s.addToast)

  const isSameAsCurrent = next.length > 0 && next === current
  const hasInvalidSpecial = /[^a-zA-Z0-9!#$&*@?]/.test(next)
  const isNextValid =
    isValidPassword(next) && !isSameAsCurrent && !hasInvalidSpecial
  const isConfirmMatch = next === confirm

  const [isCurrentPasswordWrong, setIsCurrentPasswordWrong] = useState(false)
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
    } catch (err) {
      const code =
        err instanceof AxiosError
          ? (err.response?.data as { code?: string })?.code
          : undefined
      if (code === "AUTHENTICATION-0022") {
        setIsCurrentPasswordWrong(true)
      } else {
        addToast({
          message: "잠시 후 다시 시도해 주세요.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
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
              state={isCurrentPasswordWrong ? "error" : "default"}
              onChange={(e) => {
                setCurrent(e.target.value)
                setIsCurrentPasswordWrong(false)
              }}
              className="w-full"
            />
            {isCurrentPasswordWrong && (
              <div className="flex items-center gap-1">
                <CheckIcon className="text-error-500 h-4 w-4 shrink-0" />
                <p className="text-body-3-medium text-error-500">
                  현재 비밀번호가 올바르지 않습니다
                </p>
              </div>
            )}
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
              <div className="flex flex-col gap-1">
                {isSameAsCurrent ? (
                  <div className="flex items-center gap-1">
                    <CheckIcon className="text-error-500 h-4 w-4 shrink-0" />
                    <p className="text-body-3-medium text-error-500">
                      새 비밀번호는 현재 비밀번호와 다르게 설정해 주세요
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <CheckIcon
                      width={16}
                      height={16}
                      className={
                        isNextValid
                          ? "text-success-500 shrink-0"
                          : "text-error-500 shrink-0"
                      }
                    />
                    <p
                      className={`text-body-3-medium ${isNextValid ? "text-success-500" : "text-error-500"}`}
                    >
                      영문, 숫자, 특수문자 중 2종류 이상 포함한 8자 이상
                    </p>
                  </div>
                )}
                {!isSameAsCurrent && hasInvalidSpecial && (
                  <div className="flex items-center gap-1">
                    <CheckIcon className="text-error-500 h-4 w-4 shrink-0" />
                    <p className="text-body-3-medium text-error-500">
                      사용 가능한 특수문자 !#$&*@?
                    </p>
                  </div>
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
              <div className="flex items-center gap-1">
                <CheckIcon className="text-error-500 h-4 w-4 shrink-0" />
                <p className="text-body-3-medium text-error-500">
                  비밀번호가 일치하지 않습니다
                </p>
              </div>
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
        className="h-11 w-full"
      >
        변경하기
      </Button>
    </div>
  )
}
