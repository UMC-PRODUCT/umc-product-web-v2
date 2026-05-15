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
  dataUpdatedAt?: number
  variant?: "application" | "matching"
  currentRound?: number
  className?: string
}

const VARIANT_LABELS = {
  application: {
    sectionTitle: "01 지원 통계",
    cardTitle: "N차 매칭 지원 현황",
    completedLabel: "지원 완료",
    pendingLabel: "지원 전",
    roundSuffix: "지원",
  },
  matching: {
    sectionTitle: "01 매칭 통계",
    cardTitle: "지부 프로젝트 매칭률",
    completedLabel: "매칭 완료",
    pendingLabel: "매칭 전",
    roundSuffix: "매칭",
  },
} as const

function formatUpdatedAt(timestamp?: number): string {
  if (!timestamp) return ""
  const d = new Date(timestamp)
  const yy = String(d.getFullYear()).slice(2)
  const MM = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const HH = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${yy}.${MM}.${dd} ${HH}:${mm} 기준`
}

export function ApplicationStatsSection({
  stats,
  dataUpdatedAt,
  variant = "application",
  currentRound = 1,
  className,
}: ApplicationStatsSectionProps) {
  const labels = VARIANT_LABELS[variant]
  const maxRoundValue = Math.max(
    ...stats.projectRounds.flatMap((p) => p.rounds),
    1,
  )

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-heading-6-semibold text-teal-700">
          {labels.sectionTitle}
        </h2>
        {dataUpdatedAt && (
          <span className="text-caption-1-regular text-teal-gray-400">
            {formatUpdatedAt(dataUpdatedAt)}
          </span>
        )}
      </div>

      {/* 3열 통계 카드 */}
      <div className="flex gap-4">
        {/* N차 매칭 지원 현황 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 relative h-70 w-102 shrink-0 overflow-hidden rounded-lg border bg-white">
          <h3 className="text-heading-6-semibold absolute top-7 left-8 text-teal-700">
            {labels.cardTitle}
          </h3>

          <div className="absolute top-20.5 left-9">
            <DonutChart percentage={stats.completionRate} size={142} />
          </div>

          {/* 지원 완료/전 */}
          <div className="absolute top-20.5 left-53.25 flex flex-col gap-0.5">
            <div className="flex items-center gap-3.5">
              <span className="text-subtitle-3-semibold text-teal-gray-800 w-15">
                {labels.completedLabel}
              </span>
              <span className="text-subtitle-3-semibold text-teal-500">
                {stats.completedCount}
                <span className="text-subtitle-3-semibold">명</span>
              </span>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="text-subtitle-3-semibold text-teal-gray-800 w-15">
                {labels.pendingLabel}
              </span>
              <span className="text-subtitle-3-semibold text-error-600">
                {stats.pendingCount}
                <span className="text-subtitle-3-semibold">명</span>
              </span>
            </div>
          </div>

          {/* 하단 차수별 지원 요약 */}
          <div
            className="absolute bottom-5 left-50 w-44.5 rounded px-3.5 py-3"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(246,247,247,0.5), rgba(246,247,247,0.5)), linear-gradient(90deg, #fbfcfc, #fbfcfc)",
            }}
          >
            <div className="flex flex-col gap-1.25 text-[12px]">
              {stats.rounds.map((r) => (
                <div key={r.round} className="flex items-center gap-7">
                  <div className="text-body-3-medium text-teal-gray-600 flex items-center gap-0.75 leading-[1.5]">
                    <span className="w-4.5">{r.round}차</span>
                    <span className="whitespace-nowrap">
                      {labels.roundSuffix}
                    </span>
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

        {/* 1차 매칭 지원 Top 4 */}
        <div className="shadow-drop-neutral-3 border-teal-gray-100 flex w-[402px] shrink-0 flex-col rounded-lg border bg-white px-8 pt-7 pb-8">
          <h3 className="text-heading-6-semibold text-teal-700">
            {currentRound}차 매칭 {labels.roundSuffix} Top 4
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
        <div className="shadow-drop-neutral-3 border-teal-gray-100 flex w-52.5 shrink-0 flex-col rounded-lg border bg-white px-6 pt-7 pb-8">
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

          <div className="mt-9.25 flex flex-col gap-3">
            {stats.universities.map((u) => (
              <div key={u.name} className="flex items-center justify-between">
                <span className="text-body-2-medium text-teal-gray-600">
                  {u.name}
                </span>
                <div className="flex items-center gap-1 text-[12px] leading-[1.4]">
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
                color={ROUND_COLORS[i]!}
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
