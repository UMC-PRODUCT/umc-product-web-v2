import { createFileRoute } from "@tanstack/react-router"

import { ChapterRankingCard } from "@/features/recruiting/ui/dashboard/ChapterRankingCard"
import { PartDistributionCard } from "@/features/recruiting/ui/dashboard/PartDistributionCard"
import { SchoolListCard } from "@/features/recruiting/ui/dashboard/SchoolListCard"
import { SchoolPartChartCard } from "@/features/recruiting/ui/dashboard/SchoolPartChartCard"
import { StatCard } from "@/features/recruiting/ui/dashboard/StatCard"
import { GraphTimestampLabel } from "@/shared/ui/GraphTimestampLabel"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/dashboard/applications")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "dashboard", label: "대시보드" },
          { id: "applications", label: "지원 현황" },
        ]}
        title="지원 현황"
        description="지부별, 학교별, 파트별 지원 현황을 실시간으로 확인합니다."
      />
      <div className="mt-8 flex gap-4">
        <StatCard
          title={"총 지원자"}
          count={1000}
          footer={{
            type: "timestamp",
            date: "07/02",
            time: "02:48",
          }}
        />
        <PartDistributionCard
          title="파트별 지원 현황"
          values={{
            pm: { type: "application", count: 5 },
            design: { type: "application", count: 25 },
            webPe: { type: "application", count: 0 },
            mobilePe: { type: "application", count: 70 },
          }}
        />
        {/* 마지막 카드 위 8px에 기준 시각 라벨(우측 정렬). absolute라 카드 정렬엔 영향 없음. */}
        <div className="relative flex">
          <GraphTimestampLabel
            date="26-07-04"
            time="02:48"
            className="absolute right-0 bottom-full mb-2"
          />
          <SchoolListCard
            totalCount={27}
            schoolsByChapter={{
              Chromium: [
                "광운대",
                "동양미래대",
                "서울여대",
                "한국외대",
                "한국공학대",
              ],
              Ferrum: ["동국대", "이화여대", "홍익대 서울", "홍익대 세종"],
              Neon: ["가천대", "동덕여대", "숙명여대", "인하대", "한국항공대"],
              Platinum: ["동아대", "영남대", "인제대"],
              Selenium: [
                "숭실대",
                "서경대",
                "성신여대",
                "안양대",
                "한양대 ERICA",
              ],
              Xenon: ["가톨릭대", "단국대", "덕성여대", "중앙대", "한성대"],
            }}
          />
        </div>
      </div>
      <div className="mt-4">
        <ChapterRankingCard
          title="지부별 지원 현황"
          counts={{
            Chromium: 80,
            Ferrum: 45,
            Neon: 22,
            Platinum: 10,
            Selenium: 3,
            Xenon: 0,
          }}
          footerStatus="모집 중"
          breakdowns={{
            Chromium: {
              pm: { applied: 30 },
              design: { applied: 25 },
              webPe: { applied: 15 },
              mobilePe: { applied: 10 },
            },
            Ferrum: {
              pm: { applied: 18 },
              design: { applied: 12 },
              webPe: { applied: 9 },
              mobilePe: { applied: 6 },
            },
            Neon: {
              pm: { applied: 8 },
              design: { applied: 7 },
              webPe: { applied: 4 },
              mobilePe: { applied: 3 },
            },
            Platinum: {
              pm: { applied: 4 },
              design: { applied: 3 },
              webPe: { applied: 2 },
              mobilePe: { applied: 1 },
            },
            Selenium: {
              pm: { applied: 2 },
              design: { applied: 1 },
              webPe: { applied: 0 },
              mobilePe: { applied: 0 },
            },
            Xenon: {
              pm: { applied: 0 },
              design: { applied: 0 },
              webPe: { applied: 0 },
              mobilePe: { applied: 0 },
            },
          }}
        />
      </div>
      <div className="mt-4">
        <SchoolPartChartCard
          title="학교별 지원 현황"
          footerStatus="모집 중"
          schools={[
            {
              chapter: "Chromium",
              name: "광운대",
              counts: { pm: 40, design: 30, webPe: 20, mobilePe: 10 },
            },
            {
              chapter: "Chromium",
              name: "서울여대",
              counts: { pm: 12, design: 8, webPe: 5, mobilePe: 3 },
            },
            {
              chapter: "Chromium",
              name: "한국공학대",
              counts: { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
            },
            {
              chapter: "Ferrum",
              name: "동국대",
              counts: { pm: 22, design: 18, webPe: 14, mobilePe: 9 },
            },
            {
              chapter: "Ferrum",
              name: "이화여대",
              counts: { pm: 8, design: 15, webPe: 4, mobilePe: 6 },
            },
            {
              chapter: "Ferrum",
              name: "홍익대 서울",
              counts: { pm: 10, design: 7, webPe: 3, mobilePe: 2 },
            },
            {
              chapter: "Ferrum",
              name: "홍익대 세종",
              counts: { pm: 5, design: 4, webPe: 2, mobilePe: 1 },
            },
            {
              chapter: "Neon",
              name: "가천대",
              counts: { pm: 30, design: 25, webPe: 20, mobilePe: 15 },
            },
            {
              chapter: "Neon",
              name: "동덕여대",
              counts: { pm: 6, design: 5, webPe: 4, mobilePe: 3 },
            },
            {
              chapter: "Neon",
              name: "숙명여대",
              counts: { pm: 14, design: 12, webPe: 8, mobilePe: 5 },
            },
            {
              chapter: "Neon",
              name: "인하대",
              counts: { pm: 18, design: 10, webPe: 6, mobilePe: 4 },
            },
            {
              chapter: "Neon",
              name: "한국항공대",
              counts: { pm: 9, design: 7, webPe: 5, mobilePe: 2 },
            },
            {
              chapter: "Platinum",
              name: "동아대",
              counts: { pm: 11, design: 9, webPe: 7, mobilePe: 4 },
            },
            {
              chapter: "Platinum",
              name: "영남대",
              counts: { pm: 7, design: 6, webPe: 3, mobilePe: 2 },
            },
            {
              chapter: "Platinum",
              name: "인제대",
              counts: { pm: 4, design: 3, webPe: 2, mobilePe: 1 },
            },
            {
              chapter: "Selenium",
              name: "숭실대",
              counts: { pm: 20, design: 16, webPe: 12, mobilePe: 8 },
            },
            {
              chapter: "Selenium",
              name: "한양대 ERICA",
              counts: { pm: 13, design: 11, webPe: 7, mobilePe: 5 },
            },
            {
              chapter: "Xenon",
              name: "중앙대",
              counts: { pm: 16, design: 14, webPe: 9, mobilePe: 6 },
            },
            {
              chapter: "Xenon",
              name: "한성대",
              counts: { pm: 3, design: 2, webPe: 1, mobilePe: 0 },
            },
          ]}
        />
      </div>
    </div>
  )
}
