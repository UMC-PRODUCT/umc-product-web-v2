import { createFileRoute } from "@tanstack/react-router"

import { ChapterRankingCard } from "@/features/recruiting/ui/dashboard/ChapterRankingCard"
import { EvaluationCompletionCard } from "@/features/recruiting/ui/dashboard/EvaluationCompletionCard"
import { PartDistributionCard } from "@/features/recruiting/ui/dashboard/PartDistributionCard"
import { SchoolPartChartCard } from "@/features/recruiting/ui/dashboard/SchoolPartChartCard"
import { StatCard } from "@/features/recruiting/ui/dashboard/StatCard"
import { GraphTimestampLabel } from "@/shared/ui/GraphTimestampLabel"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/dashboard/evaluations")({
  component: RouteComponent,
})

// TODO: 평가 완료 집계 API 가 없어 전부 목업이다. 서버 스펙 확정 후 삭제.
// chapterId 는 dev/prod 의 실제 지부 id.
const MOCK_CHAPTERS = [
  { chapterId: "29", chapterName: "Chromium" },
  { chapterId: "30", chapterName: "Ferrum" },
  { chapterId: "27", chapterName: "Neon" },
  { chapterId: "31", chapterName: "Platinum" },
  { chapterId: "32", chapterName: "Selenium" },
  { chapterId: "28", chapterName: "Xenon" },
]

const MOCK_COMPLETION = [
  { count: 80, percentage: 100 },
  { count: 64, percentage: 80 },
  { count: 112, percentage: 100 },
  { count: 40, percentage: 100 },
  { count: 0, percentage: 0 },
  { count: 92, percentage: 80 },
]

// count = 평가 완료 수, compareCount = 지원자 수(배경 막대)
const MOCK_CHAPTER_RANKING = [
  { count: 80, compareCount: 80 },
  { count: 51, compareCount: 64 },
  { count: 112, compareCount: 112 },
  { count: 40, compareCount: 40 },
  { count: 0, compareCount: 0 },
  { count: 74, compareCount: 92 },
]

const MOCK_CHAPTER_BREAKDOWNS = [
  {
    pm: { evaluated: 20, applied: 20 },
    design: { evaluated: 25, applied: 25 },
    webPe: { evaluated: 20, applied: 20 },
    mobilePe: { evaluated: 15, applied: 15 },
  },
  {
    pm: { evaluated: 18, applied: 22 },
    design: { evaluated: 14, applied: 18 },
    webPe: { evaluated: 11, applied: 14 },
    mobilePe: { evaluated: 8, applied: 10 },
  },
  {
    pm: { evaluated: 40, applied: 40 },
    design: { evaluated: 32, applied: 32 },
    webPe: { evaluated: 22, applied: 22 },
    mobilePe: { evaluated: 18, applied: 18 },
  },
  {
    pm: { evaluated: 14, applied: 14 },
    design: { evaluated: 12, applied: 12 },
    webPe: { evaluated: 9, applied: 9 },
    mobilePe: { evaluated: 5, applied: 5 },
  },
  {
    pm: { evaluated: 0, applied: 0 },
    design: { evaluated: 0, applied: 0 },
    webPe: { evaluated: 0, applied: 0 },
    mobilePe: { evaluated: 0, applied: 0 },
  },
  {
    pm: { evaluated: 28, applied: 34 },
    design: { evaluated: 20, applied: 26 },
    webPe: { evaluated: 14, applied: 18 },
    mobilePe: { evaluated: 12, applied: 14 },
  },
]

