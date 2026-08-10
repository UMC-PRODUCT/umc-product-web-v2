import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  type ApplyConfirmStatus,
  RecruitmentApplyConfirmModal,
} from "@/features/recruiting"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/test/recruitment-apply-confirm-modal")({
  component: RecruitmentApplyConfirmModalTestPage,
})

const STATUSES: { status: ApplyConfirmStatus; label: string }[] = [
  { status: "confirm", label: "지원 전 지원하기 클릭" },
  { status: "submitted", label: "이미 지원한 경우" },
  { status: "submittedEditable", label: "이미 지원 + 수정 가능 기간" },
  { status: "draft", label: "작성 중인 지원서가 있는 경우" },
]

function RecruitmentApplyConfirmModalTestPage() {
  const [open, setOpen] = useState<ApplyConfirmStatus | null>(null)

  return (
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col items-start gap-4 p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900">
        RecruitmentApplyConfirmModal Test Page
      </h1>

      {STATUSES.map(({ status, label }) => (
        <Button
          key={status}
          variant="fill"
          color="primary"
          onClick={() => setOpen(status)}
        >
          {label}
        </Button>
      ))}

      {open && (
        <RecruitmentApplyConfirmModal
          open={open !== null}
          onOpenChange={(next) => {
            if (!next) setOpen(null)
          }}
          status={open}
          recruitmentTitle="한양대학교 ERICA 2차 정규 모집"
          onConfirm={() => setOpen(null)}
        />
      )}
    </main>
  )
}
