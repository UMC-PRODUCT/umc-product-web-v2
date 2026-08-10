import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/shared/lib/utils"

import { DraggableApplicantChip } from "./DraggableApplicantChip"

import type { InterviewApplicant } from "../../model/interviewSchedule"

export const APPLICANT_POOL_ID = "applicant-pool"

interface ApplicantPoolPanelProps {
  totalCount: number
  waiting: InterviewApplicant[]
  assignedCount: number
}

export function ApplicantPoolPanel({
  totalCount,
  waiting,
  assignedCount,
}: ApplicantPoolPanelProps) {
  const { setNodeRef, isOver } = useDroppable({ id: APPLICANT_POOL_ID })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shadow-drop-neutral-3 border-teal-gray-100 flex w-70 shrink-0 flex-col gap-5 rounded-[12px] border bg-white px-6 py-7 transition-colors",
        isOver && "border-teal-400 bg-teal-50/40",
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-heading-6-semibold text-teal-gray-800">
          지원자 목록
        </span>
        <span className="text-body-2-regular text-teal-gray-400">
          총 {totalCount}명
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-body-2-medium text-teal-gray-600">
          배정 대기 중 {waiting.length}
        </span>
        {waiting.length === 0 ? (
          <p className="text-label-1-medium text-teal-gray-400 py-4 text-center">
            모든 지원자를 배정했습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {waiting.map((applicant) => (
              <DraggableApplicantChip
                key={applicant.id}
                applicant={applicant}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-teal-gray-100 border-t pt-4">
        <span className="text-body-2-medium text-teal-gray-600">
          배정 완료 {assignedCount}
        </span>
      </div>
    </div>
  )
}
