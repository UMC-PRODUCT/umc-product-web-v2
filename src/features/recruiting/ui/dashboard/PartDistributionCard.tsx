import { useState } from "react"

import { PARTS } from "@/features/recruiting/model/parts"
import { cn } from "@/shared/lib/utils"

import type { PartKey } from "@/features/recruiting/model/parts"

// 호버 강조 불투명도: 디자인 파트만 70%, 나머지는 80%.
function hoverOpacity(key: PartKey): number {
  return key === "design" ? 0.7 : 0.8
}

type PartValue =
  | { type: "application"; count: number }
  | { type: "evaluation"; count: number; total: number }

interface PartDistributionCardProps {
  title: string
  values: Record<PartKey, PartValue>
}

// 도넛 기하: 142px 프레임을 꽉 채우는 도넛(외경 ~142, stroke 24, 내경 반경 ~47).
// 세그먼트 사이 4px 간격. (실측: 외경 반경 71 / 내경 반경 47 / 두께 24)
const DONUT_SIZE = 142
const DONUT_CENTER = DONUT_SIZE / 2
const RING_RADIUS = 59
const RING_WIDTH = 24
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const SEGMENT_GAP = 4

function PartValueLabel({ value }: { value: PartValue }) {
  if (value.type === "application") {
    return (
      <p className="text-subtitle-3-semibold text-teal-500">
        {value.count.toLocaleString()}
        <span className="text-body-1-medium">명</span>
      </p>
    )
  }

  return (
    <div className="flex items-center gap-1 text-[16px] whitespace-nowrap">
      <p className="text-subtitle-3-semibold text-teal-500">
        {value.count.toLocaleString()}
        <span className="text-body-1-medium">명</span>
      </p>
      <p className="text-teal-gray-300">/</p>
      <p className="text-label-1-medium text-teal-gray-400">
        {value.total.toLocaleString()}명 지원
      </p>
    </div>
  )
}

export function PartDistributionCard({
  title,
  values,
}: PartDistributionCardProps) {
  const [hoveredKey, setHoveredKey] = useState<PartKey | null>(null)

  // 평가현황(evaluation)은 "N명/M명 지원" 표기가 더 길어서 카드 폭 자체가
  // 피그마에서 412px(지원현황) vs 480px(평가현황)로 다르게 정의되어 있음.
  const isEvaluation = PARTS.some(
    (part) => values[part.key].type === "evaluation",
  )

  const total = PARTS.reduce((sum, part) => sum + values[part.key].count, 0)

  // 각 파트의 도넛 호(arc)를 누적 시작 위치와 함께 계산. 값 0인 파트는 제외.
  let cursor = 0
  const segments = PARTS.map((part) => {
    const count = values[part.key].count
    const arc = total > 0 ? (count / total) * RING_CIRCUMFERENCE : 0
    const start = cursor
    cursor += arc
    return { part, count, arc, start }
  }).filter((segment) => segment.count > 0)

  const hoveredPart = PARTS.find((part) => part.key === hoveredKey)
  const hoveredPercentage =
    hoveredKey && total > 0
      ? Math.round((values[hoveredKey].count / total) * 100)
      : 0

  return (
    <div
      className={cn(
        "border-teal-gray-100 shadow-drop-neutral-3 flex h-70 flex-col gap-6 rounded-xl border bg-white px-8 py-7",
        isEvaluation ? "w-120" : "w-103",
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-heading-6-semibold text-teal-700">{title}</h3>
        {/* 도넛은 어느 화면에서든 total(= count 합)을 100%로 둔 파트 구성비다.
            평가현황의 count 는 평가 완료 수라 기준이 지원자 수가 아니다. */}
        <p className="text-label-2-medium text-teal-gray-500">
          {isEvaluation ? "전체 평가 완료 수 대비" : "전체 지원자 수 대비"}
        </p>
      </div>

      <div className="flex items-center gap-9">
        <div className="relative size-35.5 shrink-0">
          <svg
            viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
            className="size-full -rotate-90"
          >
            {total === 0 ? (
              // 빈 상태: 얇은 회색 링
              <circle
                cx={DONUT_CENTER}
                cy={DONUT_CENTER}
                r={RING_RADIUS + RING_WIDTH / 2 - 4}
                fill="none"
                stroke="var(--color-teal-gray-150)"
                strokeWidth={8}
              />
            ) : (
              segments.map(({ part, arc, start }) => {
                const hovered = hoveredKey === part.key
                const dash = Math.max(arc - SEGMENT_GAP, 0.001)
                return (
                  <circle
                    key={part.key}
                    cx={DONUT_CENTER}
                    cy={DONUT_CENTER}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={hovered ? part.chip500 : part.chip300}
                    strokeOpacity={hovered ? hoverOpacity(part.key) : 1}
                    strokeWidth={RING_WIDTH}
                    strokeDasharray={`${dash} ${RING_CIRCUMFERENCE - dash}`}
                    strokeDashoffset={-(start + SEGMENT_GAP / 2)}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredKey(part.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  />
                )
              })
            )}
          </svg>

          {total > 0 && (
            // 링 위에 겹치지만 호버 이벤트는 아래 SVG 세그먼트로 통과시켜야 함.
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              {hoveredPart ? (
                <div className="text-teal-gray-800 flex flex-col items-center justify-center">
                  <p className="text-label-3-semibold -mb-0.5">
                    {hoveredPart.label}
                  </p>
                  <div className="flex items-center gap-px pl-1">
                    <p className="text-heading-4-semibold">
                      {hoveredPercentage}
                    </p>
                    <p className="text-heading-6-semibold">%</p>
                  </div>
                </div>
              ) : (
                <p className="text-label-3-semibold text-teal-gray-400">
                  마우스를 올려
                  <br />% 확인하세요
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {PARTS.map((part) => (
            <div
              key={part.key}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: part.chip300 }}
                />
                <p className="text-body-1-medium text-teal-gray-800 w-18">
                  {part.label}
                </p>
              </div>
              <PartValueLabel value={values[part.key]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
