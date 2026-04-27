/** [모집 중], [모집 완료] tag chip */
import { cn } from "@/shared/lib/utils"

interface RecruitStatusChipProps {
  done: boolean
  className?: string
}

export function RecruitStatusChip({ done, className }: RecruitStatusChipProps) {
  return (
    <span
      className={cn(
        "text-label-2-medium shadow-drop-neutral-3 inline-flex h-6 items-center justify-center rounded-md px-2 py-0.5 text-center",
        done
          ? "bg-teal-gray-150 text-teal-gray-600"
          : "bg-teal-100 text-teal-600",
        className,
      )}
    >
      {done ? "모집 완료" : "모집 중"}
    </span>
  )
}
