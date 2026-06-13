import { createFileRoute } from "@tanstack/react-router"
import { useLayoutEffect, useRef, useState } from "react"

import {
  useAdminPageData,
  useChallengerPageData,
  useChapters,
} from "@/features/application/hooks/useApplicationPageData"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { ChallengerApplicationView } from "@/features/application/ui/ChallengerApplicationView"
import { MyApplicationView } from "@/features/application/ui/MyApplicationView"
import { useMe } from "@/features/auth/hooks/useMe"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  getViewerBranch,
  isAnyOperator,
  isChapterPresident,
  isCurrentTermPm,
  isOperator,
  isSchoolStaff,
} from "@/features/auth/model/identity"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { CHAPTERS } from "@/shared/ui/segment/ChapterSelector"
import { useViewMe } from "@/shared/view-mode/useViewMe"

export const Route = createFileRoute("/matching/applications")({
  beforeLoad: async ({ context }) => {
    await ensureMe(context.queryClient)
  },
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  const { data: me } = useMe()
  const { viewMe } = useViewMe()
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

  const canApprove = isOperator(viewMe)
  // SCHOOL_PRESIDENT 등 학교 운영진: APPLY-101 목록 조회 가능, APPLY-102 상세 불가
  const isSchoolView = !canApprove && isSchoolStaff(viewMe)
  const isPm = isCurrentTermPm(viewMe)
  const isOthers = !isAnyOperator(viewMe) && !isPm

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

  // SCHOOL_PRESIDENT는 챕터 필터 없이 조회 (서버가 학교 단위로 APPLY-101 결과를 필터링)
  const admin = useAdminPageData(isSchoolView ? undefined : selectedChapter)
  const adminStats = admin.stats
  const adminProjects = admin.projects

  const challenger = useChallengerPageData()
  const pmProjects = challenger.projects

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

        <div className="mt-6 flex flex-col gap-13">
          {canApprove && (
            <div className="ml-4 flex w-263 flex-col gap-13">
              <SegmentButton
                items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
                value={selectedChapter}
                onValueChange={(v) => setSelectedChapter(v)}
                className="w-full min-w-0 [&>button>span:last-child]:min-w-0 [&>button>span:last-child]:truncate"
                itemClassName="min-w-0 flex-1 basis-0 shrink px-2"
              />
              {admin.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-14.25">
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
            </div>
          )}

          {isSchoolView && (
            <div className="ml-4 flex w-263 flex-col gap-13">
              {admin.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-14.25">
                  <ApplicationStatsSection
                    stats={adminStats}
                    dataUpdatedAt={admin.dataUpdatedAt}
                    currentRound={admin.currentRound}
                    activeRound={admin.activeRound}
                  />
                  <ApplicationTableSection
                    projects={adminProjects}
                    currentRound={admin.currentRound}
                    disableFormPanel
                  />
                </div>
              )}
            </div>
          )}

          {isPm && (
            <>
              {challenger.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : pmProjects.length === 0 ? (
                <ChallengerApplicationView
                  projects={[]}
                  currentRound={challenger.currentRound}
                />
              ) : (
                pmProjects.map((project) => (
                  <div key={project.id} className="flex flex-col gap-6">
                    <ProjectTitleCard
                      projectName={project.projectName}
                      challengerName={project.challengerName}
                      challengerUniversity={project.challengerUniversity}
                      thumbnailUrl={project.thumbnailUrl}
                      size="lg"
                    />
                    <ChallengerApplicationView
                      projects={[project]}
                      currentRound={challenger.currentRound}
                    />
                  </div>
                ))
              )}
            </>
          )}

          {isOthers && <MyApplicationView />}
        </div>
      </div>
    </section>
  )
}
