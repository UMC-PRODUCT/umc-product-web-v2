import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useState } from "react"

import {
  useCreateChapter,
  useCreateChaptersBulk,
  useDeleteChapter,
} from "@/entities/organization/hooks/useChapter"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"
import { useChipAssignment } from "@/shared/lib/useChipAssignment"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  assignSchoolToChapter,
  type ChapterData,
  clearAllChapterSchools,
  clearChapterSchools,
  detachSchool,
  INITIAL_CHAPTERS,
  INITIAL_UNASSIGNED_SCHOOLS,
  isDuplicateChapterName,
  isSchool,
  resolveDropTargetId,
  type School,
  UNASSIGNED_PANEL_ID,
  withSchoolsAppended,
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
  const [activeSchoolVariant, setActiveSchoolVariant] = useState<
    "waiting" | "assigned"
  >("waiting")

  const deleteChapterMutation = useDeleteChapter()
  const createChapterMutation = useCreateChapter()
  const createChaptersBulkMutation = useCreateChaptersBulk()
  const { data: activeGisuId, isLoading: isGisuLoading } = useActiveGisuId()

  const assignedSchools = chapters.flatMap((ch) => ch.assignedSchools)

  function handleRemoveAssignedSchool(schoolId: string) {
    const target = assignedSchools.find((school) => school.id === schoolId)
    if (!target) return
    setChapters((prev) => detachSchool(prev, schoolId))
    setUnassignedSchools((prev) => withSchoolsAppended(prev, [target]))
  }

  const {
    sensors,
    selectedChipId,
    setSelectedChipId,
    activeItem: activeSchool,
    setActiveItem: setActiveSchool,
  } = useChipAssignment<School>({
    onRemoveSelected: handleRemoveAssignedSchool,
  })

  function handleDragStart(event: DragStartEvent) {
    const school = event.active.data.current
    if (!isSchool(school)) return
    setActiveSchool(school)
    const isWaiting = unassignedSchools.some((s) => s.id === school.id)
    setActiveSchoolVariant(isWaiting ? "waiting" : "assigned")
  }

  function handleDragCancel() {
    setActiveSchool(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveSchool(null)
    if (!over) return

    const school = active.data.current
    if (!isSchool(school)) return

    const targetId = resolveDropTargetId(
      chapters,
      unassignedSchools,
      String(over.id),
    )
    if (!targetId) return

    if (targetId === UNASSIGNED_PANEL_ID) {
      setChapters((prev) => detachSchool(prev, school.id))
      setUnassignedSchools((prev) => withSchoolsAppended(prev, [school]))
      return
    }

    setChapters((prev) => assignSchoolToChapter(prev, targetId, school))
    setUnassignedSchools((prev) => prev.filter((s) => s.id !== school.id))
  }

  function handleClearAll() {
    setUnassignedSchools((prev) => withSchoolsAppended(prev, assignedSchools))
    setChapters(clearAllChapterSchools)
    setSelectedChipId(null)
  }

  function handleClearChapter(chapterId: string) {
    const chapter = chapters.find((ch) => ch.id === chapterId)
    if (!chapter) return
    setUnassignedSchools((prev) =>
      withSchoolsAppended(prev, chapter.assignedSchools),
    )
    setChapters((prev) => clearChapterSchools(prev, chapterId))
    setSelectedChipId(null)
  }

  async function handleDeleteChapter(chapterId: string) {
    const chapterToDelete = chapters.find((ch) => ch.id === chapterId)
    if (!chapterToDelete) return
    const targetIndex = chapters.indexOf(chapterToDelete)

    setUnassignedSchools((prev) =>
      withSchoolsAppended(prev, chapterToDelete.assignedSchools),
    )

    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId))
    setSelectedChipId(null)

    const isExistingChapter = !chapterId.startsWith("chapter-")
    if (isExistingChapter) {
      try {
        await deleteChapterMutation.mutateAsync(chapterId)
      } catch {
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

        addToast({
          message: "지부 삭제에 실패했습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
    }

    addToast({
      message: "지부가 삭제되었습니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 5000,
      action: {
        label: "되돌리기",
        onClick: async () => {
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

          if (isExistingChapter) {
            if (isGisuLoading || activeGisuId == null) {
              addToast({
                message:
                  "기수 정보를 불러오는 중이거나 선택된 기수가 없습니다.",
                color: "red",
                variant: "deep",
                type: "default",
                duration: 3000,
              })
              return
            }

            try {
              const createdId = await createChapterMutation.mutateAsync({
                gisuId: activeGisuId,
                name: chapterToDelete.name,
                schoolIds: chapterToDelete.assignedSchools
                  .map((s) => Number(s.id))
                  .filter((id) => !Number.isNaN(id)),
              })
              if (createdId != null) {
                setChapters((prev) =>
                  prev.map((ch) =>
                    ch.id === chapterToDelete.id
                      ? { ...ch, id: String(createdId) }
                      : ch,
                  ),
                )
              }
            } catch {
              setChapters((prev) =>
                prev.filter((ch) => ch.id !== chapterToDelete.id),
              )
              if (chapterToDelete.assignedSchools.length > 0) {
                setUnassignedSchools((prev) =>
                  withSchoolsAppended(prev, chapterToDelete.assignedSchools),
                )
              }
              addToast({
                message: "지부 복원에 실패했습니다.",
                color: "red",
                variant: "deep",
                type: "default",
                duration: 3000,
              })
            }
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
    if (isDuplicateChapterName(chapters, id, name)) {
      addToast({
        message: "이미 있는 지부 이름입니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }

    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, name: name.trim() } : ch)),
    )
    return true
  }

  async function handleSave() {
    const newChapters = chapters.filter((ch) => ch.id.startsWith("chapter-"))
    if (newChapters.length === 0) return

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

    const bulkPayload = newChapters.map((ch) => ({
      gisuId: activeGisuId,
      name: ch.name,
      schoolIds: ch.assignedSchools
        .map((s) => Number(s.id))
        .filter((id) => !Number.isNaN(id)),
    }))

    try {
      const createdIds =
        await createChaptersBulkMutation.mutateAsync(bulkPayload)
      if (
        Array.isArray(createdIds) &&
        createdIds.length === newChapters.length
      ) {
        const idMap = new Map<string, string>()
        newChapters.forEach((ch, idx) => {
          if (createdIds[idx] != null) {
            idMap.set(ch.id, String(createdIds[idx]))
          }
        })
        setChapters((prev) =>
          prev.map((ch) => {
            const serverId = idMap.get(ch.id)
            return serverId ? { ...ch, id: serverId } : ch
          }),
        )
      }
      addToast({
        message: "지부 정보가 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "지부 정보 저장에 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
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
              onClick={handleSave}
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
