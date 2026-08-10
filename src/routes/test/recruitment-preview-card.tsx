import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentPreviewCard } from "@/features/recruiting"

import type { ReactNode } from "react"

export const Route = createFileRoute("/test/recruitment-preview-card")({
  component: RecruitmentPreviewCardTestPage,
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function RecruitmentPreviewCardTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        RecruitmentPreviewCard Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Default — footer 없음">
          <RecruitmentPreviewCard
            title="전체 학교 UMC 9기 1차 정기 모집"
            startLabel="2000-00-00 00:00"
            endLabel="00-00 23:59"
          />
        </Section>

        <Section title="Filled — footer 값 있음">
          <RecruitmentPreviewCard
            title="전체 학교 UMC 9기 1차 정기 모집"
            footer="테스트1"
            startLabel="2000-00-00 00:00"
            endLabel="00-00 23:59"
          />
        </Section>

        <Section title="생성 미리보기 — footer 없을 때 안내 문구(emptyFooterPlaceholder)">
          <RecruitmentPreviewCard
            title="전체 학교 UMC 9기 1차 정기 모집"
            emptyFooterPlaceholder="꼬릿말을 필요 시 작성하세요 (선택)"
            startLabel="2000-00-00 00:00"
            endLabel="00-00 23:59"
          />
        </Section>
      </div>
    </main>
  )
}
