import { useDroppable } from "@dnd-kit/core"

import { SchoolChip } from "./SchoolChip"

import type { School } from "../model/chapterManagement"

interface SchoolListPanelProps {
  title?: string
  schoolList: School[]
  assignedSchoolList?: School[]
}

export function SchoolListPanel({
  title = "UMC 참여 학교",
  schoolList,
  assignedSchoolList = [],
}: SchoolListPanelProps) {
  const { setNodeRef } = useDroppable({ id: "unassigned-schools-panel" })
  const totalCount = schoolList.length + assignedSchoolList.length

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 box-border flex w-70 shrink-0 flex-col gap-[23px] rounded-[12px] border bg-white px-8 py-7">
      <div className="flex flex-col gap-0.5">
        <p className="text-heading-6-semibold text-teal-700">{title}</p>
        <p className="text-body-2-regular text-teal-gray-500">
          총 {totalCount}개 학교
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {/* 배정 대기 중인 학교 영역 (unassigned-schools-panel droppable) */}
        <div ref={setNodeRef} className="flex min-h-16 flex-col gap-2.5">
          <div className="flex items-center gap-1">
            <p className="text-body-2-regular text-teal-gray-500">
              배정 대기 중인 학교
            </p>
            <span className="text-body-2-medium text-teal-600">
              {schoolList.length}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {schoolList.length === 0 ? (
              <p className="text-body-2-medium text-teal-gray-400">
                대기 중인 학교가 없습니다.
              </p>
            ) : (
              schoolList.map((school) => (
                <SchoolChip
                  key={school.id}
                  dragId={`waiting-${school.id}`}
                  school={school}
                  variant="waiting"
                  draggable={true}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-teal-gray-200 h-px w-full" />

        {/* 배정된 학교 영역 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1">
            <p className="text-body-2-regular text-teal-gray-500">
              배정된 학교
            </p>
            <span className="text-body-2-medium text-teal-600">
              {assignedSchoolList.length}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {assignedSchoolList.length === 0 ? (
              <p className="text-body-2-medium text-teal-gray-400">
                배정된 학교가 없습니다.
              </p>
            ) : (
              assignedSchoolList.map((school) => (
                <SchoolChip
                  key={school.id}
                  dragId={`panel-assigned-${school.id}`}
                  school={school}
                  variant="assigned"
                  draggable={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
