import { CHAPTERS } from "@/entities/organization/model/chapters"
import { GraphTooltip } from "@/features/recruiting/ui/dashboard/PartBreakdownTooltip"
import { cn } from "@/shared/lib/utils"

import type { Chapter } from "@/entities/organization/model/chapters"
import type { PartBreakdown } from "@/features/recruiting/ui/dashboard/PartBreakdownTooltip"

interface ChapterRankingCardProps {
  title: string
  counts: Record<Chapter, number>
  // 절대 기준(예: 100% = 100명)을 쓸 때만 전달. 생략하면 최댓값 기준 상대 그래프.
  total?: number
  // 평가 현황처럼 지원자 수 등 비교 데이터를 배경 막대로 겹쳐 보여줄 때만 전달.
  compare?: {
    counts: Record<Chapter, number>
    primaryLabel: string
    compareLabel: string
  }
  // 호버 툴팁용 지부별 파트 상세. 있으면 막대에 툴팁을 붙인다.
  breakdowns?: Record<Chapter, PartBreakdown>
  // 툴팁 하단 모집 상태(예: "모집 중", "추가 모집 중"). 없으면 미표기.
  footerStatus?: string
}

const MAX_CHAPTERS = 10
const GRID_HEIGHT_PX = 200
const FILLED_MIN_HEIGHT_PX = 28
const SLIVER_MIN_HEIGHT_PX = 2
const SLIVER_MAX_HEIGHT_PX = 26
const COMPARE_MIN_HEIGHT_PX = 32

type ColorTier = 1 | 2 | 3 | 4

interface ChapterBar {
  chapter: Chapter
  count: number
  colorTier: ColorTier
}

const FILLED_COLOR_CLASSNAME: Record<ColorTier, string> = {
  1: "bg-teal-500 text-white",
  2: "bg-teal-400 text-white",
  3: "bg-teal-300 text-teal-500",
  4: "bg-teal-200 text-teal-500",
}

// 범례의 4단 그라데이션 점: 진한 색(순위 1위)부터 옅은 색(4위 이하) 순서
const LEGEND_DOT_CLASSNAMES = [
  "bg-teal-500",
  "bg-teal-400",
  "bg-teal-300",
  "bg-teal-200",
]

function buildBars(counts: Record<Chapter, number>): ChapterBar[] {
  const sorted = [...CHAPTERS]
    .map((chapter) => ({ chapter, count: counts[chapter] }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.chapter.localeCompare(b.chapter)
    })
    .slice(0, MAX_CHAPTERS)

  const distinctCountsDesc = [
    ...new Set(sorted.map((entry) => entry.count).filter((count) => count > 0)),
  ].sort((a, b) => b - a)

  return sorted.map((entry) => {
    const rankIndex =
      entry.count > 0 ? distinctCountsDesc.indexOf(entry.count) : -1
    const colorTier: ColorTier =
      rankIndex === 0 ? 1 : rankIndex === 1 ? 2 : rankIndex === 2 ? 3 : 4
    return { ...entry, colorTier }
  })
}

function barHeightPx(count: number, base: number) {
  const percentage = base > 0 ? Math.min((count / base) * 100, 100) : 0
  return (percentage / 100) * GRID_HEIGHT_PX
}

