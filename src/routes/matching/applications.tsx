import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  useAdminPageData,
  useChallengerPageData,
} from "@/features/application/hooks/useApplicationPageData"
import {
  MOCK_PROJECTS,
  MOCK_STATS,
} from "@/features/application/model/applicationMock"
import { MOCK_CHALLENGER_PROJECT } from "@/features/application/model/challengerMock"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { ChallengerApplicationView } from "@/features/application/ui/ChallengerApplicationView"
import { useMe } from "@/features/auth/hooks/useMe"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { CHAPTERS } from "@/shared/ui/segment/ChapterSelector"

export const Route = createFileRoute("/matching/applications")({
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  const { data: me } = useMe()
  const [selectedChapter, setSelectedChapter] = useState("Chromium")

  const canApprove = isOperator(me)
  const isPm = isCurrentTermPm(me)
  const isOthers = !isOperator(me) && !isPm

  // Admin 뷰 데이터 (API 데이터가 비어있으면 mock fallback)
  const admin = useAdminPageData(selectedChapter)
  const adminStats = admin.projects.length > 0 ? admin.stats : MOCK_STATS
  const adminProjects =
    admin.projects.length > 0 ? admin.projects : MOCK_PROJECTS

  // PM 뷰 데이터 (API 데이터가 비어있으면 mock fallback)
  const challenger = useChallengerPageData()
  const pmProjects =
    challenger.projects.length > 0
      ? challenger.projects
      : MOCK_PROJECTS.filter((p) => p.id === "3")
  const pmProjectInfo = challenger.projectInfo ?? MOCK_CHALLENGER_PROJECT

  return (
    <section className="flex w-full flex-col pt-10">
      <div className="border-teal-gray-100 flex w-6xl flex-col rounded-xl border bg-white px-8.5 py-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            지원 현황
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 지원 내역을 통합 관리합니다.
          </p>
        </div>

        {isPm && (
          <ProjectTitleCard
            className="mt-6"
            projectName={pmProjectInfo.projectName}
            challengerName={pmProjectInfo.pmName}
            challengerUniversity={pmProjectInfo.pmUniversity}
            size="lg"
          />
        )}

        <div className="mt-6 flex flex-col gap-24.75">
          {canApprove && (
            <>
              <SegmentButton
                items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
                value={selectedChapter}
                onValueChange={(v) => setSelectedChapter(v)}
                itemClassName="flex-1"
              />
              {admin.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-14.25 pl-4">
                  <ApplicationStatsSection stats={adminStats} />
                  <ApplicationTableSection projects={adminProjects} />
                </div>
              )}
            </>
          )}

          {isPm && (
            <>
              {challenger.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : (
                <ChallengerApplicationView projects={pmProjects} />
              )}
            </>
          )}

          {isOthers && (
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
