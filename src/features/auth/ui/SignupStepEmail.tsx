import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  completeEmailVerification,
  resendEmailVerification,
  sendEmailVerification,
} from "@/features/auth/api/emailVerification"
import {
  type EmailFormData,
  emailSchema,
  type VerificationCodeFormData,
  verificationCodeSchema,
} from "@/features/auth/model/emailVerificationSchema"
import { useSignupStore } from "@/features/auth/store/signupStore"
import { Button } from "@/shared/ui/Button"

export function SignupStepEmail() {
  const { setStep, setEmailVerificationId, setEmailVerificationToken } =
    useSignupStore()
  const addToast = useToastStore((s) => s.addToast)
  const [verificationIdNum, setVerificationIdNum] = useState<number | null>(
    null,
  )
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
  })

  const codeForm = useForm<VerificationCodeFormData>({
    resolver: zodResolver(verificationCodeSchema),
    mode: "onSubmit",
  })

  const handleSendEmail = async (data: EmailFormData) => {
    setIsSending(true)
    try {
      const res = await sendEmailVerification({ email: data.email })
      const id = Number(res.emailVerificationId)
      setVerificationIdNum(id)
      setEmailVerificationId(id)
      addToast({
        message: "인증 코드가 발송되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "이메일 발송에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleResend = async () => {
    if (verificationIdNum === null) return
    setIsResending(true)
    try {
      await resendEmailVerification({ emailVerificationId: verificationIdNum })
      addToast({
        message: "인증 코드가 재발송되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "재발송에 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyCode = async (data: VerificationCodeFormData) => {
    if (verificationIdNum === null) return
    setIsVerifying(true)
    try {
      const res = await completeEmailVerification({
        emailVerificationId: verificationIdNum,
        verificationCode: data.verificationCode,
      })
      setEmailVerificationToken(res.emailVerificationToken)
      setStep("basic-info")
    } catch {
      addToast({
        message: "인증 코드가 올바르지 않습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-heading-3-bold">이메일 인증</p>
        <p className="text-label-2-medium text-teal-gray-400">
          UMC 이메일로 인증 코드를 발송합니다.
        </p>
      </div>

      <form
        onSubmit={emailForm.handleSubmit(handleSendEmail)}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-label-2-medium">이메일</label>
          <input
            {...emailForm.register("email")}
            type="email"
            placeholder="이메일을 입력해주세요."
            disabled={verificationIdNum !== null}
            className="border-teal-gray-200 text-body-2-medium disabled:bg-teal-gray-50 w-full rounded-lg border px-4 py-3 outline-none focus:border-teal-600"
          />
          {emailForm.formState.errors.email && (
            <p className="text-label-2-medium text-red-500">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>
        {verificationIdNum === null && (
          <Button
            type="submit"
            variant="fill"
            color="primary"
            className="w-full"
            isLoading={isSending}
          >
            인증 코드 발송
          </Button>
        )}
      </form>

      {verificationIdNum !== null && (
        <form
          onSubmit={codeForm.handleSubmit(handleVerifyCode)}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-label-2-medium">인증 코드</label>
            <input
              {...codeForm.register("verificationCode")}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6자리 코드를 입력해주세요."
              className="border-teal-gray-200 text-body-2-medium w-full rounded-lg border px-4 py-3 outline-none focus:border-teal-600"
            />
            {codeForm.formState.errors.verificationCode && (
              <p className="text-label-2-medium text-red-500">
                {codeForm.formState.errors.verificationCode.message}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="weak"
              color="neutral"
              className="flex-1"
              isLoading={isResending}
              onClick={handleResend}
            >
              재발송
            </Button>
            <Button
              type="submit"
              variant="fill"
              color="primary"
              className="flex-1"
              isLoading={isVerifying}
            >
              인증 확인
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