export function ChapterRankingCard({
  title,
  counts,
  total,
  compare,
  breakdowns,
  footerStatus,
}: ChapterRankingCardProps) {
  const bars = buildBars(counts)
  const base =
    total ??
    Math.max(
      ...bars.map((bar) => bar.count),
      ...(compare ? bars.map((bar) => compare.counts[bar.chapter]) : []),
      0,
    )

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 h-85 w-263 rounded-xl border bg-white px-8 pt-7 pb-8">
      <div className="flex h-70 flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-heading-6-semibold text-teal-700">{title}</p>
          {compare && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="flex h-2.5 w-7.75 shrink-0 items-center">
                  {LEGEND_DOT_CLASSNAMES.map((dotClassName, index) => (
                    <span
                      key={index}
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        dotClassName,
                        index > 0 && "-ml-0.75",
                      )}
                    />
                  ))}
                </div>
                <p className="text-caption-1-medium text-teal-gray-700 whitespace-nowrap">
                  {compare.primaryLabel}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-teal-gray-200 size-2.5 shrink-0 rounded-full" />
                <p className="text-caption-1-medium text-teal-gray-700 whitespace-nowrap">
                  {compare.compareLabel}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex h-58 items-end gap-2.5 px-2.5">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-50 flex-col justify-between">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border-teal-gray-100 border-t" />
            ))}
          </div>

          {compare && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-58 items-end gap-2.5 px-2.5">
              {bars.map((bar) => (
                <div
                  key={bar.chapter}
                  className="bg-teal-gray-100 w-20.5 shrink-0 rounded-t-md"
                  style={{
                    height: Math.min(
                      Math.max(
                        barHeightPx(compare.counts[bar.chapter], base),
                        COMPARE_MIN_HEIGHT_PX,
                      ),
                      GRID_HEIGHT_PX,
                    ),
                  }}
                />
              ))}
            </div>
          )}

          {bars.map((bar) => {
            const heightPx = barHeightPx(bar.count, base)
            const variant =
              bar.count === 0
                ? "null"
                : heightPx < FILLED_MIN_HEIGHT_PX
                  ? "sliver"
                  : "filled"

            // 실제로 렌더되는 막대(색칠 영역)의 높이. 툴팁을 이 막대의 세로 중앙에 앵커한다.
            const barPixelHeight =
              variant === "filled"
                ? Math.min(
                    Math.max(heightPx, FILLED_MIN_HEIGHT_PX),
                    GRID_HEIGHT_PX,
                  )
                : variant === "sliver"
                  ? Math.min(
                      Math.max(heightPx, SLIVER_MIN_HEIGHT_PX),
                      SLIVER_MAX_HEIGHT_PX,
                    )
                  : 1

            const chapterBreakdown = breakdowns?.[bar.chapter]

            return (
              <div
                key={bar.chapter}
                className="group relative flex w-20.5 shrink-0 flex-col items-start justify-end gap-2.5"
              >
                <div className="flex items-end gap-px px-1">
                  <span className="text-[22px] leading-none font-bold tracking-[-0.44px] text-teal-600">
                    {bar.count.toLocaleString()}
                  </span>
                  <span className="pb-0.5 text-[12px] leading-none font-bold tracking-[-0.24px] text-teal-600">
                    명
                  </span>
                </div>

                {variant === "filled" && (
                  <div
                    className={cn(
                      "flex w-full flex-col items-start rounded-t-md px-2 pt-2",
                      FILLED_COLOR_CLASSNAME[bar.colorTier],
                    )}
                    style={{ height: barPixelHeight }}
                  >
                    <p className="text-label-3-bold w-full truncate">
                      {bar.chapter}
                    </p>
                  </div>
                )}

                {variant === "sliver" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-end gap-1">
                    <p className="text-label-3-bold w-full truncate px-2 pt-1 text-center text-teal-500">
                      {bar.chapter}
                    </p>
                    <div
                      className="w-full rounded-t-sm bg-teal-200"
                      style={{ height: barPixelHeight }}
                    />
                  </div>
                )}

                {variant === "null" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-end gap-1">
                    <p className="text-label-3-bold w-full truncate px-2 pt-1 text-center text-teal-500">
                      {bar.chapter}
                    </p>
                    <div className="h-px w-full rounded-t-sm bg-teal-200" />
                  </div>
                )}

                {chapterBreakdown && (
                  /* 세모 꼭지점을 이 막대의 세로 중앙(바닥에서 barPixelHeight/2),
                     막대 정중앙(컬럼 중앙)에 맞추고 본체는 아래로 내린다. */
                  <GraphTooltip
                    name={bar.chapter}
                    breakdown={chapterBreakdown}
                    footerStatus={footerStatus}
                    className="left-1/2 -translate-x-1/2"
                    style={{ top: `calc(100% - ${barPixelHeight / 2}px)` }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
