import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { PART_LABEL, ROLE_TYPE_LABEL } from "@/features/challenger/model/enums"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

import type { ChallengerRecordResponse } from "@/features/challenger/model/types"

interface GeneratedCodeCardProps {
  record: ChallengerRecordResponse
}

export function GeneratedCodeCard({ record }: GeneratedCodeCardProps) {
  const addToast = useToastStore((state) => state.addToast)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(record.code)
      setCopied(true)
      addToast({
        message: "코드를 복사했습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 2,
      })
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      addToast({
        message: "복사에 실패했습니다. 직접 복사해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
    }
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-[12px] border border-teal-300 bg-teal-50 px-6 py-5",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-subtitle-4-semibold text-teal-600">
          발급된 코드
        </span>
        <Button
          type="button"
          variant="weak"
          color="primary"
          size="xs"
          onClick={handleCopy}
        >
          {copied ? "복사됨" : "복사"}
        </Button>
      </div>
      <div className="text-display-2-medium tracking-[0.4em] text-teal-700 tabular-nums">
        {record.code}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        <Field label="기수" value={`${record.gisu}기`} />
        <Field label="지부" value={record.chapterName} />
        <Field label="학교" value={record.schoolName} />
        <Field label="파트" value={PART_LABEL[record.part]} />
        <Field
          label="역할"
          value={ROLE_TYPE_LABEL[record.challengerRoleType]}
        />
        <Field label="이름" value={record.memberName} />
      </dl>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption-2-medium text-teal-gray-500">{label}</dt>
      <dd className="text-body-2-medium text-teal-gray-900 truncate">
        {value}
      </dd>
    </div>
  )
}
