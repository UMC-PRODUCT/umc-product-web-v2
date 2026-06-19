import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useLayoutEffect, useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  useAdminPageData,
  useChallengerPageData,
  useChapters,
} from "@/features/application/hooks/useApplicationPageData"
import { resolveMatchingApplicationView } from "@/features/application/model/applicationViewMode"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { ApplicationTableSection } from "@/features/application/ui/ApplicationTableSection"
import { ChallengerApplicationView } from "@/features/application/ui/ChallengerApplicationView"
import { MyApplicationView } from "@/features/application/ui/MyApplicationView"
import { useMe } from "@/features/auth/hooks/useMe"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  getViewerBranch,
  isAnyOperator,
  isCentralCore,
  isChapterPresident,
  isCurrentTermPm,
  isOperator,
  isSchoolLeadership,
} from "@/features/auth/model/identity"
import { getChaptersWithSchools } from "@/features/challenger/api/organization"
import { useIsMatchingPeriod } from "@/features/project/new/hooks/useIsMatchingPeriod"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { CHAPTERS } from "@/shared/ui/segment/ChapterSelector"
import { useViewerIdentity } from "@/shared/view-mode/useViewerIdentity"

export const Route = createFileRoute("/matching/applications")({
  beforeLoad: async ({ context }) => {
    await ensureMe(context.queryClient)
  },
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  const { data: me } = useMe()
  const { me: identity, viewContext } = useViewerIdentity()
  const schoolLeadership = isSchoolLeadership(identity)
  const addToast = useToastStore((s) => s.addToast)
  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  const gisuId = useActiveGisuId().data ?? 0
  const chaptersWithSchoolsQuery = useQuery({
    queryKey: ["chapters-with-schools", gisuId],
    queryFn: () => getChaptersWithSchools(String(gisuId)),
    enabled: gisuId > 0 && schoolLeadership,
  })

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

  const hasOperatorRole = isAnyOperator(identity)
  const hasPmRole = isCurrentTermPm(identity)
  const canApprove = isOperator(identity) || schoolLeadership
  const canViewOwnApplications =
    viewContext.isChallengerView || (!hasOperatorRole && !hasPmRole)
  const activeView = resolveMatchingApplicationView({
    mode: viewContext.mode,
    canViewAdminApplications: canApprove,
    canViewPmApplications: hasPmRole,
    canViewOwnApplications,
  })
  // 지부장·학교 회장: 본인 지부만 조회 가능 (SUPER_ADMIN/중앙 총괄단 제외)
  const isRestrictedToChapter =
    (isChapterPresident(me) || isSchoolLeadership(me)) && !isCentralCore(me)
  const showAdminSection = activeView === "admin"
  const showPmSection = activeView === "pm"
  const showOwnApplications = activeView === "others"

  // challenger records에 지부 정보가 없는 경우 chapters API로 폴백 (페인트 전 적용)
  const hasAutoSelected = useRef(false)
  useLayoutEffect(() => {
    if (hasAutoSelected.current || !me) return
    if (isChapterPresident(me)) {
      if (chapters.length === 0) return
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
      return
    }
    if (isSchoolLeadership(me)) {
      const myChapter = chaptersWithSchoolsQuery.data?.chapters.find((c) =>
        c.schools.some((s) => s.schoolId === String(me.schoolId)),
      )
      if (
        myChapter &&
        CHAPTERS.includes(myChapter.chapterName as (typeof CHAPTERS)[number])
      ) {
        setSelectedChapter(myChapter.chapterName)
        ownChapter.current = myChapter.chapterName
        hasAutoSelected.current = true
      }
    }
  }, [me, chapters, userChapter, chaptersWithSchoolsQuery.data])

  // 차수 제한 대상: 지부장·교내 회장/부회장·Plan 챌린저 (최고관리자·중앙 총괄단 제외)
  const isRoundRestrictedRole =
    (isChapterPresident(identity) || schoolLeadership || hasPmRole) &&
    !isCentralCore(identity)

  const admin = useAdminPageData(selectedChapter, {
    enabled: showAdminSection,
  })
  const adminStats = admin.stats
  const adminProjects = admin.projects

  // 지부장·교내 회장/부회장: admin.activeRound가 있으면 차수 진행 중 → 조회 잠금
  const isAdminRoundLocked =
    isRoundRestrictedRole && admin.activeRound !== undefined

  const challenger = useChallengerPageData({ enabled: showPmSection })
  const pmProjects = challenger.projects
  const availablePerRound = challenger.availablePerRound

  // Plan 챌린저: 매칭 기간 중이면 조회 잠금
  const isPmMatchingPeriod = useIsMatchingPeriod({
    enabled: showPmSection && hasPmRole,
  })

  return (
    <section className="flex w-full flex-col">
      <div className="border-teal-gray-100 flex w-6xl flex-col rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            {showOwnApplications ? "내 지원 현황" : "지원 현황"}
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            프로젝트 지원 내역을 통합 관리합니다.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-13">
          {showAdminSection && (
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
                  {isAdminRoundLocked ? (
                    <div className="flex items-center justify-center py-20">
                      <p className="text-body-2-regular text-teal-gray-400">
                        매칭 차수가 진행 중입니다. 차수 종료 후 조회할 수
                        있습니다.
                      </p>
                    </div>
                  ) : (
                    <ApplicationTableSection
                      projects={adminProjects}
                      currentRound={admin.currentRound}
                      chapterName={selectedChapter}
                      disableProjectModal
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {showPmSection && (
            <>
              {challenger.isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    데이터를 불러오는 중...
                  </p>
                </div>
              ) : isPmMatchingPeriod ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-body-2-regular text-teal-gray-400">
                    매칭 차수가 진행 중입니다. 차수 종료 후 조회할 수 있습니다.
                  </p>
                </div>
              ) : pmProjects.length === 0 ? (
                <ChallengerApplicationView
                  projects={[]}
                  availablePerRound={availablePerRound}
                  projectStats={challenger.projectStats}
                  schoolIdToName={challenger.schoolIdToName}
                  currentRound={challenger.currentRound}
                  decisionDeadlineByRound={challenger.decisionDeadlineByRound}
                />
              ) : (
                pmProjects.map((project) => (
                  <div key={project.id} className="flex flex-col gap-6">
                    <ProjectTitleCard
                      projectName={project.projectName}
                      challengerName={project.challengerName}
                      challengerUniversity={project.challengerUniversity}
                      thumbnailUrl={project.logoUrl}
                      size="lg"
                    />
                    <ChallengerApplicationView
                      projects={[project]}
                      availablePerRound={availablePerRound}
                      projectStats={challenger.projectStats.filter(
                        (s) => s.projectId === String(project.id),
                      )}
                      schoolIdToName={challenger.schoolIdToName}
                      currentRound={challenger.currentRound}
                      decisionDeadlineByRound={
                        challenger.decisionDeadlineByRound
                      }
                    />
                  </div>
                ))
              )}
            </>
          )}

          {showOwnApplications && <MyApplicationView />}
        </div>
      </div>
    </section>
  )
}
