import { useDroppable } from "@dnd-kit/core"

import {
  SCHOOL_STAFF_PANEL_ID,
  type Staff,
} from "../../model/evaluatorAllocation"
import { DraggableStaffChip } from "./DraggableStaffChip"

interface SchoolStaffPanelProps {
  schoolName: string
  staffList: Staff[]
}

export function SchoolStaffPanel({
  schoolName,
  staffList,
}: SchoolStaffPanelProps) {
  const { setNodeRef } = useDroppable({ id: SCHOOL_STAFF_PANEL_ID })

  return (
    // 운영진이 수백 명인 학교가 있다. 높이를 잡아 두지 않으면 명단이 그대로
    // 늘어나 페이지가 스무 배로 길어진다. 옆 공고 패널과 같이 안에서 스크롤한다.
    <div
      ref={setNodeRef}
      className="border-teal-gray-100 shadow-drop-neutral-3 box-border flex h-full max-h-full min-h-0 w-70 flex-col gap-[23px] rounded-[12px] border bg-white px-8 py-7"
    >
      <div className="flex shrink-0 flex-col gap-0.5">
        <p className="text-heading-6-semibold text-teal-700">{schoolName}</p>
        <p className="text-body-2-regular text-teal-gray-500">
          드래그 앤 드롭으로 이동할 수 있습니다
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5">
        <p className="text-body-2-regular text-teal-gray-500 shrink-0">
          교내 운영진
        </p>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {staffList.map((staff) => (
            <DraggableStaffChip key={staff.id} staff={staff} />
          ))}
        </div>
      </div>
    </div>
  )
}
