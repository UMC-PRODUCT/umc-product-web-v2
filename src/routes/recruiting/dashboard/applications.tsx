import { createFileRoute } from "@tanstack/react-router"

import { getServerErrorMessage } from "@/features/recruiting/api/errors"
import { useApplicationStatusSummary } from "@/features/recruiting/hooks/useApplicationStatusSummary"
import {
  formatAppliedAtParts,
  formatBaseTime,
} from "@/features/recruiting/model/applicantListTypes"
import {
  countSchools,
  groupByChapter,
} from "@/features/recruiting/model/applicationStats"
import { ChapterRankingCard } from "@/features/recruiting/ui/dashboard/ChapterRankingCard"
import { PartDistributionCard } from "@/features/recruiting/ui/dashboard/PartDistributionCard"
import { SchoolListCard } from "@/features/recruiting/ui/dashboard/SchoolListCard"
import { SchoolPartChartCard } from "@/features/recruiting/ui/dashboard/SchoolPartChartCard"
import { StatCard } from "@/features/recruiting/ui/dashboard/StatCard"
import { shortenSchoolName } from "@/shared/lib/formatSchoolName"
import { GraphTimestampLabel } from "@/shared/ui/GraphTimestampLabel"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/dashboard/applications")({
  component: RouteComponent,
})

// TODO: 서버 summary 에 track(파트)별 집계가 없어 파트 관련 카드는 목업을 유지한다.
// countByTrack 이 추가되면 MOCK_PART_VALUES 와 MOCK_SCHOOL_PART_ROWS 를 삭제한다.
const MOCK_PART_VALUES = {
  pm: { type: "application", count: 5 },
  design: { type: "application", count: 25 },
  webPe: { type: "application", count: 0 },
  mobilePe: { type: "application", count: 70 },
} as const

const MOCK_SCHOOL_PART_ROWS = [
  {
    chapterId: "29",
    chapterName: "Chromium",
    name: "광운대",
    counts: { pm: 40, design: 30, webPe: 20, mobilePe: 10 },
  },
  {
    chapterId: "29",
    chapterName: "Chromium",
    name: "서울여대",
    counts: { pm: 12, design: 8, webPe: 5, mobilePe: 3 },
  },
  {
    chapterId: "30",
    chapterName: "Ferrum",
    name: "동국대",
    counts: { pm: 22, design: 18, webPe: 14, mobilePe: 9 },
  },
  {
    chapterId: "30",
    chapterName: "Ferrum",
    name: "이화여대",
    counts: { pm: 8, design: 15, webPe: 4, mobilePe: 6 },
  },
  {
    chapterId: "27",
    chapterName: "Neon",
    name: "가천대",
    counts: { pm: 30, design: 25, webPe: 20, mobilePe: 15 },
  },
  {
    chapterId: "27",
    chapterName: "Neon",
    name: "인하대",
    counts: { pm: 18, design: 10, webPe: 6, mobilePe: 4 },
  },
  {
    chapterId: "31",
    chapterName: "Platinum",
    name: "동아대",
    counts: { pm: 11, design: 9, webPe: 7, mobilePe: 4 },
  },
  {
    chapterId: "32",
    chapterName: "Selenium",
    name: "숭실대",
    counts: { pm: 20, design: 16, webPe: 12, mobilePe: 8 },
  },
  {
    chapterId: "28",
    chapterName: "Xenon",
    name: "중앙대",
    counts: { pm: 16, design: 14, webPe: 9, mobilePe: 6 },
  },
]

function EmptyNotice({ message }: { message: string }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
      {message}
    </div>
  )
}

function RouteComponent() {
  const { data, isLoading, isError, error, dataUpdatedAt } =
    useApplicationStatusSummary()

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

  if (isError || !data) {
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
        <PartDistributionCard
          title="파트별 지원 현황"
          values={MOCK_PART_VALUES}
        />
        {/* 마지막 카드 위 8px에 기준 시각 라벨(우측 정렬). absolute라 카드 정렬엔 영향 없음. */}
        <div className="relative flex">
          <GraphTimestampLabel
            date={graphAsOfDate ?? ""}
            time={graphAsOfTime ?? ""}
            className="absolute right-0 bottom-full mb-2"
          />
          <SchoolListCard
            totalCount={countSchools(data)}
            chapters={chapterGroups.map((group) => ({
              chapterId: group.chapterId,
              chapterName: group.chapterName,
              // 서버는 정식 명칭("가천대학교")을 주는데 카드가 2열 좁은 그리드라 줄여 쓴다.
              schools: group.schools.map((school) =>
                shortenSchoolName(school.schoolName),
              ),
            }))}
          />
        </div>
      </div>
      <div className="mt-4">
        {/* TODO: breakdown(파트별 툴팁)은 서버 countByTrack 이 없어 생략한다. */}
        <ChapterRankingCard
          title="지부별 지원 현황"
          chapters={chapterGroups.map((group) => ({
            chapterId: group.chapterId,
            chapterName: group.chapterName,
            count: group.totalCount,
          }))}
          footerStatus="모집 중"
        />
      </div>
      <div className="mt-4">
        <SchoolPartChartCard
          title="학교별 지원 현황"
          footerStatus="모집 중"
          schools={MOCK_SCHOOL_PART_ROWS}
        />
      </div>
    </div>
  )
}
