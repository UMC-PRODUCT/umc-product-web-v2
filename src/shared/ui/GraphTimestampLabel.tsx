import { cn } from "@/shared/lib/utils"

interface GraphTimestampLabelProps {
  date: string
  time: string
  className?: string
}

// 그래프/대시보드의 "기준 시각" 라벨. 예: "26-07-04 02:48 기준"
export function GraphTimestampLabel({
  date,
  time,
  className,
}: GraphTimestampLabelProps) {
  return (
    <div
      className={cn(
        "text-body-1-regular text-teal-gray-400 flex items-center gap-0.5 whitespace-nowrap",
        className,
      )}
    >
      <span className="flex items-center gap-1">
        <span>{date}</span>
        <span>{time}</span>
      </span>
      <span>기준</span>
    </div>
  )
}
