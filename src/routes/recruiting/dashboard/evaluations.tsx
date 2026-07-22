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

function RouteComponent() {
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
          chapters={{
            Chromium: { count: 80, percentage: 100 },
            Ferrum: { count: 64, percentage: 80 },
            Neon: { count: 112, percentage: 100 },
            Platinum: { count: 40, percentage: 100 },
            Selenium: { count: 0, percentage: 0 },
            Xenon: { count: 92, percentage: 80 },
          }}
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
          counts={{
            Chromium: 80,
            Ferrum: 51,
            Neon: 112,
            Platinum: 40,
            Selenium: 0,
            Xenon: 74,
          }}
          compare={{
            counts: {
              Chromium: 80,
              Ferrum: 64,
              Neon: 112,
              Platinum: 40,
              Selenium: 0,
              Xenon: 92,
            },
            primaryLabel: "평가 완료",
            compareLabel: "지원자 수",
          }}
          footerStatus="추가 모집 중"
          breakdowns={{
            Chromium: {
              pm: { evaluated: 20, applied: 20 },
              design: { evaluated: 25, applied: 25 },
              webPe: { evaluated: 20, applied: 20 },
              mobilePe: { evaluated: 15, applied: 15 },
            },
            Ferrum: {
              pm: { evaluated: 18, applied: 22 },
              design: { evaluated: 14, applied: 18 },
              webPe: { evaluated: 11, applied: 14 },
              mobilePe: { evaluated: 8, applied: 10 },
            },
            Neon: {
              pm: { evaluated: 40, applied: 40 },
              design: { evaluated: 32, applied: 32 },
              webPe: { evaluated: 22, applied: 22 },
              mobilePe: { evaluated: 18, applied: 18 },
            },
            Platinum: {
              pm: { evaluated: 14, applied: 14 },
              design: { evaluated: 12, applied: 12 },
              webPe: { evaluated: 9, applied: 9 },
              mobilePe: { evaluated: 5, applied: 5 },
            },
            Selenium: {
              pm: { evaluated: 0, applied: 0 },
              design: { evaluated: 0, applied: 0 },
              webPe: { evaluated: 0, applied: 0 },
              mobilePe: { evaluated: 0, applied: 0 },
            },
            Xenon: {
              pm: { evaluated: 28, applied: 34 },
              design: { evaluated: 20, applied: 26 },
              webPe: { evaluated: 14, applied: 18 },
              mobilePe: { evaluated: 12, applied: 14 },
            },
          }}
        />
      </div>
      <div className="mt-4">
        <SchoolPartChartCard
          title="학교별 평가 현황"
          footerStatus="추가 모집 중"
          schools={[
            {
              chapter: "Chromium",
              name: "광운대",
              counts: { pm: 12, design: 8, webPe: 5, mobilePe: 2 },
              applicants: { pm: 38, design: 28, webPe: 18, mobilePe: 8 },
            },
            {
              chapter: "Chromium",
              name: "서울여대",
              counts: { pm: 3, design: 2, webPe: 1, mobilePe: 0 },
              applicants: { pm: 10, design: 6, webPe: 4, mobilePe: 2 },
            },
            {
              chapter: "Ferrum",
              name: "동국대",
              counts: { pm: 8, design: 6, webPe: 4, mobilePe: 2 },
              applicants: { pm: 20, design: 16, webPe: 12, mobilePe: 7 },
            },
            {
              chapter: "Ferrum",
              name: "이화여대",
              counts: { pm: 2, design: 5, webPe: 1, mobilePe: 2 },
              applicants: { pm: 6, design: 12, webPe: 3, mobilePe: 5 },
            },
            {
              chapter: "Ferrum",
              name: "홍익대 서울",
              counts: { pm: 4, design: 3, webPe: 1, mobilePe: 0 },
              applicants: { pm: 9, design: 6, webPe: 2, mobilePe: 1 },
            },
            {
              chapter: "Neon",
              name: "가천대",
              counts: { pm: 10, design: 8, webPe: 6, mobilePe: 4 },
              applicants: { pm: 28, design: 22, webPe: 18, mobilePe: 12 },
            },
            {
              chapter: "Neon",
              name: "숙명여대",
              counts: { pm: 5, design: 4, webPe: 2, mobilePe: 1 },
              applicants: { pm: 12, design: 10, webPe: 6, mobilePe: 4 },
            },
            {
              chapter: "Neon",
              name: "한국항공대",
              counts: { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
              applicants: { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
            },
            {
              chapter: "Platinum",
              name: "동아대",
              counts: { pm: 4, design: 3, webPe: 2, mobilePe: 1 },
              applicants: { pm: 9, design: 7, webPe: 5, mobilePe: 3 },
            },
            {
              chapter: "Xenon",
              name: "중앙대",
              counts: { pm: 6, design: 5, webPe: 3, mobilePe: 2 },
              applicants: { pm: 14, design: 12, webPe: 8, mobilePe: 5 },
            },
            {
              chapter: "Xenon",
              name: "한성대",
              counts: { pm: 1, design: 0, webPe: 0, mobilePe: 0 },
              applicants: { pm: 2, design: 1, webPe: 1, mobilePe: 0 },
            },
          ]}
        />
      </div>
    </div>
  )
}
