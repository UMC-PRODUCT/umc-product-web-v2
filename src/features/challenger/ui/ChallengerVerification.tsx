import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Info } from "lucide-react"
import { useState } from "react"

import { authKeys } from "@/features/auth/hooks/useMe"
import { addChallengerRecordToMember } from "@/features/challenger/api/challengerRecord"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { CodeInput } from "@/shared/ui/input/CodeInput"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

const CODE_LENGTH = 6

export function ChallengerVerification() {
  const [code, setCode] = useState("")
  const [hasError, setHasError] = useState(false)
  const [errorShakeKey, setErrorShakeKey] = useState(0)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const isComplete = code.length === CODE_LENGTH

  const handleChange = (value: string) => {
    setCode(value)
    if (hasError) setHasError(false)
  }

  const triggerError = () => {
    setHasError(true)
    setErrorShakeKey((key) => key + 1)
  }

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const verifyMutation = useMutation({
    mutationFn: (value: string) => addChallengerRecordToMember(value),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.me })
      void navigate({ to: "/" })
    },
    onError: () => {
      triggerError()
    },
  })

  const handleSubmit = () => {
    if (!isComplete || verifyMutation.isPending) return
    verifyMutation.mutate(code)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-full max-w-90.5 flex-col items-center gap-10">
        <h1 className="text-heading-3-semibold text-teal-gray-900 self-stretch text-center">
          UMC 챌린저 인증
        </h1>

        <div className="flex w-full flex-col gap-2">
          <p className="text-body-1-medium text-teal-gray-600">
            개별 인증코드
            <span className="text-error-600 text-body-1-medium pl-[1px]">
              *
            </span>
          </p>

          <CodeInput
            value={code}
            onChange={handleChange}
            state={hasError ? "error" : "default"}
            shakeSignal={errorShakeKey}
            className="max-[419px]:justify-between"
            autoFocus
          />

          {hasError && (
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
              개별 인증코드란?
            </span>
          </button>
        </div>

        <Button
          variant="fill"
          color="primary"
          size="xl"
          className="w-full"
          disabled={!isComplete}
          isLoading={verifyMutation.isPending}
          onClick={handleSubmit}
        >
          시작하기
        </Button>
      </div>

      <CtaModal
        open={isHelpOpen}
        variant="success"
        title="개별 인증코드란?"
        descriptionClassName="w-full"
        content={
          <span className="block w-full break-keep">
            개별 인증코드는 OT에서 안내된 챌린저 전용 인증번호입니다.{" "}
            <br className="hidden md:block" />
            확인이 어려운 경우, 소속 학교 회장단에 문의해 주세요.
          </span>
        }
        confirmText="닫기"
        onOpenChange={setIsHelpOpen}
        onConfirm={() => setIsHelpOpen(false)}
      />
    </div>
  )
}
