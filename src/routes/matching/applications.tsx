import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  MOCK_PROJECTS,
  MOCK_STATS,
} from "@/features/application/model/applicationMock"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { type Chapter, CHAPTERS } from "@/features/notice/ui/ChapterSelector"
import { useViewRoleStore } from "@/shared/model/useViewRoleStore"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

export const Route = createFileRoute("/matching/applications")({
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  const role = useViewRoleStore((s) => s.role)
  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  return (
    <section className="flex w-full flex-col pt-10">
      <div className="border-teal-gray-100 flex w-288 flex-col rounded-xl border bg-white px-8.5 py-8">
        {/* 페이지 헤더 */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            지원 현황
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 지원 내역을 통합 관리합니다.
          </p>
        </div>

        {/* 지부 선택 + 콘텐츠 */}
        <div className="mt-6 flex flex-col gap-[99px]">
          <SegmentButton
            items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
            value={selectedChapter}
            onValueChange={(v) => setSelectedChapter(v as Chapter)}
            itemClassName="flex-1"
          />

          {role === "admin" && (
            <div className="flex flex-col gap-[57px] pl-4">
              <ApplicationStatsSection stats={MOCK_STATS} />
              <ApplicationTableSection projects={MOCK_PROJECTS} />
            </div>
          )}

          {role !== "admin" && (
            <div className="border-teal-gray-150 flex items-center justify-center rounded-xl border bg-white px-8.5 py-20">
              <p className="text-body-2-regular text-teal-gray-400">
                해당 역할의 지원 현황 뷰는 준비 중입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
