import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  MOCK_PROJECTS,
  MOCK_STATS,
} from "@/features/application/model/applicationMock"
import {
  MOCK_CHALLENGER_PROJECT,
  MOCK_CHALLENGER_STATS,
} from "@/features/application/model/challengerMock"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { ChallengerApplicationView } from "@/features/application/ui/ChallengerApplicationView"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { type Chapter, CHAPTERS } from "@/shared/ui/segment/ChapterSelector"
import { useViewModeStore } from "@/shared/view-mode"

export const Route = createFileRoute("/matching/applications")({
  component: MatchingApplicationsPage,
})

const CHALLENGER_PROJECTS = MOCK_PROJECTS.filter((p) => p.id === "3")

function MatchingApplicationsPage() {
  const mode = useViewModeStore((s) => s.mode)
  const [selectedChapter, setSelectedChapter] = useState<Chapter>("Chromium")

  return (
    <section className="flex w-full flex-col pt-10">
      <div className="border-teal-gray-100 flex w-6xl flex-col rounded-xl border bg-white px-8.5 py-8">
        {/* 페이지 헤더 */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            지원 현황
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 지원 내역을 통합 관리합니다.
          </p>
        </div>

        {/* PM 챌린저: 프로젝트 카드 */}
        {mode === "pm" && (
          <ProjectTitleCard
            className="mt-6"
            projectName={MOCK_CHALLENGER_PROJECT.projectName}
            challengerName={MOCK_CHALLENGER_PROJECT.pmName}
            challengerUniversity={MOCK_CHALLENGER_PROJECT.pmUniversity}
            size="lg"
          />
        )}

        {/* 콘텐츠 */}
        <div className="mt-6 flex flex-col gap-24.75">
          {/* admin: 지부 선택 + 통계 + 테이블 */}
          {mode === "admin" && (
            <>
              <SegmentButton
                items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
                value={selectedChapter}
                onValueChange={(v) => setSelectedChapter(v as Chapter)}
                itemClassName="flex-1"
              />
              <div className="flex flex-col gap-14.25 pl-4">
                <ApplicationStatsSection stats={MOCK_STATS} />
                <ApplicationTableSection projects={MOCK_PROJECTS} />
              </div>
            </>
          )}

          {/* pm: PM 챌린저 뷰 */}
          {mode === "pm" && (
            <ChallengerApplicationView
              stats={MOCK_CHALLENGER_STATS}
              projects={CHALLENGER_PROJECTS}
            />
          )}

          {/* others: 준비 중 */}
          {mode === "others" && (
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
