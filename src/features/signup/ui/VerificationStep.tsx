import { useFormContext } from "react-hook-form"

import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

import { type SignUpFormData } from "../validation"

interface VerificationStepProps {
  remainingSeconds: number
  showVerificationSent: boolean
  isCodeVisible: boolean
  isCodeInvalid: boolean
  isCodeExpired: boolean
  verificationButtonDisabled: boolean
  verificationButtonText: string
  isVerificationLoading?: boolean
  onVerificationClick: () => void
  onSpamGuideClick: () => void
}

export function VerificationStep({
  remainingSeconds,
  showVerificationSent,
  isCodeVisible,
  isCodeInvalid,
  isCodeExpired,
  verificationButtonDisabled,
  verificationButtonText,
  isVerificationLoading = false,
  onVerificationClick,
  onSpamGuideClick,
}: VerificationStepProps) {
  const { register, watch } = useFormContext<SignUpFormData>()
  const email = watch("email")
  const code = watch("code")

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div>
          <span className="text-body-1-medium text-teal-gray-600">이메일</span>
          <span className="text-body-1-medium text-error-600">*</span>
        </div>

        <div className="flex items-center gap-1.5">
          <InputBox {...register("email")} value={email} state="default" />
          <Button
            size={"m"}
            color={"primary"}
            variant={"weak"}
            disabled={verificationButtonDisabled}
            isLoading={isVerificationLoading}
            onClick={onVerificationClick}
          >
            {verificationButtonText}
          </Button>
        </div>

        <div className="flex h-5.5 items-center gap-1">
          {showVerificationSent && (
            <button
              type="button"
              onClick={onSpamGuideClick}
              className="flex items-center gap-1"
            >
              <CircleBang className="text-teal-gray-300 h-4 w-4" />
              <p className="text-teal-gray-300 text-body-2-medium underline">
                인증 메일을 받지 못하셨나요?
              </p>
            </button>
          )}
          {/* <>
            <CheckIcon className="text-error-500 h-4 w-4" />
            <p className="text-error-500 text-body-2-medium">
              이미 가입된 이메일 입니다
            </p>
          </> */}
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
            {...register("code")}
            type="verification"
            value={code}
            placeholder="숫자 6자리 입력"
            remainingSeconds={remainingSeconds}
            inputMode="numeric"
            maxLength={6}
            state={isCodeInvalid ? "error" : "default"}
            className="w-full"
          />

          <div className="flex h-5.5 items-center gap-1">
            {isCodeInvalid && !isCodeExpired && (
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
  )
}
