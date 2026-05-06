import { useMutation } from "@tanstack/react-query"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { getChallengerRecordByCode } from "@/features/challenger/api/challengerRecord"
import { PART_LABEL, ROLE_TYPE_LABEL } from "@/features/challenger/model/enums"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

import type { ChallengerRecordResponse } from "@/features/challenger/model/types"

const CODE_LENGTH = 6

export function LookupRecordForm() {
  const addToast = useToastStore((state) => state.addToast)
  const [code, setCode] = useState("")
  const [result, setResult] = useState<ChallengerRecordResponse | null>(null)

  const isCodeValid = code.length === CODE_LENGTH

  const mutation = useMutation({
    mutationFn: (value: string) => getChallengerRecordByCode(value),
    onSuccess: (data) => {
      setResult(data)
    },
    onError: () => {
      setResult(null)
      addToast({
        message: "해당 코드의 기록을 찾을 수 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isCodeValid) return
    mutation.mutate(code.trim().toUpperCase())
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="lookup-code"
            className="text-label-1-medium text-teal-gray-700"
          >
            챌린저 기록 코드
            <span className="text-error-500 ml-1">*</span>
          </label>
          <InputBox
            id="lookup-code"
            value={code}
            onChange={(event) => {
              const next = event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, CODE_LENGTH)
              setCode(next)
              if (result) setResult(null)
            }}
            onClear={() => {
              setCode("")
              setResult(null)
            }}
            type="clear"
            state="default"
            placeholder="6자리 코드를 입력해주세요."
            inputClassName="tracking-[0.3em] uppercase"
            className="w-full max-w-none"
          />
          <p className="text-caption-2-medium text-teal-gray-400">
            대소문자 구분 없이 6자리 영숫자 코드입니다. ({code.length}/
            {CODE_LENGTH})
          </p>
        </div>
        <Button
          type="submit"
          variant="fill"
          color="primary"
          size="m"
          disabled={!isCodeValid}
          isLoading={mutation.isPending}
          className="sm:self-start"
        >
          조회
        </Button>
      </div>

      {result && (
        <div className="border-teal-gray-100 bg-teal-gray-50 grid w-full grid-cols-2 gap-x-6 gap-y-3 rounded-[12px] border px-6 py-5 sm:grid-cols-3">
          <Field label="기수" value={`${result.gisu}기`} />
          <Field label="지부" value={result.chapterName} />
          <Field label="학교" value={result.schoolName} />
          <Field label="파트" value={PART_LABEL[result.part]} />
          <Field
            label="역할"
            value={ROLE_TYPE_LABEL[result.challengerRoleType]}
          />
          <Field label="이름" value={result.memberName} />
        </div>
      )}
    </form>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption-2-medium text-teal-gray-500">{label}</span>
      <span className="text-body-2-medium text-teal-gray-900 truncate">
        {value}
      </span>
    </div>
  )
}
