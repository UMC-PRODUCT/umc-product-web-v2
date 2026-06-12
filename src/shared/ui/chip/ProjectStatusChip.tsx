import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

import type { ProjectStatus } from "@/features/project/list/api/matchingProject"

const projectStatusChipVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-center text-body-3-medium",
)

const STATUS_CHIP: Partial<
  Record<ProjectStatus, { label: string; className: string }>
> = {
  IN_PROGRESS: { label: "공개됨", className: "bg-teal-100 text-teal-600" },
  PENDING_REVIEW: {
    label: "검토 대기",
    className: "bg-error-100 text-error-500",
  },
}

interface ProjectStatusChipProps {
  status?: ProjectStatus
  className?: string
}

export function ProjectStatusChip({
  status,
  className,
}: ProjectStatusChipProps) {
  const chip = status ? STATUS_CHIP[status] : undefined
  if (!chip) return null

  return (
    <span
      className={cn(projectStatusChipVariants(), chip.className, className)}
    >
      {chip.label}
    </span>
  )
}
