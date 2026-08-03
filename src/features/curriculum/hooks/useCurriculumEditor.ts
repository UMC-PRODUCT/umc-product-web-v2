import {
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useEffect, useRef, useState } from "react"

import {
  createCurriculum,
  createWeeklyCurriculum,
  deleteCurriculum,
  deleteWeeklyCurriculum,
  getCurriculumOverview,
  updateCurriculum,
  updateWeeklyCurriculum,
} from "@/entities/curriculum"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  mapOverviewToCurriculumItem,
  mapPartToApiEnum,
} from "../model/curriculumMapper"

import type { CurriculumItem, Workbook } from "../model/curriculumData"

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

interface UseCurriculumEditorOptions {
  initialCurriculums: CurriculumItem[] | (() => CurriculumItem[])
  part?: string
}

export function useCurriculumEditor({
  initialCurriculums,
  part = "PM",
}: UseCurriculumEditorOptions) {
  const [curriculums, setCurriculums] =
    useState<CurriculumItem[]>(initialCurriculums)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const addToast = useToastStore((state) => state.addToast)
  const { data: activeGisuId, isLoading: isGisuLoading } = useActiveGisuId()

  const pendingCurriculumPromisesRef = useRef<
    Map<string, Promise<number | string | null>>
  >(new Map())
  const pendingWorkbookPromisesRef = useRef<
    Map<string, Promise<number | string | null>>
  >(new Map())

  // 서버에서 기수 및 파트별 커리큘럼 데이터 동기화
  useEffect(() => {
    if (isGisuLoading || activeGisuId == null) return

    const currentGisuId = activeGisuId
    let isSubscribed = true
    async function fetchOverview() {
      setIsLoading(true)
      try {
        const apiPart = mapPartToApiEnum(part)
        const overview = await getCurriculumOverview({
          gisuId: currentGisuId,
          part: apiPart,
        })
        if (isSubscribed) {
          if (overview && overview.curriculumId) {
            const fetchedItem = mapOverviewToCurriculumItem(overview, 0)
            setCurriculums([fetchedItem])
          } else {
            setCurriculums([])
          }
        }
      } catch {
        // 서버 요청 실패 시 기존 초기값 유지
      } finally {
        if (isSubscribed) setIsLoading(false)
      }
    }
    fetchOverview()
    return () => {
      isSubscribed = false
    }
  }, [activeGisuId, isGisuLoading, part])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleCreateCurriculum = async () => {
    if (isGisuLoading || activeGisuId == null) {
      addToast({
        message: "기수 정보를 불러오는 중이거나 선택된 기수가 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    const baseCount = 0

    const newCurriculumTempId = `curriculum-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newWorkbookTempId = `wb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const newWorkbook: Workbook = {
      id: newWorkbookTempId,
      number: 1,
      title: "",
      missions: ["", ""],
    }

    const newCurriculum: CurriculumItem = {
      id: newCurriculumTempId,
      number: "00",
      title: "",
      workbookCount: 1,
      missionCount: 2,
      workbooks: [newWorkbook],
    }

    setCurriculums((prev) =>
      recalculateCurriculumNumbers([...prev, newCurriculum], baseCount),
    )

    // API 연동: 서버에 커리큘럼 생성 요청
    const curriculumPromise = (async () => {
      try {
        const apiPart = mapPartToApiEnum(part)
        const createdId = await createCurriculum({
          gisuId: activeGisuId,
          part: apiPart,
          title: "새 커리큘럼",
        })

        if (createdId) {
          setCurriculums((prev) =>
            prev.map((c) =>
              c.id === newCurriculumTempId
                ? { ...c, id: String(createdId) }
                : c,
            ),
          )
          return createdId
        }
        return null
      } catch {
        setCurriculums((prev) => {
          const filtered = prev.filter((c) => c.id !== newCurriculumTempId)
          return recalculateCurriculumNumbers(filtered, baseCount)
        })

        addToast({
          message: "커리큘럼 생성에 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return null
      }
    })()

    pendingCurriculumPromisesRef.current.set(
      newCurriculumTempId,
      curriculumPromise,
    )

    const workbookPromise = (async () => {
      const createdId = await curriculumPromise
      if (!createdId) return null
      try {
        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const createdWbId = await createWeeklyCurriculum({
          curriculumId: createdId,
          weekNo: 1,
          title: "",
          startsAt: now.toISOString(),
          endsAt: nextWeek.toISOString(),
        })
        if (createdWbId) {
          setCurriculums((prev) =>
            prev.map((c) => {
              if (c.id !== String(createdId)) return c
              const updatedWorkbooks = c.workbooks.map((wb) =>
                wb.id === newWorkbookTempId
                  ? { ...wb, id: String(createdWbId) }
                  : wb,
              )
              return { ...c, workbooks: updatedWorkbooks }
            }),
          )
          return createdWbId
        } else {
          throw new Error("Failed to create weekly curriculum")
        }
      } catch {
        setCurriculums((prev) =>
          prev.map((c) => {
            if (c.id !== String(createdId)) return c
            const updatedWorkbooks = c.workbooks.filter(
              (wb) => wb.id !== newWorkbookTempId,
            )
            return recalculateCurriculum(c, updatedWorkbooks)
          }),
        )
        addToast({
          message: "첫 주차 워크북 생성에 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return null
      }
    })()

    pendingWorkbookPromisesRef.current.set(newWorkbookTempId, workbookPromise)
  }

  const handleUpdateCurriculumTitle = (id: string, title: string) => {
    const trimmed = title.trim()
    const baseCount = 0

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

  const handleBlurCurriculumTitle = async (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return

    let numericId = Number(id)
    if (Number.isNaN(numericId)) {
      const pendingPromise = pendingCurriculumPromisesRef.current.get(id)
      if (pendingPromise) {
        const createdId = await pendingPromise
        if (createdId) {
          numericId = Number(createdId)
        }
      }
    }

    if (!Number.isNaN(numericId) && numericId > 0) {
      try {
        await updateCurriculum(numericId, { title: trimmed })
      } catch {
        addToast({
          message: "커리큘럼 제목 변경 저장에 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    }
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

  const handleBlurWorkbookTitle = async (
    curriculumId: string,
    wbIndex: number,
    title: string,
  ) => {
    const trimmed = title.trim()
    const curriculum = curriculums.find(
      (c) => c.id === curriculumId || Number(c.id) === Number(curriculumId),
    )
    if (!curriculum) return
    const wb = curriculum.workbooks[wbIndex]
    if (!wb) return

    let numericWbId = Number(wb.id)
    if (Number.isNaN(numericWbId)) {
      const pendingWbPromise = pendingWorkbookPromisesRef.current.get(wb.id)
      if (pendingWbPromise) {
        const createdWbId = await pendingWbPromise
        if (createdWbId) {
          numericWbId = Number(createdWbId)
        }
      }
    }

    if (!Number.isNaN(numericWbId) && numericWbId > 0) {
      try {
        await updateWeeklyCurriculum(numericWbId, {
          title: trimmed,
          weekNo: wb.number,
        })
      } catch {
        addToast({
          message: "주차별 워크북 제목 저장에 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    }
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

  const handleAddWorkbook = async (curriculumId: string) => {
    const targetCurriculum = curriculums.find((c) => c.id === curriculumId)
    const nextWeekNo = targetCurriculum
      ? targetCurriculum.workbooks.length + 1
      : 1
    const newWbTempId = `wb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const newWb: Workbook = {
      id: newWbTempId,
      number: nextWeekNo,
      title: "",
      missions: ["", ""],
    }

    setCurriculums((prev) =>
      prev.map((c) => {
        if (c.id !== curriculumId) return c
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

    const workbookPromise = (async () => {
      let numericCurriculumId = Number(curriculumId)
      if (Number.isNaN(numericCurriculumId)) {
        const pendingCurriculum =
          pendingCurriculumPromisesRef.current.get(curriculumId)
        if (pendingCurriculum) {
          const res = await pendingCurriculum
          if (res) numericCurriculumId = Number(res)
        }
      }

      if (!Number.isNaN(numericCurriculumId) && numericCurriculumId > 0) {
        try {
          const now = new Date()
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          const createdWeeklyId = await createWeeklyCurriculum({
            curriculumId: numericCurriculumId,
            weekNo: nextWeekNo,
            title: "",
            startsAt: now.toISOString(),
            endsAt: nextWeek.toISOString(),
          })

          if (createdWeeklyId) {
            setCurriculums((prev) =>
              prev.map((c) => {
                if (
                  c.id !== String(numericCurriculumId) &&
                  c.id !== curriculumId
                )
                  return c
                const updatedWbs = c.workbooks.map((wb) =>
                  wb.id === newWbTempId
                    ? { ...wb, id: String(createdWeeklyId) }
                    : wb,
                )
                return { ...c, workbooks: updatedWbs }
              }),
            )
            return createdWeeklyId
          }
        } catch {
          addToast({
            message: "워크북 추가 저장에 실패했습니다.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        }
      }
      return null
    })()

    pendingWorkbookPromisesRef.current.set(newWbTempId, workbookPromise)
  }

  const handleDeleteWorkbook = async (
    curriculumId: string,
    wbIndex: number,
  ) => {
    const targetCurriculum = curriculums.find((c) => c.id === curriculumId)
    const targetWb = targetCurriculum?.workbooks[wbIndex]

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

    if (targetWb) {
      const numericWbId = Number(targetWb.id)
      if (!Number.isNaN(numericWbId) && numericWbId > 0) {
        try {
          await deleteWeeklyCurriculum(numericWbId)
        } catch {
          addToast({
            message: "워크북 삭제에 실패했습니다.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        }
      }
    }
  }

  const handleMoveCurriculumToBottom = (id: string) => {
    const baseCount = 0
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

  // 되돌리기(Undo) 클릭 시 로컬 State 복구 및 API 백엔드 재등록 연동
  const handleRestoreCurriculum = async (
    restoredItem: CurriculumItem,
    targetIndex: number,
  ) => {
    if (isGisuLoading || activeGisuId == null) {
      addToast({
        message: "기수 정보를 불러오는 중이거나 선택된 기수가 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    const baseCount = 0
    setCurriculums((prev) => {
      const next = [...prev]
      if (targetIndex >= 0 && targetIndex <= next.length) {
        next.splice(targetIndex, 0, restoredItem)
      } else {
        next.push(restoredItem)
      }
      return recalculateCurriculumNumbers(next, baseCount)
    })

    // 백엔드 재등록 API 연동
    let newCurriculumId: number | null = null
    try {
      const apiPart = mapPartToApiEnum(part)
      newCurriculumId = await createCurriculum({
        gisuId: activeGisuId,
        part: apiPart,
        title: restoredItem.title || "복원된 커리큘럼",
      })
    } catch {
      setCurriculums((prev) => {
        const filtered = prev.filter((c) => c.id !== restoredItem.id)
        return recalculateCurriculumNumbers(filtered, baseCount)
      })
      addToast({
        message: "커리큘럼 복원에 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    if (!newCurriculumId) {
      setCurriculums((prev) => {
        const filtered = prev.filter((c) => c.id !== restoredItem.id)
        return recalculateCurriculumNumbers(filtered, baseCount)
      })
      addToast({
        message: "커리큘럼 복원에 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    setCurriculums((prev) =>
      prev.map((c) =>
        c.id === restoredItem.id ? { ...c, id: String(newCurriculumId) } : c,
      ),
    )

    let completedWbCount = 0
    let wbFailed = false

    for (const wb of restoredItem.workbooks) {
      try {
        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const createdWbId = await createWeeklyCurriculum({
          curriculumId: newCurriculumId,
          weekNo: wb.number,
          title: wb.title,
          startsAt: now.toISOString(),
          endsAt: nextWeek.toISOString(),
        })
        if (createdWbId) {
          setCurriculums((prev) =>
            prev.map((c) => {
              if (c.id !== String(newCurriculumId)) return c
              const updatedWbs = c.workbooks.map((w) =>
                w.id === wb.id ? { ...w, id: String(createdWbId) } : w,
              )
              return { ...c, workbooks: updatedWbs }
            }),
          )
          completedWbCount += 1
        } else {
          wbFailed = true
          break
        }
      } catch {
        wbFailed = true
        break
      }
    }

    if (wbFailed) {
      addToast({
        message: `커리큘럼은 복원되었으나 워크북 복원에 실패했습니다. (성공: ${completedWbCount}/${restoredItem.workbooks.length}개). 남은 워크북 복원이 필요합니다.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 4000,
      })
    }
  }

  const handleDeleteCurriculum = async (id: string) => {
    const baseCount = 0
    const targetIndex = curriculums.findIndex((c) => c.id === id)
    const targetCurriculum = curriculums[targetIndex]

    if (targetIndex === -1 || !targetCurriculum) return

    setCurriculums((prev) => {
      const filtered = prev.filter((c) => c.id !== id)
      return recalculateCurriculumNumbers(filtered, baseCount)
    })

    const numericCurriculumId = Number(id)
    if (!Number.isNaN(numericCurriculumId) && numericCurriculumId > 0) {
      try {
        await deleteCurriculum(numericCurriculumId)
      } catch {
        addToast({
          message: "커리큘럼 삭제에 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
    }

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
        const baseCount = 0
        setCurriculums((prev) => {
          const reordered = arrayMove(prev, oldIndex, newIndex)
          return recalculateCurriculumNumbers(reordered, baseCount)
        })
      }
    } else if (activeData?.type === "workbook") {
      // 주차 순서(weekNo) 이동 변경 시 백엔드 weekNo 업데이트
      const affected = curriculums.find((c) =>
        c.workbooks.some((wb) => wb.id === String(active.id)),
      )
      if (affected) {
        affected.workbooks.forEach(async (wb, idx) => {
          const numericWbId = Number(wb.id)
          if (!Number.isNaN(numericWbId) && numericWbId > 0) {
            try {
              await updateWeeklyCurriculum(numericWbId, {
                weekNo: idx + 1,
                title: wb.title,
              })
            } catch {
              // Ignore background order sync error
            }
          }
        })
      }
    }
  }

  return {
    curriculums,
    setCurriculums,
    isLoading,
    closestCenter,
    sensors,
    handleCreateCurriculum,
    handleUpdateCurriculumTitle,
    handleBlurCurriculumTitle,
    handleUpdateWorkbookTitle,
    handleBlurWorkbookTitle,
    handleUpdateMission,
    handleAddMission,
    handleRemoveMission,
    handleAddWorkbook,
    handleDeleteWorkbook,
    handleMoveCurriculumToBottom,
    handleDeleteCurriculum,
    handleRestoreCurriculum,
    handleDragOver,
    handleDragEnd,
  }
}
