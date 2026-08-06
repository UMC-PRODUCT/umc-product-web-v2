import { createFileRoute } from "@tanstack/react-router"

import { getServerErrorMessage } from "@/features/recruiting/api/errors"
import { useApplicationStatusSummary } from "@/features/recruiting/hooks/useApplicationStatusSummary"
import { useRecruitingProgress } from "@/features/recruiting/hooks/useRecruitingProgress"
import {
  formatAppliedAtParts,
  formatBaseTime,
} from "@/features/recruiting/model/applicantListTypes"
import {
  countSchools,
  groupByChapter,
  toPartCounts,
} from "@/features/recruiting/model/applicationStats"
import { ChapterRankingCard } from "@/features/recruiting/ui/dashboard/ChapterRankingCard"
import { PartDistributionCard } from "@/features/recruiting/ui/dashboard/PartDistributionCard"
import { SchoolListCard } from "@/features/recruiting/ui/dashboard/SchoolListCard"
import { SchoolPartChartCard } from "@/features/recruiting/ui/dashboard/SchoolPartChartCard"
import { StatCard } from "@/features/recruiting/ui/dashboard/StatCard"
import { shortenSchoolName } from "@/shared/lib/formatSchoolName"
import { GraphTimestampLabel } from "@/shared/ui/GraphTimestampLabel"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import type { PartBreakdown, PartKey } from "@/features/recruiting/model/parts"

export const Route = createFileRoute("/recruiting/dashboard/applications")({
  component: RouteComponent,
})

// 지원 현황 툴팁은 지원자 수만 보여준다(평가 완료 수는 평가 현황 화면에서 쓴다).
function toBreakdown(counts: Record<PartKey, number>): PartBreakdown {
  return {
    pm: { applied: counts.pm },
    design: { applied: counts.design },
    webPe: { applied: counts.webPe },
    mobilePe: { applied: counts.mobilePe },
  }
}

function EmptyNotice({ message }: { message: string }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
      {message}
    </div>
  )
}

function RouteComponent() {
  const { data, isLoading, isError, error, dataUpdatedAt, hasActiveGisu } =
    useApplicationStatusSummary()
  const { isRecruiting } = useRecruitingProgress()

  const chapterGroups = data ? groupByChapter(data) : []
  // 서버가 집계 기준 시각을 주지 않아 조회 시각을 쓴다. 집계 시각과 조회 시각의
  // 차이는 이 화면에서 감수하기로 했다(서버에 asOf 필드를 따로 요청하지 않음).
  const asOf = new Date(dataUpdatedAt)
  // 총 지원자 카드는 "07/02 02:48 기준", 그래프 기준 시각 라벨은 "26-07-04 02:48 기준"
  // 으로 날짜 형식이 서로 다르다.
  const statAsOf = formatAppliedAtParts(asOf.toISOString())

  const [graphAsOfDate, graphAsOfTime] = formatBaseTime(asOf).split(" ")

  const header = (
    <PageLabel
      breadcrumb={[
        { id: "recruiting", label: "리크루팅" },
        { id: "dashboard", label: "대시보드" },
        { id: "applications", label: "지원 현황" },
      ]}
      title="지원 현황"
      description="지부별, 학교별, 파트별 지원 현황을 실시간으로 확인합니다."
    />
  )

  if (isLoading) {
    return (
      <div>
        {header}
        <EmptyNotice message="지원 현황을 불러오는 중입니다." />
      </div>
    )
  }

  // 실패를 기수 없음보다 먼저 본다. 기수 조회가 실패해도 gisuId 가 비어
  // hasActiveGisu 가 false 가 되는데, 그 순서로 두면 조회 실패를 "기수가 없다"고
  // 잘못 안내한다.
  if (isError) {
    // 권한 부족처럼 원인이 확정된 실패는 서버 문구를 그대로 보여준다.
    // 그래야 "잠시 후 다시 시도"라는 잘못된 안내를 하지 않는다.
    const message =
      getServerErrorMessage(error) ??
      "지원 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
    return (
      <div>
        {header}
        <EmptyNotice message={message} />
      </div>
    )
  }

  // 활성 기수가 없으면 조회 자체를 하지 않는다. 실패가 아니라 표시할 대상이
  // 없는 상태라 안내를 구분한다.
  if (!hasActiveGisu) {
    return (
      <div>
        {header}
        <EmptyNotice message="진행 중인 기수가 없어 지원 현황을 표시할 수 없습니다." />
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        {header}
        <EmptyNotice message="지원 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />
      </div>
    )
  }

  // 파트 도넛은 기수 전체 파트 집계를 쓴다.
  const applicantsByPart = toPartCounts(data.parts)
  const partValues: Record<PartKey, { type: "application"; count: number }> = {
    pm: { type: "application", count: applicantsByPart.pm },
    design: { type: "application", count: applicantsByPart.design },
    webPe: { type: "application", count: applicantsByPart.webPe },
    mobilePe: { type: "application", count: applicantsByPart.mobilePe },
  }

  // 지부를 넘어 학교를 한 줄로 편다. groupByChapter 가 지부명 > 학교명 순으로
  // 정렬해 두므로 순서를 그대로 쓴다(카드는 받은 순서대로 렌더한다).
  const chartSchools = chapterGroups.flatMap((group) =>
    group.schools.map((school) => ({
      chapterId: group.chapterId,
      chapterName: group.chapterName,
      schoolId: school.schoolId,
      // 서버는 정식 명칭을 주는데 x축에 학교가 15개씩 들어가 그대로면 넘친다.
      name: shortenSchoolName(school.schoolName),
      counts: school.partCounts,
    })),
  )
  return (
    <div>
      {header}
      <div className="mt-8 flex gap-4">
        <StatCard
          title={"총 지원자"}
          count={data.totalCount}
          footer={{
            type: "timestamp",
            date: statAsOf.date,
            time: statAsOf.time,
          }}
        />
        <PartDistributionCard title="파트별 지원 현황" values={partValues} />
        {/* 마지막 카드 위 8px에 기준 시각 라벨(우측 정렬). absolute라 카드 정렬엔 영향 없음. */}
        <div className="relative flex">
          <GraphTimestampLabel
            date={graphAsOfDate ?? ""}
            time={graphAsOfTime ?? ""}
            className="absolute right-0 bottom-full mb-2"
          />
          <SchoolListCard
            totalCount={countSchools(chapterGroups)}
            chapters={chapterGroups.map((group) => ({
              chapterId: group.chapterId,
              chapterName: group.chapterName,
              // 서버는 정식 명칭("가천대학교")을 주는데 카드가 2열 좁은 그리드라 줄여 쓴다.
              schools: group.schools.map((school) => ({
                schoolId: school.schoolId,
                name: shortenSchoolName(school.schoolName),
              })),
            }))}
          />
        </div>
      </div>
      <div className="mt-4">
        <ChapterRankingCard
          title="지부별 지원 현황"
          chapters={chapterGroups.map((group) => ({
            chapterId: group.chapterId,
            chapterName: group.chapterName,
            count: group.totalCount,
            breakdown: toBreakdown(group.partCounts),
          }))}
          footerStatus={isRecruiting ? "모집 중" : undefined}
        />
      </div>
      <div className="mt-4">
        <SchoolPartChartCard
          title="학교별 지원 현황"
          footerStatus={isRecruiting ? "모집 중" : undefined}
          schools={chartSchools}
        />
      </div>
    </div>
  )
}
