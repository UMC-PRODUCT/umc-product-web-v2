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
    <div
      ref={setNodeRef}
      className="border-teal-gray-100 shadow-drop-neutral-3 box-border flex w-70 flex-col gap-[23px] rounded-[12px] border bg-white px-8 py-7"
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-heading-6-semibold text-teal-700">{schoolName}</p>
        <p className="text-body-2-regular text-teal-gray-500">
          드래그 앤 드롭으로 이동할 수 있습니다
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <p className="text-body-2-regular text-teal-gray-500">교내 운영진</p>

        <div className="flex flex-col gap-4">
          {staffList.map((staff) => (
            <DraggableStaffChip key={staff.id} staff={staff} />
          ))}
        </div>
      </div>
    </div>
  )
}
