import { cn } from "@/shared/lib/utils"

import {
  EVALUATION_PROGRESS_LABEL,
  type EvaluationProgress,
} from "../model/applicantListTypes"

const PROGRESS_STYLE: Record<EvaluationProgress, string> = {
  before: "bg-teal-gray-150 text-teal-gray-600",
  inProgress: "bg-warning-100 text-warning-600",
  done: "bg-teal-100 text-teal-600",
}

interface EvaluationStatusChipProps {
  progress: EvaluationProgress
  className?: string
}

export function EvaluationStatusChip({
  progress,
  className,
}: EvaluationStatusChipProps) {
  return (
    <span
      className={cn(
        "text-label-2-medium inline-flex h-6 min-w-14 items-center justify-center rounded-[6px] px-2 py-0.5 whitespace-nowrap",
        "drop-shadow-[0px_4px_8px_rgba(239,240,240,0.3)]",
        PROGRESS_STYLE[progress],
        className,
      )}
    >
      {EVALUATION_PROGRESS_LABEL[progress]}
    </span>
  )
}
