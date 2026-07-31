import { useDraggable } from "@dnd-kit/core"
import { forwardRef } from "react"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { cn } from "@/shared/lib/utils"

import type { InterviewApplicant } from "../../model/interviewSchedule"

interface ApplicantChipProps extends React.HTMLAttributes<HTMLDivElement> {
  applicant: InterviewApplicant
  compact?: boolean
  dragging?: boolean
}

// 표시 전용. DragOverlay 는 이것을 쓴다 — 오버레이에서 useDraggable 을 다시
// 부르면 같은 DndContext 안에 같은 id 가 두 번 등록된다.
export const ApplicantChip = forwardRef<HTMLDivElement, ApplicantChipProps>(
  function ApplicantChip(
    { applicant, compact = false, dragging = false, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "flex w-full cursor-grab items-center gap-2 rounded-[8px] bg-teal-50 px-2.5 py-1.5 select-none active:cursor-grabbing",
          dragging && "opacity-40",
          className,
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
  },
)

export function DraggableApplicantChip({
  applicant,
  compact = false,
}: {
  applicant: InterviewApplicant
  compact?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: applicant.id,
    data: applicant,
  })

  return (
    <ApplicantChip
      ref={setNodeRef}
      applicant={applicant}
      compact={compact}
      dragging={isDragging}
      {...listeners}
      {...attributes}
    />
  )
}
