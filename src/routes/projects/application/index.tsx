import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { Info } from "lucide-react"
import { useState } from "react"

import {
  getOrCreateAnonymousSessionId,
  useLookupAnonymousApplication,
} from "@/features/recruiting"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"
import { emailSchema } from "@/shared/lib/validationSchemas"
import { Button } from "@/shared/ui/Button"
import { CodeInput } from "@/shared/ui/input/CodeInput"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

export const Route = createFileRoute("/projects/application/")({
  // 개인 지원 정보라 색인시키지 않는다.
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isVerified = sessionStorage.getItem("isApplicationVerified")
      if (isVerified === "true") {
        throw redirect({ to: "/projects/application/list" })
      }
    }
  },
  component: ApplicationVerifyPage,
})

function ApplicationVerifyPage() {
  const navigate = useNavigate()
  const verifyMutation = useLookupAnonymousApplication()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState(false)
  const [errorShakeKey, setErrorShakeKey] = useState(0)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const CODE_LENGTH = 6
  const isComplete = email.trim() !== "" && code.length === CODE_LENGTH

  const handleSubmit = async () => {
    if (!isComplete || emailError || codeError) return

    setEmailError(null)
    setCodeError(false)

    const isEmailValid = emailSchema.safeParse(email).success
    if (!isEmailValid) {
      setEmailError("@를 포함한 이메일 형식의 아이디를 입력해 주세요.")
      return
    }

    try {
      await verifyMutation.mutateAsync({ email, applicationKey: code })

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isApplicationVerified", "true")
        sessionStorage.setItem("anonymousEmail", email)
        sessionStorage.setItem("anonymousApplicationKey", code)
        getOrCreateAnonymousSessionId()
      }

      navigate({ to: "/projects/application/list" })
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status
        if (status === 404) {
          setEmailError("지원 내역이 없는 이메일입니다.")
          return
        }
      }
      setCodeError(true)
      setErrorShakeKey((key) => key + 1)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) setEmailError("")
  }

  const handleEmailBlur = () => {
    if (email.trim() !== "" && !emailSchema.safeParse(email).success) {
      setEmailError("@를 포함한 이메일 형식의 아이디를 입력해 주세요.")
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (codeError) setCodeError(false)
  }

  return (
    <>
      <div className="border-teal-gray-150 flex w-full max-w-106.5 flex-col gap-8 rounded-[14px] border bg-white px-8 py-8.5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900 self-stretch">
            지원 코드로 확인
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            지원서 제출 후 받은 지원 코드로 확인합니다.
          </p>
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <p className="text-body-1-medium text-teal-gray-600">
            이메일
            <span className="text-error-600 text-body-1-medium pl-[1px]">
              *
            </span>
          </p>

          <input
            className={cn(
              "shadow-inner-neutral-1 text-body-2-regular placeholder:text-teal-gray-400 h-11 w-full rounded-[12px] border px-4 py-[11.5px] transition-colors outline-none",
              emailError
                ? "border-error-400 bg-error-50/60 focus:border-error-400 focus:bg-error-50/60 text-error-500"
                : "border-teal-gray-300 text-teal-gray-700 bg-white",
            )}
            placeholder="지원서에 작성한 이메일을 입력하세요"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
          />

          {emailError && (
            <div className="text-error-500 text-body-2-medium flex items-center gap-1">
              <CheckIcon className="size-4" />
              <p>{emailError}</p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <p className="text-body-1-medium text-teal-gray-600">
            개별 인증코드
            <span className="text-error-600 text-body-1-medium pl-[1px]">
              *
            </span>
          </p>

          <CodeInput
            value={code}
            onChange={handleCodeChange}
            state={codeError ? "error" : "default"}
            shakeSignal={errorShakeKey}
            autoFocus
          />

          {codeError && (
            <div className="text-error-500 text-body-2-medium flex items-center gap-1">
              <CheckIcon className="size-4" />
              <p>올바르지 않은 인증코드입니다</p>
            </div>
          )}

          <button
            type="button"
            className="flex w-fit items-center gap-1"
            onClick={() => setIsHelpOpen(true)}
          >
            <Info size={16} className="text-teal-gray-300" />
            <span className="text-teal-gray-300 text-[12px] leading-normal font-medium tracking-[-0.36px] underline">
              지원 코드란?
            </span>
          </button>
        </div>

        <Button
          variant="fill"
          color="primary"
          size="m"
          className="w-full"
          disabled={!isComplete || !!emailError || codeError}
          isLoading={verifyMutation.isPending}
          onClick={handleSubmit}
        >
          내 지원서 조회하기
        </Button>
      </div>

      <CtaModal
        open={isHelpOpen}
        variant="success"
        title="개별 지원 코드란?"
        descriptionClassName="w-full"
        content={
          <span className="block w-full break-keep">
            지원서를 확인하거나 수정할 때 사용하는 6자리 코드입니다. <br />
            임시저장 또는 제출 후 입력한 이메일로 발송됩니다.
          </span>
        }
        confirmText="닫기"
        onOpenChange={setIsHelpOpen}
        onConfirm={() => setIsHelpOpen(false)}
      />
    </>
  )
}
