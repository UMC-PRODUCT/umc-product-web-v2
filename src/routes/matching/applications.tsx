import { createFileRoute } from "@tanstack/react-router"
import { useLayoutEffect, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
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
  isCentralStaff,
  isChapterPresident,
  isCurrentTermPm,
  isOperator,
  isSchoolLeadership,
  isSuperAdmin,
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
  const addToast = useToastStore((s) => s.addToast)
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

  // 지부장 본인 지부 추적 (auto-select 후 갱신)
  const ownChapter = useRef<string>(defaultChapter)

  const canApprove = isOperator(viewMe) || isSchoolLeadership(viewMe)
  // 지부장·학교 회장: 본인 지부만 조회 가능 (SUPER_ADMIN/중앙 운영진 제외)
  const isRestrictedToChapter =
    (isChapterPresident(me) || isSchoolLeadership(me)) &&
    !isSuperAdmin(me) &&
    !isCentralStaff(me)
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
      ownChapter.current = myChapter.name
      hasAutoSelected.current = true
    }
  }, [me, chapters, userChapter])

  const admin = useAdminPageData(selectedChapter)
  const adminStats = admin.stats
  const adminProjects = admin.projects

  const challenger = useChallengerPageData()
  const pmProjects = challenger.projects
  const availablePerRound = challenger.availablePerRound

  return (
    <section className="flex w-full flex-col">
      <div className="border-teal-gray-100 flex w-6xl flex-col rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            {isOthers ? "내 지원 현황" : "지원 현황"}
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 지원 내역을 통합 관리합니다.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-13">
          {canApprove && (
            <div className="flex w-263 flex-col gap-13">
              <SegmentButton
                items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
                value={selectedChapter}
                onValueChange={(v) => {
                  if (isRestrictedToChapter && v !== ownChapter.current) {
                    addToast({
                      message: "본인 지부의 지원 현황만 조회할 수 있습니다.",
                      color: "red",
                      variant: "deep",
                      type: "default",
                      duration: 3000,
                    })
                    return
                  }
                  setSelectedChapter(v)
                }}
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
                  availablePerRound={availablePerRound}
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
                      availablePerRound={availablePerRound}
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
