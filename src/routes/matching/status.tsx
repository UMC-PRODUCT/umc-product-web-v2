import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { MOCK_STATS } from "@/features/application/model/applicationMock"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { MOCK_MATCHING_PARTS } from "@/features/matching/model/matchingStatusMock"
import { MatchingPartSection } from "@/features/matching/ui/MatchingPartSection"
import { MatchingResultRow } from "@/features/matching/ui/MatchingResultRow"
import { MatchingTableHead } from "@/features/matching/ui/MatchingTableHead"
import {
  type Chapter,
  ChapterSelector,
} from "@/features/notice/ui/ChapterSelector"

export const Route = createFileRoute("/matching/status")({
  component: MatchingStatusPage,
})

function MatchingStatusPage() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  return (
    <section className="flex w-full flex-col pt-10">
      <div className="border-teal-gray-100 flex w-288 flex-col rounded-xl border bg-white px-8.5 py-8">
        {/* 페이지 헤더 */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            매칭 현황
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 매칭 현황을 확인합니다.
          </p>
        </div>

        {/* 지부 선택 + 콘텐츠 */}
        <div className="mt-6 flex flex-col gap-[99px]">
          <ChapterSelector
            selectedChapter={selectedChapter}
            onChapterChange={setSelectedChapter}
          />

          <div className="flex flex-col gap-[57px] pl-4">
            {/* 01 매칭 통계 */}
            <ApplicationStatsSection stats={MOCK_STATS} />

            {/* 02 매칭 결과 시트 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-heading-6-semibold text-teal-700">
                <span className="text-teal-600">02</span> 매칭 결과 시트
              </h2>

              <div className="flex w-263 flex-col gap-6">
                {MOCK_MATCHING_PARTS.map((part) => (
                  <MatchingPartSection
                    key={part.partName}
                    partName={part.partName}
                  >
                    <MatchingTableHead />
                    {part.projects.map((project) => (
                      <MatchingResultRow
                        key={project.projectName}
                        projectName={project.projectName}
                        challengerName={project.challengerName}
                        challengerUniversity={project.challengerUniversity}
                        backendPart={project.backendPart}
                        roleRows={project.roleRows}
                        status={project.status}
                        currentCount={project.currentCount}
                        totalCount={project.totalCount}
                      />
                    ))}
                  </MatchingPartSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
