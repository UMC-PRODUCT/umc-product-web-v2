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

import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  type ChapterData,
  INITIAL_CHAPTERS,
  INITIAL_UNASSIGNED_SCHOOLS,
  type School,
} from "../model/chapterManagement"
import { DroppableChapterBox } from "./DroppableChapterBox"
import { SchoolChip } from "./SchoolChip"
import { SchoolListPanel } from "./SchoolListPanel"

export function ChapterManagePage() {
  const addToast = useToastStore((state) => state.addToast)
  const [unassignedSchools, setUnassignedSchools] = useState<School[]>(
    INITIAL_UNASSIGNED_SCHOOLS,
  )
  const [chapters, setChapters] = useState<ChapterData[]>(INITIAL_CHAPTERS)
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null)
  const [activeSchool, setActiveSchool] = useState<School | null>(null)
  const [activeSchoolVariant, setActiveSchoolVariant] = useState<
    "waiting" | "assigned"
  >("waiting")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const assignedSchools = chapters.flatMap((ch) => ch.assignedSchools)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (selectedChipId && (e.key === "Delete" || e.key === "Backspace")) {
        const targetSchool = chapters
          .flatMap((ch) => ch.assignedSchools)
          .find((s) => s.id === selectedChipId)

        if (targetSchool) {
          setChapters((prevChapters) =>
            prevChapters.map((ch) => ({
              ...ch,
              assignedSchools: ch.assignedSchools.filter(
                (s) => s.id !== selectedChipId,
              ),
            })),
          )

          setUnassignedSchools((prev) => {
            if (prev.some((s) => s.id === targetSchool.id)) return prev
            return [...prev, targetSchool]
          })
        }
        setSelectedChipId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedChipId, chapters])

  function handleDragStart(event: DragStartEvent) {
    const school = event.active.data.current as School | undefined
    if (school) {
      setActiveSchool(school)
      const isWaiting = unassignedSchools.some((s) => s.id === school.id)
      setActiveSchoolVariant(isWaiting ? "waiting" : "assigned")
    }
  }

  function handleDragCancel() {
    setActiveSchool(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveSchool(null)
    if (!over) return

    const school = active.data.current as School | undefined
    if (!school) return

    const overId = String(over.id)

    let targetId = overId

    const isChapter = chapters.some((ch) => ch.id === overId)
    if (!isChapter) {
      const parentChapter = chapters.find((ch) =>
        ch.assignedSchools.some(
          (s) => `chapter-assigned-${s.id}` === overId || s.id === overId,
        ),
      )
      if (parentChapter) {
        targetId = parentChapter.id
      } else if (
        overId === "unassigned-schools-panel" ||
        overId.startsWith("waiting-") ||
        overId.startsWith("panel-assigned-") ||
        unassignedSchools.some((s) => s.id === overId)
      ) {
        targetId = "unassigned-schools-panel"
      }
    }

    // Safety check: if targetId is neither a valid chapter nor unassigned panel, ignore
    if (
      targetId !== "unassigned-schools-panel" &&
      !chapters.some((ch) => ch.id === targetId)
    ) {
      return
    }

    if (targetId === "unassigned-schools-panel") {
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          assignedSchools: ch.assignedSchools.filter((s) => s.id !== school.id),
        })),
      )
      setUnassignedSchools((prev) => {
        if (prev.some((s) => s.id === school.id)) return prev
        return [...prev, school]
      })
    } else {
      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.id === targetId) {
            if (ch.assignedSchools.some((s) => s.id === school.id)) {
              return ch
            }
            return {
              ...ch,
              assignedSchools: [...ch.assignedSchools, school],
            }
          }
          return {
            ...ch,
            assignedSchools: ch.assignedSchools.filter(
              (s) => s.id !== school.id,
            ),
          }
        }),
      )
      setUnassignedSchools((prev) => prev.filter((s) => s.id !== school.id))
    }
  }

  function handleClearAll() {
    const allAssigned = chapters.flatMap((ch) => ch.assignedSchools)
    setUnassignedSchools((prev) => {
      const existingIds = new Set(prev.map((s) => s.id))
      const newSchools = allAssigned.filter((s) => !existingIds.has(s.id))
      return [...prev, ...newSchools]
    })
    setChapters((prev) =>
      prev.map((ch) => ({
        ...ch,
        assignedSchools: [],
      })),
    )
    setSelectedChipId(null)
  }

  function handleClearChapter(chapterId: string) {
    const chapter = chapters.find((ch) => ch.id === chapterId)
    if (!chapter) return
    setUnassignedSchools((prev) => {
      const existingIds = new Set(prev.map((s) => s.id))
      const newSchools = chapter.assignedSchools.filter(
        (s) => !existingIds.has(s.id),
      )
      return [...prev, ...newSchools]
    })
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, assignedSchools: [] } : ch,
      ),
    )
    setSelectedChipId(null)
  }

  function handleDeleteChapter(chapterId: string) {
    const chapterToDelete = chapters.find((ch) => ch.id === chapterId)
    if (!chapterToDelete) return
    const targetIndex = chapters.indexOf(chapterToDelete)

    setUnassignedSchools((prev) => {
      const existingIds = new Set(prev.map((s) => s.id))
      const newSchools = chapterToDelete.assignedSchools.filter(
        (s) => !existingIds.has(s.id),
      )
      return [...prev, ...newSchools]
    })

    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId))
    setSelectedChipId(null)

    addToast({
      message: "지부가 삭제되었습니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 5000,
      action: {
        label: "되돌리기",
        onClick: () => {
          setChapters((prev) => {
            if (prev.some((ch) => ch.id === chapterToDelete.id)) return prev
            const next = [...prev]
            const insertIndex = Math.min(targetIndex, next.length)
            next.splice(insertIndex, 0, chapterToDelete)
            return next
          })

          if (chapterToDelete.assignedSchools.length > 0) {
            const restoredSchoolIds = new Set(
              chapterToDelete.assignedSchools.map((s) => s.id),
            )
            setUnassignedSchools((prev) =>
              prev.filter((s) => !restoredSchoolIds.has(s.id)),
            )
          }
        },
      },
    })
  }

  function handleAddChapter() {
    const newChapter: ChapterData = {
      id: `chapter-${Date.now()}`,
      name: "",
      assignedSchools: [],
    }
    setChapters((prev) => [...prev, newChapter])
  }

  function handleUpdateChapterName(id: string, name: string): boolean {
    const trimmed = name.trim()
    if (trimmed !== "") {
      const isDuplicate = chapters.some(
        (ch) => ch.id !== id && ch.name.trim() === trimmed,
      )
      if (isDuplicate) {
        addToast({
          message: "이미 있는 지부 이름입니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return false
      }
    }

    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, name: trimmed } : ch)),
    )
    return true
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
            { id: "settings", label: "설정" },
            { id: "chapter", label: "지부 관리" },
          ]}
          title="지부 관리"
          description="지부를 만들고 드래그 앤 드롭으로 소속 학교를 정합니다."
          className="pl-3"
        />

        <div className="relative flex w-full flex-col gap-4">
          <div className="absolute -top-10.5 right-0.5 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleAddChapter()
              }}
              className="border-teal-gray-400/15 hover:bg-teal-gray-50 box-border flex h-8.5 cursor-pointer items-center gap-1 rounded-[10px] border bg-white px-3 py-1 pl-2.5"
            >
              <PlusIcon className="text-teal-gray-700 h-4 w-4" />
              <span className="text-label-1-medium text-teal-gray-700">
                지부 생성
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClearAll()
              }}
              className="border-teal-gray-400/15 hover:bg-teal-gray-50 box-border flex h-8.5 cursor-pointer items-center gap-1 rounded-[10px] border bg-white px-3 py-1 pl-2.5"
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

          <div className="flex w-full items-stretch gap-4">
            <SchoolListPanel
              schoolList={unassignedSchools}
              assignedSchoolList={assignedSchools}
            />

            <div className="relative min-w-0 flex-1">
              <div className="absolute inset-0 flex flex-col gap-4 overflow-y-auto pr-1">
                {chapters.map((chapter) => (
                  <DroppableChapterBox
                    key={chapter.id}
                    chapter={chapter}
                    selectedChipId={selectedChipId}
                    onSelectChip={setSelectedChipId}
                    onClear={() => handleClearChapter(chapter.id)}
                    onDelete={() => handleDeleteChapter(chapter.id)}
                    onUpdateName={(name) =>
                      handleUpdateChapterName(chapter.id, name)
                    }
                  />
                ))}
                {chapters.length > 0 && (
                  <div
                    className="pointer-events-none h-[calc(100%-185px)] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeSchool && (
        <DragOverlay>
          <SchoolChip
            school={activeSchool}
            variant={activeSchoolVariant}
            draggable={false}
            isDragging={true}
            className="shadow-md"
          />
        </DragOverlay>
      )}
    </DndContext>
  )
}
