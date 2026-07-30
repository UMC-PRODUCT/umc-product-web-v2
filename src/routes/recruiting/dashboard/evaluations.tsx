import { createFileRoute } from "@tanstack/react-router"

import { getServerErrorMessage } from "@/features/recruiting/api/errors"
import { useEvaluationStatistics } from "@/features/recruiting/hooks/useEvaluationStatistics"
import { useRecruitingProgress } from "@/features/recruiting/hooks/useRecruitingProgress"
import { formatBaseTime } from "@/features/recruiting/model/applicantListTypes"
import {
  toApplicantCountsByPart,
  toChapterCompletions,
  toChapterEvaluationBars,
  toCompletionPercentage,
  toEvaluatedCountsByPart,
  toSchoolEvaluationBars,
} from "@/features/recruiting/model/evaluationStats"
import { ChapterRankingCard } from "@/features/recruiting/ui/dashboard/ChapterRankingCard"
import { EvaluationCompletionCard } from "@/features/recruiting/ui/dashboard/EvaluationCompletionCard"
import { PartDistributionCard } from "@/features/recruiting/ui/dashboard/PartDistributionCard"
import { SchoolPartChartCard } from "@/features/recruiting/ui/dashboard/SchoolPartChartCard"
import { StatCard } from "@/features/recruiting/ui/dashboard/StatCard"
import { shortenSchoolName } from "@/shared/lib/formatSchoolName"
import { GraphTimestampLabel } from "@/shared/ui/GraphTimestampLabel"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import type { PartKey } from "@/features/recruiting/model/parts"

export const Route = createFileRoute("/recruiting/dashboard/evaluations")({
  component: RouteComponent,
})

function EmptyNotice({ message }: { message: string }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
      {message}
    </div>
  )
}

function RouteComponent() {
  const { data, isLoading, isError, error } = useEvaluationStatistics()
  const { isAdditionalRecruiting } = useRecruitingProgress()

  const header = (
    <PageLabel
      breadcrumb={[
        { id: "recruiting", label: "리크루팅" },
        { id: "dashboard", label: "대시보드" },
        { id: "evaluations", label: "평가 현황" },
      ]}
      title="평가 현황"
      description="지부별, 학교별, 파트별 평가 현황을 실시간으로 확인합니다."
    />
  )

  if (isLoading) {
    return (
      <div>
        {header}
        <EmptyNotice message="평가 현황을 불러오는 중입니다." />
      </div>
    )
  }

  if (isError || !data) {
    // 권한 부족처럼 원인이 확정된 실패는 서버 문구를 그대로 보여준다.
    const message =
      getServerErrorMessage(error) ??
      "평가 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
    return (
      <div>
        {header}
        <EmptyNotice message={message} />
      </div>
    )
  }

  // 지원 현황과 달리 서버가 asOf(집계 기준 시각)를 준다. 없을 때만 조회 시각으로
  // 대체한다. 평가 완료 카드는 비율 footer 라 날짜를 쓰지 않고, 그래프 기준 시각
  // 라벨만 "26-07-04 02:48" 형식으로 표기한다.
  const asOf = data.asOf ? new Date(data.asOf) : new Date()
  const [graphAsOfDate, graphAsOfTime] = formatBaseTime(asOf).split(" ")

  const overallPercentage = toCompletionPercentage(
    data.evaluatedCount,
    data.applicantCount,
  )
  // 파트 도넛은 평가 완료 수(분자)와 지원자 수(분모)를 함께 받는다.
  const evaluated = toEvaluatedCountsByPart(data.byTrack)
  const applicants = toApplicantCountsByPart(data.byTrack)
  const partValues: Record<
    PartKey,
    { type: "evaluation"; count: number; total: number }
  > = {
    pm: { type: "evaluation", count: evaluated.pm, total: applicants.pm },
    design: {
      type: "evaluation",
      count: evaluated.design,
      total: applicants.design,
    },
    webPe: {
      type: "evaluation",
      count: evaluated.webPe,
      total: applicants.webPe,
    },
    mobilePe: {
      type: "evaluation",
      count: evaluated.mobilePe,
      total: applicants.mobilePe,
    },
  }

  const chartSchools = toSchoolEvaluationBars(data).map((school) => ({
    ...school,
    name: shortenSchoolName(school.name),
  }))

  return (
    <div>
      {header}
      <div className="mt-8 flex gap-4">
        <StatCard
          title={"평가 완료"}
          count={data.evaluatedCount}
          footer={{
            type: "ratio",
            totalCount: data.applicantCount,
          }}
        />
        <EvaluationCompletionCard
          overallPercentage={overallPercentage}
          chapters={toChapterCompletions(data)}
        />
        {/* 마지막 카드 위 8px에 기준 시각 라벨(우측 정렬). absolute라 카드 정렬엔 영향 없음. */}
        <div className="relative flex">
          <GraphTimestampLabel
            date={graphAsOfDate ?? ""}
            time={graphAsOfTime ?? ""}
            className="absolute right-0 bottom-full mb-2"
          />
          <PartDistributionCard
            title="파트별 평가 완료 현황"
            values={partValues}
          />
        </div>
      </div>
      <div className="mt-4">
        <ChapterRankingCard
          title="지부별 평가 현황"
          chapters={toChapterEvaluationBars(data)}
          compareLabels={{
            primaryLabel: "평가 완료",
            compareLabel: "지원자 수",
          }}
          footerStatus={isAdditionalRecruiting ? "추가 모집 중" : undefined}
        />
      </div>
      <div className="mt-4">
        <SchoolPartChartCard
          title="학교별 평가 현황"
          footerStatus={isAdditionalRecruiting ? "추가 모집 중" : undefined}
          schools={chartSchools}
        />
      </div>
    </div>
  )
}
