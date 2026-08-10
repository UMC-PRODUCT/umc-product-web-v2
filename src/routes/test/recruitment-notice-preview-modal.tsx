import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { RecruitmentNoticePreviewModal } from "@/features/recruiting"
import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/test/recruitment-notice-preview-modal")({
  component: RecruitmentNoticePreviewModalTestPage,
})

function RecruitmentNoticePreviewModalTestPage() {
  const [open, setOpen] = useState(false)

  return (
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col items-start gap-6 p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900">
        RecruitmentNoticePreviewModal Test Page
      </h1>

      <Button variant="fill" color="primary" onClick={() => setOpen(true)}>
        모집 공고 미리보기 열기
      </Button>

      <RecruitmentNoticePreviewModal
        open={open}
        onOpenChange={setOpen}
        title="전체 학교명 UMC 기수기 차수+모집 유형 꼬릿말"
        content="모집 공지
본문의 최소, 최대 높이 있음. 카드 자체의 최대 높이 있음. 본문 내용이 길어질 경우, 본문 프레임의 우측에 스크롤바 허용."
        onApply={() => window.alert("지원하기")}
      />
    </main>
  )
}
