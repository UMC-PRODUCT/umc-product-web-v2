import { cn } from "@/shared/lib/utils"

interface TimestampLabelProps {
  date: string
  time: string
  action: string
  className?: string
}

export function TimestampLabel({
  date,
  time,
  action,
  className,
}: TimestampLabelProps) {
  return (
    <span
      className={cn(
        "text-body-2-regular inline-flex items-center gap-1.5 whitespace-nowrap",
        className,
      )}
    >
      <span className="text-teal-gray-900 inline-flex w-20 items-center gap-1">
        <span>{date}</span>
        <span>{time}</span>
      </span>
      <span className="text-teal-gray-600">{action}</span>
    </span>
  )
}
