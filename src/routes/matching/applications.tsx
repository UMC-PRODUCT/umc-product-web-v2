import { createFileRoute, redirect } from "@tanstack/react-router"
import { useLayoutEffect, useRef, useState } from "react"

import {
  useAdminPageData,
  useChallengerPageData,
  useChapters,
} from "@/features/application/hooks/useApplicationPageData"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { ChallengerApplicationView } from "@/features/application/ui/ChallengerApplicationView"
import { useMe } from "@/features/auth/hooks/useMe"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  getViewerBranch,
  isChapterPresident,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { CHAPTERS } from "@/shared/ui/segment/ChapterSelector"

export const Route = createFileRoute("/matching/applications")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!isOperator(me) && !isCurrentTermPm(me)) throw redirect({ to: "/" })
  },
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  const { data: me } = useMe()
  const chaptersQuery = useChapters()
  const chapters = chaptersQuery.data?.chapters ?? []

  // challenger records에서 지부명 추출 (어드민 포함 모든 역할)
  const userChapter = getViewerBranch(me)
  const defaultChapter = CHAPTERS.includes(
    userChapter as (typeof CHAPTERS)[number],
  )
    ? userChapter!
    : "Chromium"

  const [selectedChapter, setSelectedChapter] = useState(defaultChapter)

  const canApprove = isOperator(me)
  const isPm = isCurrentTermPm(me)
  const isOthers = !canApprove && !isPm

  // challenger records에 지부 정보가 없는 경우 chapters API로 폴백 (페인트 전 적용)
  const hasAutoSelected = useRef(false)
  useLayoutEffect(() => {
    if (hasAutoSelected.current || !me || chapters.length === 0) return
    if (!isChapterPresident(me)) return
    if (CHAPTERS.includes(userChapter as (typeof CHAPTERS)[number])) return // 이미 records로 처리됨
    const myChapterId = me.roles?.find(
      (r) => r.roleType === "CHAPTER_PRESIDENT",
    )?.organizationId
    if (!myChapterId) return
    const myChapter = chapters.find((c) => c.id === myChapterId)
    if (myChapter) {
      setSelectedChapter(myChapter.name)
      hasAutoSelected.current = true
    }
  }, [me, chapters, userChapter])

  const admin = useAdminPageData(selectedChapter)
  const adminStats = admin.stats
  const adminProjects = admin.projects

  const challenger = useChallengerPageData()
  const pmProjects = challenger.projects
  const pmProjectInfo = challenger.projectInfo

  return (
    <section className="flex w-full flex-col">
      <div className="border-teal-gray-100 flex w-6xl flex-col rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            지원 현황
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 지원 내역을 통합 관리합니다.
          </p>
        </div>

        {isPm && pmProjectInfo && (
          <ProjectTitleCard
            className="mt-6"
            projectName={pmProjectInfo.projectName}
            challengerName={pmProjectInfo.pmName}
            challengerUniversity={pmProjectInfo.pmUniversity}
            thumbnailUrl={pmProjectInfo.thumbnailUrl}
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
                  <ApplicationStatsSection
                    stats={adminStats}
                    dataUpdatedAt={admin.dataUpdatedAt}
                    currentRound={admin.currentRound}
                    activeRound={admin.activeRound}
                  />
                  <ApplicationTableSection
                    projects={adminProjects}
                    currentRound={admin.currentRound}
                    chapterName={selectedChapter}
                  />
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
                <ChallengerApplicationView
                  projects={pmProjects}
                  currentRound={challenger.currentRound}
                />
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
