import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useEffect, useRef, useState } from "react"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { useChipAssignment } from "@/shared/lib/useChipAssignment"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import {
  useRoundEvaluators,
  useSaveEvaluatorAllocation,
} from "../../hooks/useEvaluatorAllocation"
import { useRecruitingRounds } from "../../hooks/useRecruitingRounds"
import {
  isStaff,
  RECRUITMENT_BOX_ID,
  resolveDropTargetId,
  SCHOOL_STAFF_LIST,
  SCHOOL_STAFF_PANEL_ID,
  type Staff,
} from "../../model/evaluatorAllocation"
import { DroppableRecruitmentBox } from "./DroppableRecruitmentBox"
import { EvaluatorSharedNote } from "./EvaluatorSharedNote"
import { SchoolStaffPanel } from "./SchoolStaffPanel"

interface EvaluatorAllocationPageProps {
  roundId?: string
}

export function EvaluatorAllocationPage({
  roundId,
}: EvaluatorAllocationPageProps = {}) {
  const { groups } = useRecruitingRounds()
  const activeRoundId = roundId ?? groups[0]?.rounds[0]?.roundId ?? "1"

  const { data: serverEvaluators, isFetching } =
    useRoundEvaluators(activeRoundId)
  const saveMutation = useSaveEvaluatorAllocation()

  const [assignedEvaluators, setAssignedEvaluators] = useState<Staff[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const editRevisionRef = useRef(0)
  const savedSnapshotRef = useRef<Staff[] | null>(null)

  useEffect(() => {
    setIsDirty(false)
    savedSnapshotRef.current = null
    editRevisionRef.current = 0
  }, [activeRoundId])

  useEffect(() => {
    if (!serverEvaluators || isDirty) return
    if (savedSnapshotRef.current && isFetching) return

    const serverMemberIds = new Set(
      serverEvaluators.map((item) => String(item.memberId)),
    )
    const serverStaff = SCHOOL_STAFF_LIST.filter((staff) =>
      serverMemberIds.has(String(staff.id)),
    )

    savedSnapshotRef.current = null
    setAssignedEvaluators(serverStaff)
  }, [serverEvaluators, isDirty, isFetching])

  const {
    sensors,
    selectedChipId,
    setSelectedChipId,
    activeItem: activeStaff,
    setActiveItem: setActiveStaff,
  } = useChipAssignment<Staff>({
    onRemoveSelected: (chipId) => {
      setAssignedEvaluators((prev) =>
        prev.filter((staff) => staff.id !== chipId),
      )
      setIsDirty(true)
      editRevisionRef.current += 1
    },
  })

  function handleSave() {
    const requestRevision = editRevisionRef.current
    const requestSnapshot = assignedEvaluators

    saveMutation.mutate(
      {
        roundId: activeRoundId,
        assignedEvaluators: requestSnapshot,
      },
      {
        onSuccess: () => {
          if (editRevisionRef.current === requestRevision) {
            savedSnapshotRef.current = requestSnapshot
            setIsDirty(false)
            setAssignedEvaluators(requestSnapshot)
          }
        },
      },
    )
  }

  function handleDragStart(event: DragStartEvent) {
    const staff = event.active.data.current
    if (!isStaff(staff)) return
    setActiveStaff(staff)
  }

  function handleDragCancel() {
    setActiveStaff(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveStaff(null)

    if (!over) return

    const staff = active.data.current
    if (!isStaff(staff)) return

    const targetId = resolveDropTargetId(String(over.id), assignedEvaluators)
    if (!targetId) return

    if (targetId === SCHOOL_STAFF_PANEL_ID) {
      const isAssigned = assignedEvaluators.some((item) => item.id === staff.id)
      if (!isAssigned) return

      setAssignedEvaluators((prev) =>
        prev.filter((item) => item.id !== staff.id),
      )
      setIsDirty(true)
      editRevisionRef.current += 1
      return
    }

    if (targetId === RECRUITMENT_BOX_ID) {
      const isAlreadyAssigned = assignedEvaluators.some(
        (item) => item.id === staff.id,
      )
      if (isAlreadyAssigned) return

      setAssignedEvaluators((prev) => [...prev, staff])
      setIsDirty(true)
      editRevisionRef.current += 1
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
                setIsDirty(true)
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
              disabled={saveMutation.isPending}
              onClick={handleSave}
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
                id={RECRUITMENT_BOX_ID}
                assignedEvaluators={assignedEvaluators}
                selectedChipId={selectedChipId}
                onSelectChip={setSelectedChipId}
                onClear={() => {
                  setAssignedEvaluators([])
                  setIsDirty(true)
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
