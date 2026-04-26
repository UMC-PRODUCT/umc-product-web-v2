import { cn } from "@/shared/lib/utils"

interface DonutChartProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function DonutChart({
  percentage,
  size = 142,
  strokeWidth = 14,
  className,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2
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
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-teal-500)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center gap-px">
        <span className="text-[1.625rem] leading-[1.3] font-semibold text-teal-600">
          {percentage}
        </span>
        <span className="text-[1.25rem] leading-[1.4] font-semibold tracking-[-0.02em] text-teal-600">
          %
        </span>
      </div>
    </div>
  )
}
