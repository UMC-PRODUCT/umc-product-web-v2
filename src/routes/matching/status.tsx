import { createFileRoute } from "@tanstack/react-router"
import { useLayoutEffect, useRef, useState } from "react"

import { useChapters } from "@/features/application/hooks/useApplicationPageData"
import { ApplicationStatsSection } from "@/features/application/ui/ApplicationStatsSection"
import { useMe } from "@/features/auth/hooks/useMe"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  getViewerBranch,
  isChapterPresident,
  isOperator,
} from "@/features/auth/model/identity"
import { useMatchingStatusData } from "@/features/matching/hooks/useMatchingStatusData"
import { MatchingPartSection } from "@/features/matching/ui/MatchingPartSection"
import { MatchingResultRow } from "@/features/matching/ui/MatchingResultRow"
import { MatchingTableHead } from "@/features/matching/ui/MatchingTableHead"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { type Chapter, CHAPTERS } from "@/shared/ui/segment/ChapterSelector"

export const Route = createFileRoute("/matching/status")({
  beforeLoad: async ({ context }) => {
    await ensureMe(context.queryClient)
  },
  component: MatchingStatusPage,
})

function MatchingStatusPage() {
  const { data: me } = useMe()
  const isAdmin = isOperator(me)
  const chaptersQuery = useChapters()
  const chapters = chaptersQuery.data?.chapters ?? []

  // challenger records에서 지부명 추출 (어드민 포함 모든 역할)
  const userChapter = getViewerBranch(me)
  const defaultChapter: Chapter = CHAPTERS.includes(userChapter as Chapter)
    ? (userChapter as Chapter)
    : CHAPTERS[0]

  const [selectedChapter, setSelectedChapter] =
    useState<Chapter>(defaultChapter)

  // challenger records에 지부 정보가 없는 경우 chapters API로 폴백 (페인트 전 적용)
  const hasAutoSelected = useRef(false)
  useLayoutEffect(() => {
    if (hasAutoSelected.current || !me || chapters.length === 0) return
    if (!isChapterPresident(me)) return
    if (CHAPTERS.includes(userChapter as Chapter)) return // 이미 records로 처리됨
    const myChapterId = me.roles?.find(
      (r) => r.roleType === "CHAPTER_PRESIDENT",
    )?.organizationId
    if (!myChapterId) return
    const myChapter = chapters.find((c) => c.id === myChapterId)
    if (myChapter && CHAPTERS.includes(myChapter.name as Chapter)) {
      setSelectedChapter(myChapter.name as Chapter)
      hasAutoSelected.current = true
    }
  }, [me, chapters, userChapter])

  const {
    matchingParts,
    stats,
    currentRound,
    gisuId,
    chapterId,
    assignedMemberIds,
    dataUpdatedAt,
    isLoading,
  } = useMatchingStatusData(selectedChapter)

  const displayParts = matchingParts
  const displayStats = stats

  return (
    <section className="flex w-full flex-col">
      <div className="border-teal-gray-100 flex w-6xl flex-col rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
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
        <div className="mt-6 flex flex-col gap-24.75">
          <SegmentButton
            items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
            value={selectedChapter}
            onValueChange={(v) => setSelectedChapter(v as Chapter)}
            itemClassName="flex-1"
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-body-2-regular text-teal-gray-400">
                데이터를 불러오는 중...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-14.25 pl-4">
              {/* 01 매칭 통계 */}
              <ApplicationStatsSection
                stats={displayStats}
                dataUpdatedAt={dataUpdatedAt}
                variant="matching"
                currentRound={currentRound}
              />

              {/* 02 매칭 결과 시트 */}
              <div className="flex flex-col gap-4">
                <h2 className="text-heading-6-semibold text-teal-700">
                  <span className="text-teal-600">02</span> 매칭 결과 시트
                </h2>

                <div className="flex w-263 flex-col gap-6">
                  {displayParts.map((part) => (
                    <MatchingPartSection
                      key={part.partName}
                      partName={part.partName}
                    >
                      <MatchingTableHead />
                      {part.projects.map((project) => (
                        <MatchingResultRow
                          key={project.projectName}
                          projectId={project.projectId}
                          projectName={project.projectName}
                          challengerName={project.challengerName}
                          challengerUniversity={project.challengerUniversity}
                          backendPart={project.backendPart}
                          roleRows={project.roleRows}
                          status={project.status}
                          currentCount={project.currentCount}
                          totalCount={project.totalCount}
                          isEditable={isAdmin}
                          gisuId={gisuId}
                          chapterId={chapterId}
                          assignedMemberIds={assignedMemberIds}
                          currentRound={currentRound}
                          chapterName={selectedChapter}
                        />
                      ))}
                    </MatchingPartSection>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
