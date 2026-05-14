import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  useAdminPageData,
  useChallengerPageData,
} from "@/features/application/hooks/useApplicationPageData"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { ChallengerApplicationView } from "@/features/application/ui/ChallengerApplicationView"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { CHAPTERS } from "@/shared/ui/segment/ChapterSelector"
import { useViewModeStore } from "@/shared/view-mode"

export const Route = createFileRoute("/matching/applications")({
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  const mode = useViewModeStore((s) => s.mode)
  const [selectedChapter, setSelectedChapter] = useState("Chromium")

  // Admin 뷰 데이터
  const admin = useAdminPageData(selectedChapter)

  // PM 뷰 데이터
  const challenger = useChallengerPageData()

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
        {mode === "pm" && challenger.projectInfo && (
          <ProjectTitleCard
            className="mt-6"
            projectName={challenger.projectInfo.projectName}
            challengerName={challenger.projectInfo.pmName}
            challengerUniversity={challenger.projectInfo.pmUniversity}
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
                onValueChange={(v) => setSelectedChapter(v)}
                itemClassName="flex-1"
              />
              {admin.isLoading && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              )}
              {admin.isError && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-error-600">
                    데이터를 불러오지 못했습니다.
                  </p>
                </div>
              )}
              {!admin.isLoading && !admin.isError && (
                <div className="flex flex-col gap-14.25 pl-4">
                  <ApplicationStatsSection stats={admin.stats} />
                  <ApplicationTableSection projects={admin.projects} />
                </div>
              )}
            </>
          )}

          {/* pm: PM 챌린저 뷰 */}
          {mode === "pm" && (
            <>
              {challenger.isLoading && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              )}
              {challenger.isError && (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-error-600">
                    데이터를 불러오지 못했습니다.
                  </p>
                </div>
              )}
              {!challenger.isLoading && !challenger.isError && (
                <ChallengerApplicationView projects={challenger.projects} />
              )}
            </>
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
