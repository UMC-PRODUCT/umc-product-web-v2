import { cn } from "@/shared/lib/utils"

import type { CSSProperties } from "react"

import type { PartKey } from "@/features/recruiting/ui/dashboard/PartDistributionCard"

// 파트별 상세: 지원 수(applied)는 항상, 평가 수(evaluated)는 평가현황에서만.
// evaluated가 하나라도 있으면 평가 모드로 렌더한다.
export type PartBreakdown = Record<
  PartKey,
  { applied: number; evaluated?: number }
>

const PARTS: { key: PartKey; label: string; dot: string }[] = [
  { key: "pm", label: "PM", dot: "rgb(167, 108, 222)" },
  { key: "design", label: "Design", dot: "rgb(226, 107, 167)" },
  { key: "webPe", label: "Web PE", dot: "rgb(216, 178, 77)" },
  { key: "mobilePe", label: "Mobile PE", dot: "rgb(110, 143, 245)" },
]

interface PartBreakdownTooltipContentProps {
  name: string
  breakdown: PartBreakdown
  // 지부/학교의 모집 상태. 있으면 하단에 표기(예: "모집 중", "추가 모집 중").
  footerStatus?: string
}

function PartDot({ color }: { color: string }) {
  return (
    <span
      className="size-[7px] shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

// 그래프 막대의 호버 툴팁. 부모 컬럼에 `group`을 주고 이 컴포넌트를 컬럼 안에
// 절대 배치한다. 세모는 위를 향하고(꼭지점=앵커), 본체는 앵커 아래로 내려온다.
// 앵커 위치는 카드가 className/style로 지정한다.
export function GraphTooltip({
  className,
  style,
  ...contentProps
}: PartBreakdownTooltipContentProps & {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      style={style}
      className={cn(
        // 그림자는 세모+박스 전체에 filter로 건다(박스에만 걸면 흰 세모가 흰
        // 배경에서 안 보임). Figma Shadow/Drop/Neutral_1 값.
        "pointer-events-none absolute z-50 hidden flex-col items-center drop-shadow-[0px_4px_8px_rgba(64,68,67,0.16)] group-hover:flex",
        className,
      )}
    >
      {/* 위를 향한 흰 세모(16x8). 꼭지점이 앵커 지점. */}
      <div className="size-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-white" />
      <div className="w-fit rounded-[6px] bg-white px-3 py-2">
        <PartBreakdownTooltipContent {...contentProps} />
      </div>
    </div>
  )
}

function PartBreakdownTooltipContent({
  name,
  breakdown,
  footerStatus,
}: PartBreakdownTooltipContentProps) {
  const isEvaluation = PARTS.some(
    (part) => breakdown[part.key].evaluated !== undefined,
  )
  const appliedTotal = PARTS.reduce(
    (sum, part) => sum + breakdown[part.key].applied,
    0,
  )
  const evaluatedTotal = PARTS.reduce(
    (sum, part) => sum + (breakdown[part.key].evaluated ?? 0),
    0,
  )

  return (
    <div
      className={cn(
        "flex flex-col text-left",
        isEvaluation ? "gap-2" : "gap-0.5",
      )}
    >
      <div className={cn("flex w-full flex-col", isEvaluation && "gap-px")}>
        <p className="text-caption-3-bold text-teal-gray-400">{name}</p>
        {isEvaluation ? (
          <div className="flex items-baseline gap-1">
            <p className="text-caption-3-bold whitespace-nowrap text-teal-500">
              {evaluatedTotal.toLocaleString()}명 평가 완료
            </p>
            <p className="text-caption-3-medium text-teal-gray-400 whitespace-nowrap">
              / {appliedTotal.toLocaleString()}명 지원
            </p>
          </div>
        ) : (
          <p className="text-caption-3-bold whitespace-nowrap text-teal-500">
            총 {appliedTotal.toLocaleString()}명 지원
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-0.5">
        {PARTS.map((part) => {
          const { applied, evaluated } = breakdown[part.key]
          return (
            <div
              key={part.key}
              className={cn(
                "flex items-center",
                isEvaluation ? "w-full justify-between gap-2" : "gap-1",
              )}
            >
              <div className="flex items-center gap-1">
                <PartDot color={part.dot} />
                <p className="text-caption-3-regular text-teal-gray-700 whitespace-nowrap">
                  {part.label}
                </p>
              </div>
              {isEvaluation ? (
                <div className="text-caption-3-regular flex items-center gap-0.75 whitespace-nowrap">
                  <span className="text-teal-gray-700">
                    {(evaluated ?? 0).toLocaleString()}명
                  </span>
                  <span className="text-teal-gray-300">/</span>
                  <span className="text-teal-gray-400">
                    {applied.toLocaleString()}명
                  </span>
                </div>
              ) : (
                <p className="text-caption-3-regular text-teal-gray-700 whitespace-nowrap">
                  {applied.toLocaleString()}명
                </p>
              )}
            </div>
          )
        })}
      </div>

      {footerStatus && (
        <p className="text-caption-3-medium text-teal-gray-400 whitespace-nowrap">
          {footerStatus}
        </p>
      )}
    </div>
  )
}
