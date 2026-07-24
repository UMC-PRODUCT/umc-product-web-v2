import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useState } from "react"

import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { INITIAL_CURRICULUM_DATA } from "../model/curriculumData"
import { CurriculumCard } from "./CurriculumCard"

import type { CurriculumItem, Workbook } from "../model/curriculumData"

interface CurriculumCreatePageProps {
  part?: string
}

function recalculateCurriculumNumbers(
  curriculums: CurriculumItem[],
  baseCount: number,
): CurriculumItem[] {
  let nonEmptyCount = 0
  return curriculums.map((c) => {
    if (c.title.trim() === "") {
      return { ...c, number: "00" }
    }
    nonEmptyCount += 1
    const num = String(baseCount + nonEmptyCount).padStart(2, "0")
    return { ...c, number: num }
  })
}

function recalculateCurriculum(
  curriculum: CurriculumItem,
  workbooks: Workbook[],
): CurriculumItem {
  const renumberedWorkbooks = workbooks.map((wb, idx) => ({
    ...wb,
    number: idx + 1,
  }))
  const workbookCount = renumberedWorkbooks.length
  const missionCount = renumberedWorkbooks.reduce(
    (sum, wb) => sum + (wb.missions ? wb.missions.length : 0),
    0,
  )
  return {
    ...curriculum,
    workbookCount,
    missionCount,
    workbooks: renumberedWorkbooks,
  }
}

function moveWorkbook(
  curriculums: CurriculumItem[],
  activeWbId: string,
  overId: string,
): CurriculumItem[] {
  let sourceCurriculumIndex = -1
  let sourceWbIndex = -1

  curriculums.forEach((c, cIdx) => {
    const wbIdx = c.workbooks.findIndex((wb) => wb.id === activeWbId)
    if (wbIdx !== -1) {
      sourceCurriculumIndex = cIdx
      sourceWbIndex = wbIdx
    }
  })

  if (sourceCurriculumIndex === -1 || sourceWbIndex === -1) return curriculums

  const sourceCurriculum = curriculums[sourceCurriculumIndex]
  if (!sourceCurriculum) return curriculums
  const draggedWb = sourceCurriculum.workbooks[sourceWbIndex]
  if (!draggedWb) return curriculums

  let targetCurriculumIndex = -1
  let targetWbIndex = -1

  curriculums.forEach((c, cIdx) => {
    const wbIdx = c.workbooks.findIndex((wb) => wb.id === overId)
    if (wbIdx !== -1) {
      targetCurriculumIndex = cIdx
      targetWbIndex = wbIdx
    }
  })

  if (targetCurriculumIndex === -1) {
    const cIdx = curriculums.findIndex((c) => c.id === overId)
    if (cIdx !== -1) {
      targetCurriculumIndex = cIdx
      const targetC = curriculums[cIdx]
      targetWbIndex = targetC ? targetC.workbooks.length : 0
    }
  }

  if (targetCurriculumIndex === -1) return curriculums

  const targetCurriculum = curriculums[targetCurriculumIndex]
  if (!targetCurriculum) return curriculums

  if (sourceCurriculumIndex === targetCurriculumIndex) {
    if (sourceWbIndex === targetWbIndex) return curriculums
    const newWorkbooks = arrayMove(
      sourceCurriculum.workbooks,
      sourceWbIndex,
      targetWbIndex,
    )
    const updatedCurriculum = recalculateCurriculum(
      sourceCurriculum,
      newWorkbooks,
    )
    const nextCurriculums = [...curriculums]
    nextCurriculums[sourceCurriculumIndex] = updatedCurriculum
    return nextCurriculums
  }

  const newSourceWorkbooks = sourceCurriculum.workbooks.filter(
    (wb) => wb.id !== activeWbId,
  )
  const updatedSourceCurriculum = recalculateCurriculum(
    sourceCurriculum,
    newSourceWorkbooks,
  )

  const newTargetWorkbooks = [...targetCurriculum.workbooks]
  newTargetWorkbooks.splice(targetWbIndex, 0, draggedWb)
  const updatedTargetCurriculum = recalculateCurriculum(
    targetCurriculum,
    newTargetWorkbooks,
  )

  const nextCurriculums = [...curriculums]
  nextCurriculums[sourceCurriculumIndex] = updatedSourceCurriculum
  nextCurriculums[targetCurriculumIndex] = updatedTargetCurriculum

  return nextCurriculums
}

