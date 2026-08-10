import { createFileRoute } from "@tanstack/react-router"

import { RecruitmentNoticeCard } from "@/features/recruiting"

import type { ReactNode } from "react"

export const Route = createFileRoute("/test/recruitment-notice-card")({
  component: RecruitmentNoticeCardTestPage,
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

const TITLE = "전체 학교명 UMC 기수기 차수+모집 유형 꼬릿말"
const PERIOD = "2026-00-00 00:00 ~ 00-00 23:59"

function RecruitmentNoticeCardTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        RecruitmentNoticeCard Test Page
      </h1>

      <div className="flex max-w-[960px] flex-col gap-10">
        <Section title="모집 중 — D-day 있음">
          <RecruitmentNoticeCard
            title={TITLE}
            period={PERIOD}
            parts={["pm", "design", "web-pe", "mobile-pe"]}
            isClosed={false}
            dDay={10}
          />
        </Section>

        <Section title="모집 마감">
          <RecruitmentNoticeCard
            title={TITLE}
            period={PERIOD}
            parts={["pm", "design", "web-pe", "mobile-pe"]}
            isClosed
          />
        </Section>
      </div>
    </main>
  )
}
