import { cn } from "@/shared/lib/utils"

interface Segment {
  value: number
  color: string
}

interface RoundDonutChartProps {
  /** 각 차수별 세그먼트 (value: 지원자 수, color: CSS 색상) */
  segments: Segment[]
  /** 전체 퍼센티지 (중앙 텍스트 + 세그먼트 합산 비율로 사용) */
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}

const TRACK_COLOR = "var(--color-teal-gray-150)"

export function RoundDonutChart({
  segments,
  percentage,
  size = 142,
  strokeWidth = 28,
  className,
}: RoundDonutChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // 전체 채워진 비율 -> 각 세그먼트의 실제 길이 계산
  const totalValue = segments.reduce((sum, s) => sum + s.value, 0)
  const filledLength = (percentage / 100) * circumference

  // 세그먼트별 offset 계산
  let currentOffset = 0
  const segmentArcs = segments.map((seg) => {
    const ratio = totalValue > 0 ? seg.value / totalValue : 0
    const length = ratio * filledLength
    const offset = currentOffset
    currentOffset += length
    return { length, offset, color: seg.color }
  })

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* 트랙 (배경 원) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
        />
        {/* 차수별 세그먼트 (역순으로 그려서 1차가 맨 위) */}
        {segmentArcs
          .slice()
          .reverse()
          .map((arc, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.length + arc.offset} ${circumference - arc.length - arc.offset}`}
              strokeDashoffset={0}
            />
          ))}
      </svg>

      {/* 중앙 퍼센티지 (56x34) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-[34px] w-[56px] items-center justify-center gap-px">
          <span className="text-[1.375rem] leading-none font-semibold text-teal-600">
            {percentage}
          </span>
          <span className="text-[1rem] leading-none font-semibold text-teal-600">
            %
          </span>
        </div>
      </div>
    </div>
  )
}
