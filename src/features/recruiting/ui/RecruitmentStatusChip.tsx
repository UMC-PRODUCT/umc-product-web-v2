/** [모집 중], [마감] tag chip (리크루팅 도메인 전용 워딩) */
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const recruitmentStatusChipVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-center",
  {
    variants: {
      size: {
        default: "text-body-3-medium",
        md: "h-6 text-label-2-medium",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

interface RecruitmentStatusChipProps {
  done: boolean
  size?: "default" | "md"
  className?: string
}

export function RecruitmentStatusChip({
  done,
  size = "default",
  className,
}: RecruitmentStatusChipProps) {
  return (
    <span
      className={cn(
        recruitmentStatusChipVariants({ size }),
        done
          ? "bg-teal-gray-150 text-teal-gray-600"
          : "bg-teal-100 text-teal-600",
        className,
      )}
    >
      {done ? "마감" : "모집 중"}
    </span>
  )
}
