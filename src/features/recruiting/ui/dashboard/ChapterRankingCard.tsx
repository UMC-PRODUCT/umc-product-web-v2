import { GraphTooltip } from "@/features/recruiting/ui/dashboard/PartBreakdownTooltip"
import { cn } from "@/shared/lib/utils"

import type { PartBreakdown } from "@/features/recruiting/model/parts"

// 지부 목록은 서버 응답에서 오므로 개수와 이름을 카드가 가정하지 않는다.
// 지부별 값(count/compareCount/breakdown)을 Record 세 개로 나눠 받으면 키를
// 서로 맞춰야 해서, 지부 하나가 한 항목인 배열로 합쳐 받는다.
interface ChapterDatum {
  chapterId: string
  chapterName: string
  count: number
  // 평가 현황처럼 배경 막대로 겹쳐 보여줄 비교값(예: 지원자 수).
  // compareLabels 가 있을 때만 쓰인다.
  compareCount?: number
  // 호버 툴팁용 파트 상세. 있으면 그 막대에 툴팁을 붙인다.
  breakdown?: PartBreakdown
}

interface ChapterRankingCardProps {
  title: string
  chapters: ChapterDatum[]
  // 절대 기준(예: 100% = 100명)을 쓸 때만 전달. 생략하면 최댓값 기준 상대 그래프.
  total?: number
  // 비교 막대의 범례. 전달하면 compareCount 를 배경 막대로 렌더한다.
  compareLabels?: {
    primaryLabel: string
    compareLabel: string
  }
  // 툴팁 하단 모집 상태(예: "모집 중", "추가 모집 중"). 없으면 미표기.
  footerStatus?: string
}

// 카드 폭에서 나온 값이다. 막대(82px) + 간격(10px) 기준으로 10개가 한계고
// 11개부터 카드 밖으로 넘친다(막대가 shrink-0 이라 줄어들지 않는다).
// 이름 그대로 랭킹 카드라 count 내림차순 상위 10개만 보여준다. 지부가 그보다
// 많으면 나머지는 표시되지 않으므로, 전수 확인이 필요한 화면에는 쓰지 않는다.
const MAX_CHAPTERS = 10
const GRID_HEIGHT_PX = 200
const FILLED_MIN_HEIGHT_PX = 28
const SLIVER_MIN_HEIGHT_PX = 2
const SLIVER_MAX_HEIGHT_PX = 26
const COMPARE_MIN_HEIGHT_PX = 32

type ColorTier = 1 | 2 | 3 | 4

interface ChapterBar extends ChapterDatum {
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

function buildBars(chapters: ChapterDatum[]): ChapterBar[] {
  const sorted = [...chapters]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.chapterName.localeCompare(b.chapterName, "ko")
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
  chapters,
  total,
  compareLabels,
  footerStatus,
}: ChapterRankingCardProps) {
  const bars = buildBars(chapters)
  const base =
    total ??
    Math.max(
      ...bars.map((bar) => bar.count),
      ...(compareLabels ? bars.map((bar) => bar.compareCount ?? 0) : []),
      0,
    )

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 h-85 w-263 rounded-xl border bg-white px-8 pt-7 pb-8">
      <div className="flex h-70 flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-heading-6-semibold text-teal-700">{title}</p>
          {compareLabels && (
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
                  {compareLabels.primaryLabel}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-teal-gray-200 size-2.5 shrink-0 rounded-full" />
                <p className="text-caption-1-medium text-teal-gray-700 whitespace-nowrap">
                  {compareLabels.compareLabel}
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

          {compareLabels && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-58 items-end gap-2.5 px-2.5">
              {bars.map((bar) => {
                const compareCount = bar.compareCount ?? 0
                // 만약 지원자가 없다면 지원현황의 default 그래프처럼 보이도록 한다.
                return (
                  <div
                    key={bar.chapterId}
                    className="bg-teal-gray-100 w-20.5 shrink-0 rounded-t-md"
                    style={{
                      height:
                        compareCount > 0
                          ? Math.min(
                              Math.max(
                                barHeightPx(compareCount, base),
                                COMPARE_MIN_HEIGHT_PX,
                              ),
                              GRID_HEIGHT_PX,
                            )
                          : 0,
                    }}
                  />
                )
              })}
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

            const chapterBreakdown = bar.breakdown

            return (
              <div
                key={bar.chapterId}
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
                      {bar.chapterName}
                    </p>
                  </div>
                )}

                {variant === "sliver" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-end gap-1">
                    <p className="text-label-3-bold w-full truncate px-2 pt-1 text-center text-teal-500">
                      {bar.chapterName}
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
                      {bar.chapterName}
                    </p>
                    <div className="h-px w-full rounded-t-sm bg-teal-200" />
                  </div>
                )}

                {chapterBreakdown && (
                  /* 세모 꼭지점을 이 막대의 세로 중앙(바닥에서 barPixelHeight/2),
                     막대 정중앙(컬럼 중앙)에 맞추고 본체는 아래로 내린다. */
                  <GraphTooltip
                    name={bar.chapterName}
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
