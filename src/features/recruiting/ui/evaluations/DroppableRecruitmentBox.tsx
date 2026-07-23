import { useDroppable } from "@dnd-kit/core"

import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"

import { AssignedStaffChip } from "./AssignedStaffChip"

import type { Staff } from "../../model/evaluatorAllocation"

interface DroppableRecruitmentBoxProps {
  id: string
  assignedEvaluators: Staff[]
  selectedChipId: string | null
  onSelectChip: (id: string | null) => void
  onClear: () => void
}

export function DroppableRecruitmentBox({
  id,
  assignedEvaluators,
  selectedChipId,
  onSelectChip,
  onClear,
}: DroppableRecruitmentBoxProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="shadow-drop-neutral-3 border-teal-gray-100 box-border flex h-68.5 w-full flex-col gap-5 rounded-[12px] border bg-white px-8 pt-7 pb-7.5"
    >
      <div className="flex h-19 w-full justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-heading-6-semibold text-teal-700">
              정규 모집
            </span>
            <span className="text-heading-6-semibold text-teal-gray-800">
              평가 담당자
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="text-body-2-regular text-teal-gray-400">
                서류 모집 마감: 2026-07-07 12:00
              </p>
              <div className="bg-teal-gray-200 h-3 w-[1px] rounded-[0.5px]" />
              <p className="text-body-2-regular text-teal-gray-400">
                결과 발표: 2026-07-07 12:00
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-body-2-regular text-teal-gray-400">
                면접 진행 기간: 2026-07-07 12:00 ~ 2026-07-07 12:00
              </p>
              <div className="bg-teal-gray-200 h-3 w-[1px] rounded-[0.5px]" />
              <p className="text-body-2-regular text-teal-gray-400">
                결과 발표: 2026-07-07 12:00
              </p>
            </div>
          </div>
        </div>

        <div className="pt-[15px] pb-[27px]">
          <button
            onClick={onClear}
            className="hover:shadow-inner-neutral-2 flex h-8.5 items-center gap-1 rounded-[10px] bg-white py-1 pr-3 pl-2.5"
          >
            <ResetIcon className="h-4 w-4" />
            <span className="text-label-1-medium text-teal-gray-700">
              비우기
            </span>
          </button>
        </div>
      </div>

      {assignedEvaluators.length === 0 ? (
        <div className="flex flex-1 items-center justify-center overflow-y-auto">
          <span className="text-body-2-medium text-teal-gray-400">
            배정된 평가 담당자가 없습니다.
          </span>
        </div>
      ) : (
        <div className="flex flex-1 flex-wrap content-start gap-3 overflow-y-auto">
          {assignedEvaluators.map((staff) => (
            <AssignedStaffChip
              key={staff.id}
              staff={staff}
              isSelected={selectedChipId === staff.id}
              onSelect={onSelectChip}
            />
          ))}
        </div>
      )}
    </div>
  )
}
