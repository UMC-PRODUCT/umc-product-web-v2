import PersonGraphicIcon from "@/shared/assets/icon/people/PersonGraphicIcon"
import { cn } from "@/shared/lib/utils"

import { ChartLegendLabel } from "./ChartLegendLabel"
import { DonutChart } from "./DonutChart"
import { ProjectRoundBar } from "./ProjectRoundBar"
import { RankBar } from "./RankBar"

import type { ApplicationStats } from "../model/types"

const ROUND_COLORS = [
  "var(--color-teal-500)",
  "var(--color-teal-400)",
  "var(--color-teal-200)",
] as const

const ROUND_LABELS = ["1차 지원", "2차 지원", "3차 지원"] as const

interface ApplicationStatsSectionProps {
  stats: ApplicationStats
  className?: string
}

export function ApplicationStatsSection({
  stats,
  className,
}: ApplicationStatsSectionProps) {
  const maxRoundValue = Math.max(
    ...stats.projectRounds.flatMap((p) => p.rounds),
    1,
  )

  const round1 = stats.rounds[0]
  const round1Rate = round1
    ? Math.round((round1.applied / round1.total) * 100)
    : 0
  const round1Pending = round1 ? round1.total - round1.applied : 0

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-heading-6-semibold text-teal-700">01 지원 통계</h2>
        <span className="text-caption-1-regular text-teal-gray-400">
          26.04.24 04:48 기준
        </span>
      </div>

      {/* 3열 통계 카드 */}
      <div className="flex gap-4">
        {/* 좌: 1차 매칭 지원 현황 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 relative h-[280px] w-[408px] shrink-0 overflow-hidden rounded-lg border bg-white">
          <h3 className="text-heading-6-semibold absolute top-7 left-8 text-teal-700">
            1차 매칭 지원 현황
          </h3>

          <div className="absolute top-[82px] left-9">
            <DonutChart percentage={round1Rate} size={142} />
          </div>

          {/* 지원 완료/전 */}
          <div className="absolute top-[82px] left-[213px] flex flex-col gap-0.5">
            <div className="flex items-center gap-3.5">
              <span className="text-subtitle-3-semibold text-teal-gray-800 w-[60px]">
                지원 완료
              </span>
              <span className="text-subtitle-3-semibold text-teal-500">
                {round1?.applied ?? 0}
                <span className="text-subtitle-3-semibold">명</span>
              </span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-subtitle-3-semibold text-teal-gray-800 w-[60px]">
                지원 전
              </span>
              <span className="text-subtitle-3-semibold text-error-600">
                {round1Pending}
                <span className="text-subtitle-3-semibold">명</span>
              </span>
            </div>
          </div>

          {/* 하단 1차 지원 요약 */}
          <div className="bg-teal-gray-50/80 absolute bottom-5 left-[200px] rounded px-3.5 py-3">
            <div className="flex items-center gap-7">
              <span className="text-body-3-medium text-teal-gray-600">
                1차 지원
              </span>
              <div className="flex items-center gap-2 text-[0.75rem] leading-[1.4]">
                <span className="text-label-3-semibold text-teal-500">
                  {round1?.applied ?? 0}명
                </span>
                <span className="text-label-4-medium text-teal-gray-500">
                  / {round1?.total ?? 0}명
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 중: 1차 매칭 지원 Top 4 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 flex flex-1 flex-col rounded-lg border bg-white px-8 pt-7 pb-8">
          <h3 className="text-heading-6-semibold text-teal-700">
            1차 매칭 지원 Top 4
          </h3>
          <div className="mt-10 flex items-end gap-2.5 px-2.5">
            {stats.topProjects.slice(0, 4).map((project, i) => {
              const rank = (i + 1) as 1 | 2 | 3 | 4
              const maxCount = stats.topProjects[0]?.count ?? 1
              const heightPx = Math.max(
                40,
                Math.round((project.count / maxCount) * 120),
              )
              return (
                <RankBar
                  key={project.name}
                  rank={rank}
                  count={project.count}
                  label={project.name}
                  heightPx={heightPx}
                />
              )
            })}
          </div>
        </div>

        {/* 우: 총원 N명 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 flex w-[210px] shrink-0 flex-col rounded-lg border bg-white px-6 pt-7 pb-8">
          <div className="flex items-center gap-2.5">
            <PersonGraphicIcon
              width={30}
              height={30}
              className="shrink-0 text-teal-500"
            />
            <div className="flex items-center gap-1">
              <span className="text-heading-7-semibold text-teal-700">
                총원
              </span>
              <span className="text-heading-6-semibold text-teal-700">
                {stats.totalMembers}
              </span>
              <span className="text-heading-6-semibold text-teal-700">명</span>
            </div>
          </div>

          <div className="mt-[37px] flex flex-col gap-3">
            {stats.universities.map((u) => (
              <div key={u.name} className="flex items-center justify-between">
                <span className="text-body-2-medium text-teal-gray-600">
                  {u.name}
                </span>
                <div className="flex items-center gap-1 text-[0.75rem] leading-[1.4]">
                  <span className="text-label-3-semibold text-teal-500">
                    {String(u.applied).padStart(2, "0")}명
                  </span>
                  <span className="text-label-4-medium text-teal-gray-500">
                    / {u.total}명
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 프로젝트별 지원 현황 */}
      <div className="flex flex-col gap-4 px-8 pt-7">
        <div className="flex items-center justify-between">
          <h3 className="text-heading-6-semibold text-teal-700">
            프로젝트별 지원 현황
          </h3>
          <div className="flex items-center gap-2">
            {ROUND_LABELS.map((label, i) => (
              <ChartLegendLabel
                key={label}
                color={ROUND_COLORS[i]}
                label={label}
              />
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1.5 overflow-x-auto pb-2">
          {stats.projectRounds.map((project) => (
            <ProjectRoundBar
              key={project.name}
              projectName={project.name}
              rounds={project.rounds}
              maxValue={maxRoundValue}
              maxHeightPx={100}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
