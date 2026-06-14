/** [모집 중], [모집 완료] tag chip */
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const recruitStatusChipVariants = cva(
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

interface RecruitStatusChipProps {
  done: boolean
  size?: "default" | "md"
  className?: string
}

export function RecruitStatusChip({
  done,
  size = "default",
  className,
}: RecruitStatusChipProps) {
  return (
    <span
      className={cn(
        recruitStatusChipVariants({ size }),
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
