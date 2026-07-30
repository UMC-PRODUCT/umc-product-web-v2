import { useDraggable } from "@dnd-kit/core"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { cn } from "@/shared/lib/utils"

import type { InterviewApplicant } from "../../model/interviewSchedule"

interface DraggableApplicantChipProps {
  applicant: InterviewApplicant
  compact?: boolean
}

export function DraggableApplicantChip({
  applicant,
  compact = false,
}: DraggableApplicantChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: applicant.id,
    data: applicant,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex w-full cursor-grab items-center gap-2 rounded-[8px] bg-teal-50 px-2.5 py-1.5 select-none active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <HamburgerIcon className="size-4 shrink-0 text-teal-600" />
      <span className="text-subtitle-2-medium shrink-0 text-teal-700">
        {applicant.name}
      </span>
      {!compact && applicant.availabilities.length > 0 && (
        <span className="text-label-1-medium text-teal-gray-400 truncate">
          {applicant.availabilities.join(" | ")}
        </span>
      )}
    </div>
  )
}