export function CurriculumCreatePage({
  part = "PM",
}: CurriculumCreatePageProps) {
  const [curriculums, setCurriculums] = useState<CurriculumItem[]>([])
  const addToast = useToastStore((state) => state.addToast)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleCreateCurriculum = () => {
    const baseCount = INITIAL_CURRICULUM_DATA[part]?.length || 0

    const newWorkbook: Workbook = {
      id: `wb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      number: 1,
      title: "",
      missions: ["", ""],
    }

    const newCurriculum: CurriculumItem = {
      id: `curriculum-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      number: "00",
      title: "",
      workbookCount: 1,
      missionCount: 2,
      workbooks: [newWorkbook],
    }

    setCurriculums((prev) =>
      recalculateCurriculumNumbers([...prev, newCurriculum], baseCount),
    )
  }

  const handleUpdateCurriculumTitle = (id: string, title: string) => {
    const trimmed = title.trim()
    const baseCount = INITIAL_CURRICULUM_DATA[part]?.length || 0

    if (trimmed !== "") {
      const isDuplicate = curriculums.some(
        (c) => c.id !== id && c.title.trim() === trimmed,
      )
      if (isDuplicate) {
        const alreadyShowing = useToastStore
          .getState()
          .toasts.some((t) => t.message === "이미 있는 커리큘럼 이름입니다.")
        if (!alreadyShowing) {
          addToast({
            message: "이미 있는 커리큘럼 이름입니다.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        }
      }
    }

    setCurriculums((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, title } : c))
      return recalculateCurriculumNumbers(updated, baseCount)
    })
  }

  const handleUpdateWorkbookTitle = (
    curriculumId: string,
    wbIndex: number,
    title: string,
  ) => {
    const trimmed = title.trim()

    if (trimmed !== "") {
      let isDuplicate = false
      curriculums.forEach((c) => {
        c.workbooks.forEach((wb, idx) => {
          if (c.id === curriculumId && idx === wbIndex) return
          if (wb.title.trim() === trimmed) {
            isDuplicate = true
          }
        })
      })

      if (isDuplicate) {
        const alreadyShowing = useToastStore
          .getState()
          .toasts.some((t) => t.message === "이미 있는 워크북 이름입니다.")
        if (!alreadyShowing) {
          addToast({
            message: "이미 있는 워크북 이름입니다.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        }
      }
    }

    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
        const targetWb = c.workbooks[wbIndex]
        if (!targetWb) return c
        const newWorkbooks = [...c.workbooks]
        newWorkbooks[wbIndex] = { ...targetWb, title }
        return { ...c, workbooks: newWorkbooks }
      }),
    )
  }

  const handleUpdateMission = (
    curriculumId: string,
    wbIndex: number,
    missionIndex: number,
    value: string,
  ) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
        const targetWb = c.workbooks[wbIndex]
        if (!targetWb) return c
        const currentMissions =
          targetWb.missions && targetWb.missions.length >= 2
            ? targetWb.missions
            : ["", ""]
        const newMissions = [...currentMissions]
        newMissions[missionIndex] = value
        const newWorkbooks = [...c.workbooks]
        newWorkbooks[wbIndex] = {
          ...targetWb,
          missions: newMissions,
        }
        const missionCount = newWorkbooks.reduce(
          (sum, wb) => sum + (wb.missions ? wb.missions.length : 0),
          0,
        )
        return { ...c, workbooks: newWorkbooks, missionCount }
      }),
    )
  }

  const handleAddMission = (
    curriculumId: string,
    wbIndex: number,
    afterMissionIndex: number,
  ) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
        const targetWb = c.workbooks[wbIndex]
        if (!targetWb) return c
        const currentMissions = targetWb.missions ? [...targetWb.missions] : []
        currentMissions.splice(afterMissionIndex + 1, 0, "")
        const newWorkbooks = [...c.workbooks]
        newWorkbooks[wbIndex] = {
          ...targetWb,
          missions: currentMissions,
        }
        const missionCount = newWorkbooks.reduce(
          (sum, wb) => sum + (wb.missions ? wb.missions.length : 0),
          0,
        )
        return { ...c, workbooks: newWorkbooks, missionCount }
      }),
    )
  }

  const handleRemoveMission = (
    curriculumId: string,
    wbIndex: number,
    missionIndex: number,
  ) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
        const targetWb = c.workbooks[wbIndex]
        if (!targetWb || !targetWb.missions || targetWb.missions.length <= 1)
          return c
        const currentMissions = [...targetWb.missions]
        const newMissions = currentMissions.filter(
          (_, idx) => idx !== missionIndex,
        )
        const newWorkbooks = [...c.workbooks]
        newWorkbooks[wbIndex] = {
          ...targetWb,
          missions: newMissions,
        }
        const missionCount = newWorkbooks.reduce(
          (sum, wb) => sum + (wb.missions ? wb.missions.length : 0),
          0,
        )
        return { ...c, workbooks: newWorkbooks, missionCount }
      }),
    )
  }

  const handleAddWorkbook = (curriculumId: string) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
        const newWb: Workbook = {
          id: `wb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          number: c.workbooks.length + 1,
          title: "",
          missions: ["", ""],
        }
        const newWorkbooks = [...c.workbooks, newWb]
        const missionCount = newWorkbooks.reduce(
          (sum, wb) => sum + (wb.missions ? wb.missions.length : 0),
          0,
        )
        return {
          ...c,
          workbookCount: newWorkbooks.length,
          missionCount,
          workbooks: newWorkbooks,
        }
      }),
    )
  }

  const handleDeleteWorkbook = (curriculumId: string, wbIndex: number) => {
    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
        const newWorkbooks = c.workbooks
          .filter((_, idx) => idx !== wbIndex)
          .map((wb, idx) => ({ ...wb, number: idx + 1 }))
        const missionCount = newWorkbooks.reduce(
          (sum, wb) => sum + (wb.missions ? wb.missions.length : 0),
          0,
        )
        return {
          ...c,
          workbookCount: newWorkbooks.length,
          missionCount,
          workbooks: newWorkbooks,
        }
      }),
    )
  }

  const handleMoveCurriculumToBottom = (id: string) => {
    const baseCount = INITIAL_CURRICULUM_DATA[part]?.length || 0
    setCurriculums((prev) => {
      const targetIdx = prev.findIndex((c) => c.id === id)
      if (targetIdx === -1) return prev
      const target = prev[targetIdx]
      if (!target) return prev
      const remaining = prev.filter((c) => c.id !== id)
      const reordered = [...remaining, target]
      return recalculateCurriculumNumbers(reordered, baseCount)
    })
  }

  const handleRestoreCurriculum = (
    restoredItem: CurriculumItem,
    targetIndex: number,
  ) => {
    const baseCount = INITIAL_CURRICULUM_DATA[part]?.length || 0
    setCurriculums((prev) => {
      const next = [...prev]
      if (targetIndex >= 0 && targetIndex <= next.length) {
        next.splice(targetIndex, 0, restoredItem)
      } else {
        next.push(restoredItem)
      }
      return recalculateCurriculumNumbers(next, baseCount)
    })
  }

  const handleDeleteCurriculum = (id: string) => {
    const baseCount = INITIAL_CURRICULUM_DATA[part]?.length || 0
    const targetIndex = curriculums.findIndex((c) => c.id === id)
    const targetCurriculum = curriculums[targetIndex]

    if (targetIndex === -1 || !targetCurriculum) return

    setCurriculums((prev) => {
      const filtered = prev.filter((c) => c.id !== id)
      return recalculateCurriculumNumbers(filtered, baseCount)
    })

    addToast({
      message: "선택한 커리큘럼이 삭제되었습니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 5000,
      action: {
        label: "되돌리기",
        onClick: () => {
          handleRestoreCurriculum(targetCurriculum, targetIndex)
        },
      },
    })
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeData = active.data.current as { type?: string } | undefined
    if (activeData?.type === "workbook") {
      const activeWbId = String(active.id)
      const overId = String(over.id)
      setCurriculums((prev) => moveWorkbook(prev, activeWbId, overId))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeData = active.data.current as { type?: string } | undefined
    if (activeData?.type === "curriculum") {
      const oldIndex = curriculums.findIndex((c) => c.id === active.id)
      const newIndex = curriculums.findIndex((c) => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const baseCount = INITIAL_CURRICULUM_DATA[part]?.length || 0
        setCurriculums((prev) => {
          const reordered = arrayMove(prev, oldIndex, newIndex)
          return recalculateCurriculumNumbers(reordered, baseCount)
        })
      }
    }
  }

  return (
    <div className="flex w-full max-w-242 flex-col gap-8">
      <div className="relative w-full">
        <PageLabel
          breadcrumb={[
            { id: "settings", label: "설정" },
            { id: "curriculum", label: "커리큘럼" },
            { id: "curriculum-create", label: "커리큘럼 생성" },
          ]}
          title={`${part} 커리큘럼 생성`}
          description="스터디 새 커리큘럼을 만듭니다."
          className="pl-3"
        />

        <Button
          size="s"
          color="primary"
          variant="fill"
          className="absolute right-0 bottom-0 flex cursor-pointer items-center gap-1 rounded-[10px] py-[9px] pr-4 pl-2.5"
          onClick={handleCreateCurriculum}
        >
          <PlusIcon className="size-4 text-white" />
          <span className="text-label-1-medium text-white">새 커리큘럼</span>
        </Button>
      </div>

      {curriculums.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={curriculums.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex w-full flex-col gap-2.5">
              {curriculums.map((item) => (
                <CurriculumCard
                  key={item.id}
                  curriculum={item}
                  isEditable
                  onUpdateCurriculumTitle={(title) =>
                    handleUpdateCurriculumTitle(item.id, title)
                  }
                  onUpdateWorkbookTitle={(wbIndex, title) =>
                    handleUpdateWorkbookTitle(item.id, wbIndex, title)
                  }
                  onUpdateMission={(wbIndex, missionIndex, value) =>
                    handleUpdateMission(item.id, wbIndex, missionIndex, value)
                  }
                  onAddWorkbook={() => handleAddWorkbook(item.id)}
                  onDeleteWorkbook={(wbIndex) =>
                    handleDeleteWorkbook(item.id, wbIndex)
                  }
                  onMoveCurriculumToBottom={() =>
                    handleMoveCurriculumToBottom(item.id)
                  }
                  onDeleteCurriculum={() => handleDeleteCurriculum(item.id)}
                  onAddMission={(wbIndex, afterMissionIndex) =>
                    handleAddMission(item.id, wbIndex, afterMissionIndex)
                  }
                  onRemoveMission={(wbIndex, missionIndex) =>
                    handleRemoveMission(item.id, wbIndex, missionIndex)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
