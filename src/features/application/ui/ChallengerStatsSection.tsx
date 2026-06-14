import PersonGraphicIcon from "@/shared/assets/icon/people/PersonGraphicIcon"
import { cn } from "@/shared/lib/utils"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"

import { RankBar } from "./RankBar"
import { RoundDonutChart } from "./RoundDonutChart"

import type { ChallengerStats } from "../model/types"

const ROUND_COLORS = [
  "#81D3C9",
  "var(--color-teal-100)",
  "var(--color-teal-gray-50)",
] as const

interface ChallengerStatsSectionProps {
  stats: ChallengerStats
  className?: string
}

export function ChallengerStatsSection({
  stats,
  className,
}: ChallengerStatsSectionProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <QuestionItemTitle index="01" title="내 프로젝트 지원 통계" />

      <div className="flex gap-4">
        {/* 매칭 차수별 지원률 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 relative h-70 w-102 shrink-0 overflow-hidden rounded-xl border bg-white">
          <h3 className="text-heading-6-semibold absolute top-7 left-8 text-teal-700">
            매칭 차수별 지원률
          </h3>

          {/* 도넛 차트 (차수별 3세그먼트) */}
          <div className="absolute top-20.5 left-9">
            <RoundDonutChart
              percentage={stats.completionRate}
              segments={stats.rounds.map((r, i) => ({
                value: r.applied,
                color: ROUND_COLORS[i] ?? ROUND_COLORS[0]!,
              }))}
              size={142}
            />
          </div>

          {/* 커넥터 라인 (도넛 -> 1차 범례) */}
          <svg
            width="40"
            height="12"
            viewBox="0 0 40 12"
            fill="none"
            className="absolute top-22.5 left-40"
          >
            <path
              d="M0.353342 10.8125L-0.000214756 11.166L0.706886 11.8731L1.06044 11.5196L0.706892 11.166L0.353342 10.8125ZM9.20703 2.66602V2.16602H8.99993L8.85348 2.31246L9.20703 2.66602ZM34.1654 2.66602C34.1654 4.13877 35.3593 5.33268 36.832 5.33268C38.3048 5.33268 39.4987 4.13877 39.4987 2.66602C39.4987 1.19326 38.3048 -0.000651121 36.832 -0.000651121C35.3593 -0.000651121 34.1654 1.19326 34.1654 2.66602ZM0.706892 11.166L1.06044 11.5196L9.56058 3.01957L9.20703 2.66602L8.85348 2.31246L0.353342 10.8125L0.706892 11.166ZM9.20703 2.66602V3.16602H36.832V2.66602V2.16602H9.20703V2.66602Z"
              fill="#63C4B8"
            />
          </svg>

          {/* 우측 범례: 1차 17명 / 2차 2명 */}
          <div className="absolute top-20.5 left-53.25 flex w-27.5 flex-col gap-0.5">
            {stats.rounds.slice(0, 2).map((r) => (
              <div
                key={r.round}
                className="flex items-center justify-between px-0.5"
              >
                <span className="text-subtitle-3-semibold text-teal-gray-800 w-7">
                  {r.round}차
                </span>
                <div className="flex items-center gap-px whitespace-nowrap">
                  <span className="text-subtitle-3-semibold text-teal-500">
                    {r.applied}
                  </span>
                  <span className="text-subtitle-3-semibold text-teal-500">
                    명
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 차수별 breakdown */}
          <div className="bg-stats-breakdown absolute right-7.5 bottom-8 w-44.5 rounded px-3.5 py-3">
            <div className="flex flex-col gap-1.25 text-[12px]">
              {stats.rounds.map((r) => (
                <div key={r.round} className="flex items-center gap-7">
                  <div className="text-body-3-medium text-teal-gray-600 flex items-center gap-0.75 leading-normal">
                    <span className="w-4.5">{r.round}차</span>
                    <span className="whitespace-nowrap">지원</span>
                  </div>
                  <div className="flex w-20 items-center justify-end gap-2 leading-[1.4]">
                    <span className="text-label-3-semibold whitespace-nowrap text-teal-500">
                      {r.applied}명
                    </span>
                    <div className="text-label-4-medium text-teal-gray-500 flex items-center justify-end gap-0.5">
                      <span>/</span>
                      <span className="w-8">{r.total}명</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1차 매칭 지원 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 flex w-121 shrink-0 flex-col gap-9.5 rounded-xl border bg-white px-8 pt-7 pb-8">
          <div className="flex items-center justify-between px-2.5">
            <h3 className="text-heading-6-semibold text-teal-700">
              1차 매칭 지원
            </h3>
            <div className="flex items-center gap-2.5">
              <PersonGraphicIcon
                width={24}
                height={24}
                className="shrink-0 text-teal-500"
              />
              <div className="flex items-center gap-1 text-teal-700">
                <span className="text-heading-7-semibold">지원자</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-heading-6-semibold font-bold">
                    {stats.totalApplicants}
                  </span>
                  <span className="text-heading-6-semibold">명</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2.5 px-2.5">
            {stats.universities.map((uni, i) => {
              const rank = Math.min(i + 1, 5) as 1 | 2 | 3 | 4 | 5
              const maxCount = stats.universities[0]?.count ?? 1
              const isLastBar = i === stats.universities.length - 1
              const minHeight =
                stats.universities.length <= 3 && isLastBar ? 5 : 30
              const heightPx =
                maxCount > 0
                  ? Math.max(
                      minHeight,
                      Math.round((uni.count / maxCount) * 120),
                    )
                  : minHeight
              return (
                <RankBar
                  key={uni.name}
                  rank={rank}
                  count={uni.count}
                  label={uni.name}
                  heightPx={heightPx}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
