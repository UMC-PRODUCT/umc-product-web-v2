import { useEffect, useMemo, useState } from "react"

import { CHAPTERS } from "@/entities/organization/model/chapters"
import CloseThinIcon from "@/shared/assets/icon/close/CloseThinIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { Modal } from "@/shared/ui/Modal"

import type { Chapter } from "@/entities/organization/model/chapters"

// SUPER_ADMIN/HQ_LEAD/HQ_ADMIN → "central": 전 지부를 넘나들며 학교를 고른다.
// CHAPTER_ADMIN → "chapterAdmin": 본인 지부 하나로 고정, 학교는 기본 전체 선택.
// SCHOOL_ADMIN/SCHOOL_STAFF는 이 모달을 아예 띄우지 않고 즉시 복제한다.
type DuplicateModalRole = "central" | "chapterAdmin"

interface RecruitmentDuplicateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: DuplicateModalRole
  ownChapter?: Chapter
  onCancel: () => void
  onConfirm: (selectedSchools: string[]) => void
}

export function RecruitmentDuplicateModal({
  open,
  onOpenChange,
  role,
  ownChapter,
  onCancel,
  onConfirm,
}: RecruitmentDuplicateModalProps) {
  const chapters = useMemo(
    () => (role === "central" ? [...CHAPTERS] : ownChapter ? [ownChapter] : []),
    [role, ownChapter],
  )
  const [activeChapter, setActiveChapter] = useState<Chapter | undefined>(
    chapters[0],
  )
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set())

  // 모달을 다시 열 때마다 role에 맞는 기본 선택 상태로 되돌린다.
  // chapterAdmin은 본인 지부 학교 전체가 기본 선택, central은 빈 선택으로 시작.
  useEffect(() => {
    if (!open) return
    setActiveChapter(chapters[0])
    setSelectedSchools(
      role === "chapterAdmin" && ownChapter
        ? new Set(SCHOOLS_BY_BRANCH[ownChapter])
        : new Set(),
    )
  }, [open, role, ownChapter, chapters])

  const currentSchools = activeChapter ? SCHOOLS_BY_BRANCH[activeChapter] : []
  const selectedList = useMemo(() => [...selectedSchools], [selectedSchools])
  const hasSelection = selectedList.length > 0

  const toggleSchool = (school: string, checked: boolean) => {
    setSelectedSchools((prev) => {
      const next = new Set(prev)
      if (checked) next.add(school)
      else next.delete(school)
      return next
    })
  }

  const removeSchool = (school: string) => {
    setSelectedSchools((prev) => {
      const next = new Set(prev)
      next.delete(school)
      return next
    })
  }

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) onCancel()
      }}
    >
      <Modal.Portal>
        <Modal.Overlay tone="light" />
        <Modal.Content className="shadow-drop-neutral-1 flex max-h-[calc(100vh-4rem)] w-[46.75rem] max-w-[calc(100vw-2rem)] flex-col rounded-[0.625rem] border border-neutral-200 bg-white focus:outline-none">
          <div className="flex flex-col items-start gap-4 px-8 pt-8">
            <div className="flex flex-col items-start gap-2 px-1">
              <Modal.Title className="text-teal-gray-900 text-[1.625rem] leading-[130%] font-semibold">
                모집 공고 복제하기
              </Modal.Title>
              <Modal.Description className="text-teal-gray-500 w-[27.5rem] max-w-full leading-[145%]">
                선택한 학교의 공유 보관함에 추가됩니다.
              </Modal.Description>
            </div>

            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col items-start gap-1.5 py-2 pr-4">
                {chapters.map((chapter) => {
                  const active = chapter === activeChapter
                  return (
                    <button
                      key={chapter}
                      type="button"
                      disabled={role === "chapterAdmin"}
                      onClick={() => setActiveChapter(chapter)}
                      className={cn(
                        "flex h-11 w-[8.875rem] items-center gap-2.5 rounded-xl px-4 text-lg leading-[140%]",
                        active
                          ? "bg-teal-50 font-semibold text-teal-700"
                          : "text-teal-gray-500 font-medium",
                        role === "chapterAdmin" && "cursor-default",
                      )}
                    >
                      {chapter}
                    </button>
                  )
                })}
              </div>

              <div className="border-teal-gray-200 bg-teal-gray-50 flex max-h-100 w-[30.625rem] max-w-full items-start gap-2.5 overflow-y-auto border-l p-6">
                <div className="flex flex-col items-start gap-4">
                  {currentSchools.map((school) => (
                    <CheckboxList
                      key={school}
                      checked={selectedSchools.has(school)}
                      onChange={(checked) => toggleSchool(school, checked)}
                    >
                      {school}
                    </CheckboxList>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-teal-gray-200 flex flex-col items-start gap-2.5 border-t bg-white py-5 pr-8 pl-[2.375rem]">
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectedSchools(new Set())}
                className="flex items-center gap-2.5"
              >
                <span
                  className={cn(
                    "leading-[140%] text-teal-600",
                    hasSelection ? "font-semibold" : "font-medium",
                  )}
                >
                  선택 {selectedList.length}
                </span>
                <ResetIcon className="text-teal-gray-300 h-4 w-4" />
              </button>
              <div className="bg-teal-gray-100 h-[1.1875rem] w-px shrink-0" />
              <div className="flex flex-1 items-center gap-1 overflow-x-auto">
                {selectedList.map((school) => (
                  <button
                    key={school}
                    type="button"
                    onClick={() => removeSchool(school)}
                    className="text-teal-gray-600 flex h-7 shrink-0 items-center gap-1 px-1 leading-[140%] font-medium"
                  >
                    {school}
                    <CloseThinIcon className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-8 pt-0 pb-8">
            <Button
              type="button"
              variant="weak"
              color="neutral"
              size="s"
              className="h-11 min-w-16 rounded-[0.625rem]"
              onClick={onCancel}
            >
              돌아가기
            </Button>
            <Button
              type="button"
              variant="fill"
              color="primary"
              size="s"
              className="h-11 min-w-19 rounded-[0.625rem]"
              disabled={!hasSelection}
              onClick={() => onConfirm(selectedList)}
            >
              복제하기
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
