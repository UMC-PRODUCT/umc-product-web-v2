import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Popover } from "radix-ui"
import { useEffect, useRef, useState } from "react"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { MoreVerticalGlyph } from "@/shared/assets/icon/more/MoreVerticalIcon"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { CurriculumSummary } from "./CurriculumSummary"

import type { CurriculumItem, Workbook } from "../model/curriculumData"

interface SortableWorkbookItemProps {
  wb: Workbook
  wbIndex: number
  onUpdateWorkbookTitle?: (wbIndex: number, title: string) => void
  onUpdateMission?: (
    wbIndex: number,
    missionIndex: number,
    value: string,
  ) => void
  onDeleteWorkbook?: (wbIndex: number) => void
  onAddMission?: (wbIndex: number, afterMissionIndex: number) => void
  onRemoveMission?: (wbIndex: number, missionIndex: number) => void
}

function SortableWorkbookItem({
  wb,
  wbIndex,
  onUpdateWorkbookTitle,
  onUpdateMission,
  onDeleteWorkbook,
  onAddMission,
  onRemoveMission,
}: SortableWorkbookItemProps) {
  const missionInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  useEffect(() => {
    if (focusIndex !== null && missionInputRefs.current[focusIndex]) {
      missionInputRefs.current[focusIndex]?.focus()
      setFocusIndex(null)
    }
  }, [wb.missions, focusIndex])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: wb.id,
    data: { type: "workbook", wb, wbIndex },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const missionsToRender = wb.missions

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group box-border flex w-full flex-col gap-1.5 rounded-[16px] border py-5 pr-6 pl-5 transition-colors ${
        isDragging
          ? "border-teal-200 bg-teal-50"
          : "border-transparent hover:border-teal-200 hover:bg-white"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="cursor-grab touch-none p-px active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <HamburgerIcon className="text-teal-gray-700 size-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-heading-7-semibold text-teal-600">
              WorkBook {wb.number}
            </span>
            <input
              type="text"
              value={wb.title}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateWorkbookTitle?.(wbIndex, e.target.value)}
              placeholder="워크북 이름을 작성하세요"
              className="text-heading-7-semibold text-teal-gray-900 placeholder:text-teal-gray-400 min-w-48 bg-transparent outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onDeleteWorkbook?.(wbIndex)
          }}
          className={`cursor-pointer px-1 transition-opacity ${
            isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="text-subtitle-2-medium text-teal-gray-500 decoration-teal-gray-500 hover:underline">
            삭제
          </span>
        </button>
      </div>

      <ul className="flex flex-col gap-1 pl-34.5">
        {missionsToRender.map((mission, idx) => (
          <li
            key={`${wb.id}-m-${idx}`}
            className="text-body-1-medium text-teal-gray-600 flex items-center gap-2"
          >
            <span>•</span>
            <input
              ref={(el) => {
                missionInputRefs.current[idx] = el
              }}
              type="text"
              value={mission}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateMission?.(wbIndex, idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  e.stopPropagation()
                  setFocusIndex(idx + 1)
                  onAddMission?.(wbIndex, idx)
                } else if (
                  (e.key === "Backspace" || e.key === "Delete") &&
                  mission === "" &&
                  missionsToRender.length > 1
                ) {
                  e.preventDefault()
                  e.stopPropagation()
                  setFocusIndex(idx > 0 ? idx - 1 : 0)
                  onRemoveMission?.(wbIndex, idx)
                }
              }}
              placeholder="미션을 작성하세요"
              className="text-body-1-medium text-teal-gray-900 placeholder:text-teal-gray-400 min-w-60 bg-transparent outline-none"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

interface CurriculumCardEditableProps {
  curriculum: CurriculumItem
  onUpdateCurriculumTitle?: (title: string) => void
  onUpdateWorkbookTitle?: (wbIndex: number, title: string) => void
  onUpdateMission?: (
    wbIndex: number,
    missionIndex: number,
    value: string,
  ) => void
  onAddWorkbook?: () => void
  onDeleteWorkbook?: (wbIndex: number) => void
  onMoveCurriculumToBottom?: () => void
  onDeleteCurriculum?: () => void
  onAddMission?: (wbIndex: number, afterMissionIndex: number) => void
  onRemoveMission?: (wbIndex: number, missionIndex: number) => void
  autoFocusTitle?: boolean
}

export function CurriculumCardEditable({
  curriculum,
  onUpdateCurriculumTitle,
  onUpdateWorkbookTitle,
  onUpdateMission,
  onAddWorkbook,
  onDeleteWorkbook,
  onMoveCurriculumToBottom,
  onDeleteCurriculum,
  onAddMission,
  onRemoveMission,
  autoFocusTitle = false,
}: CurriculumCardEditableProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocusTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [autoFocusTitle])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: curriculum.id,
    data: { type: "curriculum", curriculum },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isTitleEmpty = curriculum.title.trim() === ""
  const displayCurriculumNumber = isTitleEmpty ? "00" : curriculum.number

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1">
      <div className="border-teal-gray-100 shadow-drop-neutral-2 flex w-full justify-between gap-1 rounded-[16px] border bg-white px-6 py-7">
        <div className="flex flex-1 gap-3">
          <div className="h-full">
            <button
              type="button"
              className="text-teal-gray-700 shrink-0 cursor-grab touch-none active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <HamburgerIcon className="text-teal-gray-700 size-7.5" />
            </button>
          </div>

          <div className="flex w-full gap-[11px]">
            <span
              className={`text-heading-6-semibold transition-colors ${
                isTitleEmpty ? "text-teal-gray-400" : "text-teal-600"
              }`}
            >
              {displayCurriculumNumber}
            </span>
            <div className="flex w-full flex-col gap-1 text-left">
              <input
                ref={titleInputRef}
                type="text"
                value={curriculum.title}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => onUpdateCurriculumTitle?.(e.target.value)}
                placeholder="커리큘럼 이름을 작성하세요"
                className="text-heading-6-semibold text-teal-gray-900 placeholder:text-teal-gray-400 w-full min-w-60 bg-transparent outline-none"
              />
              <CurriculumSummary
                workbookCount={curriculum.workbookCount}
                missionCount={curriculum.missionCount}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onAddWorkbook?.()
            }}
            className="hover:bg-teal-gray-50 box-border flex h-10 cursor-pointer items-center gap-1 rounded-[10px] border border-gray-400/15 bg-white pr-3.5 pl-2.5 transition-colors"
          >
            <PlusIcon className="text-teal-gray-400 size-4" />
            <span className="text-label-1-medium text-teal-gray-700">
              워크북
            </span>
          </button>

          <Popover.Root open={moreOpen} onOpenChange={setMoreOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="hover:shadow-inner-neutral-1 hover:bg-teal-gray-100 flex cursor-pointer items-center justify-center rounded-[10px] bg-white p-2 transition-colors"
                aria-label="커리큘럼 더보기"
              >
                <MoreVerticalGlyph className="text-teal-gray-600 size-6" />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={6}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="shadow-drop-neutral-1 border-teal-gray-50 z-1100 flex w-36 flex-col rounded-lg border bg-white p-1"
              >
                <DropdownItem
                  label="맨 밑으로 보내기"
                  onClick={() => {
                    setMoreOpen(false)
                    onMoveCurriculumToBottom?.()
                  }}
                  size="md"
                />
                <DropdownItem
                  label="삭제"
                  onClick={() => {
                    setMoreOpen(false)
                    setIsDeleteModalOpen(true)
                  }}
                  size="md"
                  className="text-error-500"
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <CtaModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title="커리큘럼을 삭제하시겠습니까?"
            content={
              <span className="whitespace-pre-line">
                {
                  "해당 커리큘럼의 워크북과 미션들까지 삭제되며\n삭제 후 복구 할 수 없습니다."
                }
              </span>
            }
            cancelText="돌아가기"
            confirmText="삭제하기"
            variant="error"
            onCancel={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              setIsDeleteModalOpen(false)
              onDeleteCurriculum?.()
            }}
          />
        </div>
      </div>

      <div className="flex flex-col py-2 pr-6 pl-8">
        <SortableContext
          items={curriculum.workbooks.map((wb) => wb.id)}
          strategy={verticalListSortingStrategy}
        >
          {curriculum.workbooks.map((wb, wbIndex) => (
            <SortableWorkbookItem
              key={wb.id}
              wb={wb}
              wbIndex={wbIndex}
              onUpdateWorkbookTitle={onUpdateWorkbookTitle}
              onUpdateMission={onUpdateMission}
              onDeleteWorkbook={onDeleteWorkbook}
              onAddMission={onAddMission}
              onRemoveMission={onRemoveMission}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
