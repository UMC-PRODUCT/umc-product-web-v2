import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/shared/lib/utils"

import { toSlotKey } from "../../model/interviewSchedule"
import { DraggableApplicantChip } from "./DraggableApplicantChip"

import type { InterviewApplicant } from "../../model/interviewSchedule"

interface DroppableSlotRowProps {
  sessionId: string
  slot: { start: string; end: string }
  applicant: InterviewApplicant | undefined
}

export function DroppableSlotRow({
  sessionId,
  slot,
  applicant,
}: DroppableSlotRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: toSlotKey(sessionId, slot.start),
  })

  return (
    <div className="flex items-center gap-5">
      <span className="text-body-2-regular text-teal-gray-600 w-27 shrink-0">
        {slot.start} ~ {slot.end}
      </span>
      <div
        ref={setNodeRef}
        className={cn(
          "flex h-10 flex-1 items-center rounded-[10px] border px-2 transition-colors",
          applicant
            ? "border-teal-gray-200 bg-white"
            : "border-teal-gray-200 border-dashed bg-white",
          isOver && "border-teal-400 bg-teal-50",
        )}
      >
        {applicant ? (
          <DraggableApplicantChip applicant={applicant} compact />
        ) : (
          <span className="text-body-2-regular text-teal-gray-300 pl-2">
            드래그하세요
          </span>
        )}
      </div>
    </div>
  )
}
