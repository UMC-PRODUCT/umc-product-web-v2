import { useDroppable } from "@dnd-kit/core"
import { useEffect, useRef, useState } from "react"

import EditIcon from "@/shared/assets/icon/edit/EditIcon"
import TrashCan from "@/shared/assets/icon/garbage/TrashCan"
import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { SchoolChip } from "./SchoolChip"

import type { ChapterData } from "../model/chapterManagement"

interface DroppableChapterBoxProps {
  chapter: ChapterData
  selectedChipId: string | null
  onSelectChip: (id: string | null) => void
  onClear: () => void
  onDelete: () => void
  onUpdateName: (name: string) => boolean
}

export function DroppableChapterBox({
  chapter,
  selectedChipId,
  onSelectChip,
  onClear,
  onDelete,
  onUpdateName,
}: DroppableChapterBoxProps) {
  const { setNodeRef } = useDroppable({ id: chapter.id })
  const [isEditing, setIsEditing] = useState(() => chapter.name === "")
  const [tempName, setTempName] = useState(chapter.name)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setTempName(chapter.name)
    setIsEditing(true)
  }

  const handleComplete = () => {
    const success = onUpdateName(tempName)
    if (success) {
      setIsEditing(false)
    } else {
      inputRef.current?.focus()
    }
  }

  return (
    <div
      ref={setNodeRef}
      className="shadow-drop-neutral-3 border-teal-gray-100 box-border flex min-h-[169px] w-full shrink-0 flex-col rounded-[12px] border bg-white px-8 pt-7 pb-7.5"
    >
      <div className="flex flex-col gap-1">
        <div className="flex w-full items-center justify-between py-[3px]">
          <div className="flex items-center">
            <HamburgerIcon className="size-6 text-gray-400" />
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur()
                  }
                }}
                onBlur={handleComplete}
                placeholder="지부명을 입력해주세요"
                className="text-heading-6-semibold min-w-0 bg-transparent pl-1.5 text-teal-700 outline-none placeholder:text-gray-400"
              />
            ) : (
              <>
                {chapter.name.trim() ? (
                  <span className="text-heading-6-semibold pl-1.5 text-teal-700">
                    {chapter.name.trim()}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit()
                    }}
                    aria-label="지부명 입력"
                    className="text-heading-6-semibold cursor-pointer pl-1.5 text-gray-400"
                  >
                    지부명을 입력해주세요
                  </button>
                )}
                {chapter.name.trim() !== "" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit()
                    }}
                    className="flex cursor-pointer items-center pl-2"
                    aria-label="지부명 수정"
                  >
                    <EditIcon className="text-teal-gray-400 size-4" />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="hover:shadow-inner-neutral-2 flex h-8.5 items-center gap-1 rounded-[10px] bg-white py-1 pr-3 pl-2.5"
            >
              <ResetIcon className="h-4 w-4" />
              <span className="text-label-1-medium text-teal-gray-700">
                비우기
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteModalOpen(true)
              }}
              className="hover:bg-teal-gray-100 cursor-pointer rounded-[8px] p-px"
              aria-label="지부 삭제"
            >
              <TrashCan className="text-teal-gray-400 size-6" />
            </button>
          </div>
        </div>

        <span className="text-teal-gray-400 text-body-2-regular">
          총 {chapter.assignedSchools.length}개 학교
        </span>
      </div>

      {chapter.assignedSchools.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-body-2-medium text-teal-gray-400">
            소속된 학교가 없습니다
          </span>
        </div>
      ) : (
        <div className="flex flex-1 flex-wrap content-start gap-3 pt-5">
          {chapter.assignedSchools.map((school) => (
            <SchoolChip
              key={school.id}
              dragId={`chapter-assigned-${school.id}`}
              school={school}
              variant="assigned"
              draggable={true}
              isSelected={selectedChipId === school.id}
              onSelect={onSelectChip}
            />
          ))}
        </div>
      )}

      <CtaModal
        open={isDeleteModalOpen}
        title="지부를 삭제하시겠습니까?"
        content={
          <span className="block w-full break-keep">
            이 지부에 속한 학교 목록도 함께 사라집니다.
            <br />
            삭제한 지부는 되돌릴 수 없습니다.
          </span>
        }
        cancelText="돌아가기"
        confirmText="삭제하기"
        variant="error"
        onOpenChange={setIsDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false)
          onDelete()
        }}
      />
    </div>
  )
}