const MOCK_SCHOOL_ROWS: {
  chapterName: string
  name: string
  counts: { pm: number; design: number; webPe: number; mobilePe: number }
  applicants: { pm: number; design: number; webPe: number; mobilePe: number }
}[] = [
  {
    chapterName: "Chromium",
    name: "광운대",
    counts: { pm: 12, design: 8, webPe: 5, mobilePe: 2 },
    applicants: { pm: 38, design: 28, webPe: 18, mobilePe: 8 },
  },
  {
    chapterName: "Chromium",
    name: "서울여대",
    counts: { pm: 3, design: 2, webPe: 1, mobilePe: 0 },
    applicants: { pm: 10, design: 6, webPe: 4, mobilePe: 2 },
  },
  {
    chapterName: "Ferrum",
    name: "동국대",
    counts: { pm: 8, design: 6, webPe: 4, mobilePe: 2 },
    applicants: { pm: 20, design: 16, webPe: 12, mobilePe: 7 },
  },
  {
    chapterName: "Ferrum",
    name: "이화여대",
    counts: { pm: 2, design: 5, webPe: 1, mobilePe: 2 },
    applicants: { pm: 6, design: 12, webPe: 3, mobilePe: 5 },
  },
  {
    chapterName: "Ferrum",
    name: "홍익대 서울",
    counts: { pm: 4, design: 3, webPe: 1, mobilePe: 0 },
    applicants: { pm: 9, design: 6, webPe: 2, mobilePe: 1 },
  },
  {
    chapterName: "Neon",
    name: "가천대",
    counts: { pm: 10, design: 8, webPe: 6, mobilePe: 4 },
    applicants: { pm: 28, design: 22, webPe: 18, mobilePe: 12 },
  },
  {
    chapterName: "Neon",
    name: "숙명여대",
    counts: { pm: 5, design: 4, webPe: 2, mobilePe: 1 },
    applicants: { pm: 12, design: 10, webPe: 6, mobilePe: 4 },
  },
  {
    chapterName: "Neon",
    name: "한국항공대",
    counts: { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
    applicants: { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
  },
  {
    chapterName: "Platinum",
    name: "동아대",
    counts: { pm: 4, design: 3, webPe: 2, mobilePe: 1 },
    applicants: { pm: 9, design: 7, webPe: 5, mobilePe: 3 },
  },
  {
    chapterName: "Xenon",
    name: "중앙대",
    counts: { pm: 6, design: 5, webPe: 3, mobilePe: 2 },
    applicants: { pm: 14, design: 12, webPe: 8, mobilePe: 5 },
  },
  {
    chapterName: "Xenon",
    name: "한성대",
    counts: { pm: 1, design: 0, webPe: 0, mobilePe: 0 },
    applicants: { pm: 2, design: 1, webPe: 1, mobilePe: 0 },
  },
]

const MOCK_CHAPTER_ID_BY_NAME = new Map(
  MOCK_CHAPTERS.map(({ chapterId, chapterName }) => [chapterName, chapterId]),
)

function RouteComponent() {
  const completionChapters = MOCK_CHAPTERS.map((chapter, index) => ({
    ...chapter,
    count: MOCK_COMPLETION[index]?.count ?? 0,
    percentage: MOCK_COMPLETION[index]?.percentage ?? 0,
  }))

  const rankingChapters = MOCK_CHAPTERS.map((chapter, index) => ({
    ...chapter,
    count: MOCK_CHAPTER_RANKING[index]?.count ?? 0,
    compareCount: MOCK_CHAPTER_RANKING[index]?.compareCount ?? 0,
    breakdown: MOCK_CHAPTER_BREAKDOWNS[index],
  }))

  const chartSchools = MOCK_SCHOOL_ROWS.map((row) => ({
    chapterId: MOCK_CHAPTER_ID_BY_NAME.get(row.chapterName) ?? row.chapterName,
    chapterName: row.chapterName,
    name: row.name,
    counts: row.counts,
    applicants: row.applicants,
  }))

  return (
    <div>
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "dashboard", label: "대시보드" },
          { id: "evaluations", label: "평가 현황" },
        ]}
        title="평가 현황"
        description="지부별, 학교별, 파트별 평가 현황을 실시간으로 확인합니다."
      />
      <div className="mt-8 flex gap-4">
        <StatCard
          title={"평가 완료"}
          count={1000}
          footer={{
            type: "ratio",
            totalCount: 1500,
          }}
        />
        <EvaluationCompletionCard
          overallPercentage={82}
          chapters={completionChapters}
        />
        {/* 마지막 카드 위 8px에 기준 시각 라벨(우측 정렬). absolute라 카드 정렬엔 영향 없음. */}
        <div className="relative flex">
          <GraphTimestampLabel
            date="26-07-04"
            time="02:48"
            className="absolute right-0 bottom-full mb-2"
          />
          <PartDistributionCard
            title="파트별 평가 완료 현황"
            values={{
              pm: { type: "evaluation", count: 10, total: 15 },
              design: { type: "evaluation", count: 20, total: 25 },
              webPe: { type: "evaluation", count: 0, total: 0 },
              mobilePe: { type: "evaluation", count: 35, total: 70 },
            }}
          />
        </div>
      </div>
      <div className="mt-4">
        <ChapterRankingCard
          title="지부별 평가 현황"
          chapters={rankingChapters}
          compareLabels={{
            primaryLabel: "평가 완료",
            compareLabel: "지원자 수",
          }}
          footerStatus="추가 모집 중"
        />
      </div>
      <div className="mt-4">
        <SchoolPartChartCard
          title="학교별 평가 현황"
          footerStatus="추가 모집 중"
          schools={chartSchools}
        />
      </div>
    </div>
  )
}
