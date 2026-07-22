import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useEffect, useState } from "react"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { SCHOOL_STAFF_LIST, type Staff } from "../../model/evaluatorAllocation"
import { DroppableRecruitmentBox } from "./DroppableRecruitmentBox"
import { EvaluatorSharedNote } from "./EvaluatorSharedNote"
import { SchoolStaffPanel } from "./SchoolStaffPanel"

export function EvaluatorAllocationPage() {
  const [assignedEvaluators, setAssignedEvaluators] = useState<Staff[]>([])
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null)
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (selectedChipId && (e.key === "Delete" || e.key === "Backspace")) {
        setAssignedEvaluators((prev) =>
          prev.filter((staff) => staff.id !== selectedChipId),
        )
        setSelectedChipId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedChipId])

  function handleDragStart(event: DragStartEvent) {
    const staff = event.active.data.current as Staff | undefined
    if (staff) {
      setActiveStaff(staff)
    }
  }

  function handleDragCancel() {
    setActiveStaff(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveStaff(null)

    if (over && over.id === "regular-recruitment-box") {
      const staff = active.data.current as Staff | undefined
      if (staff) {
        setAssignedEvaluators((prev) => {
          if (prev.some((item) => item.id === staff.id)) return prev
          return [...prev, staff]
        })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="flex w-full max-w-286.5 flex-col gap-8"
        onClick={() => setSelectedChipId(null)}
      >
        <PageLabel
          breadcrumb={[
            { id: "recruiting", label: "리크루팅" },
            { id: "evaluation-management", label: "평가 관리" },
            { id: "evaluator-assignment", label: "평가 담당자 배정" },
          ]}
          title="평가 담당자 배정"
          description="교내 운영진을 각 모집의 평가 담당자로 배정합니다."
          className="pl-3"
        />

        <div className="relative flex w-full flex-col gap-4">
          <div className="absolute -top-10.5 right-0.5 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAssignedEvaluators([])
                setSelectedChipId(null)
              }}
              className="border-teal-gray-400/15 box-border flex h-8.5 items-center gap-1 rounded-[10px] border bg-white px-3 py-1 pl-2.5"
            >
              <ResetIcon className="h-4 w-4" />
              <span className="text-label-1-medium text-teal-gray-700">
                전체 비우기
              </span>
            </button>

            <Button
              size="xs"
              color="primary"
              variant="fill"
              className="w-fit rounded-[8px] px-3 py-1.5"
            >
              저장하기
            </Button>
          </div>

          <div className="flex h-197.5 w-full gap-4">
            <SchoolStaffPanel
              schoolName="중앙대학교"
              staffList={SCHOOL_STAFF_LIST}
            />

            {/* 공고 */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
              <DroppableRecruitmentBox
                id="regular-recruitment-box"
                assignedEvaluators={assignedEvaluators}
                selectedChipId={selectedChipId}
                onSelectChip={setSelectedChipId}
                onClear={() => {
                  setAssignedEvaluators([])
                  setSelectedChipId(null)
                }}
              />
            </div>
          </div>

          {/* 공유 메모 */}
          <EvaluatorSharedNote />
        </div>
      </div>

      {activeStaff && (
        <DragOverlay>
          <div className="bg-role-product-200 flex w-fit items-center gap-[7px] rounded-[8px] px-[9px] py-[2.5px] shadow-md select-none">
            <HamburgerIcon className="text-teal-gray-400 h-4 w-4" />
            <div className="flex items-center gap-0.5">
              <span className="text-subtitle-2-medium text-teal-gray-400">
                {activeStaff.nickname}
              </span>
              <span className="text-subtitle-2-medium text-teal-gray-400">
                /
              </span>
              <span className="text-subtitle-2-medium text-teal-gray-400">
                {activeStaff.name}
              </span>
            </div>
          </div>
        </DragOverlay>
      )}
    </DndContext>
  )
}
