import { cn } from "@/shared/lib/utils"

interface DonutChartProps {
  percentage: number
  size?: number
  trackWidth?: number
  progressWidth?: number
  className?: string
}

export function DonutChart({
  percentage,
  size = 142,
  trackWidth = 8,
  progressWidth = 20,
  className,
}: DonutChartProps) {
  const radius = (size - Math.max(trackWidth, progressWidth)) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (percentage / 100) * circumference
  const gap = circumference - filled

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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-teal-gray-150)"
          strokeWidth={trackWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-teal-400)"
          strokeWidth={progressWidth}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center gap-px pl-0.5">
        <span className="text-[1.625rem] leading-[1.3] font-semibold text-teal-600">
          {percentage}
        </span>
        <span className="text-[1.25rem] leading-[1.4] font-semibold tracking-[-0.01em] text-teal-600">
          %
        </span>
      </div>
    </div>
  )
}
