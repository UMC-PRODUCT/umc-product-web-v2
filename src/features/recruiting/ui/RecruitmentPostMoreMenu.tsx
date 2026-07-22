import { Popover } from "radix-ui"
import { useRef, useState } from "react"

import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type { RecruitmentPostStatus } from "../model/recruitmentList"

interface RecruitmentPostMoreMenuProps {
  status: RecruitmentPostStatus
  onPublish?: () => void
  onPrivatize?: () => void
  onEdit?: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function RecruitmentPostMoreMenu({
  status,
  onPublish,
  onPrivatize,
  onEdit,
  onDuplicate,
  onDelete,
}: RecruitmentPostMoreMenuProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [privatizeConfirmOpen, setPrivatizeConfirmOpen] = useState(false)
  const shouldPreventFocusRestoreRef = useRef(false)

  const withClose = (action?: () => void) => () => {
    setPopoverOpen(false)
    action?.()
  }

  const handlePrivatizeClick = () => {
    shouldPreventFocusRestoreRef.current = true
    setPopoverOpen(false)
    setPrivatizeConfirmOpen(true)
  }

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <MoreVerticalIcon />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={10}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => {
              if (shouldPreventFocusRestoreRef.current) {
                e.preventDefault()
                shouldPreventFocusRestoreRef.current = false
              }
            }}
            className="shadow-drop-neutral-1 border-teal-gray-50 z-1100 flex w-35 flex-col items-start gap-1 rounded-[0.625rem] border bg-white p-0.5"
          >
            {status === "DRAFT" ? (
              <DropdownItem label="공개하기" onClick={withClose(onPublish)} />
            ) : (
              <button
                type="button"
                onClick={handlePrivatizeClick}
                className={cn(
                  "hover:bg-teal-gray-50 flex h-13 w-full flex-col items-start justify-center rounded-lg px-4 text-left transition-colors",
                )}
              >
                <span className="text-body-2-regular text-teal-gray-700">
                  비공개하기
                </span>
                <span className="text-teal-gray-400 text-[0.625rem] leading-[150%]">
                  학교 공유 보관함으로
                </span>
              </button>
            )}

            {status !== "CLOSED" && (
              // TODO: API 연동 시 지원자 1명 이상인 OPEN 글은 수정하기를 disabled 처리
              <DropdownItem label="수정하기" onClick={withClose(onEdit)} />
            )}

            <DropdownItem label="복제하기" onClick={withClose(onDuplicate)} />

            <DropdownItem
              label="삭제"
              onClick={withClose(onDelete)}
              className="text-error-500"
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <CtaModal
        open={privatizeConfirmOpen}
        title="모집을 비공개할까요?"
        content="모집을 비공개하면 지원자에게 더 이상 보이지 않습니다. 공고는 해당 학교의 공유 보관함으로 이동됩니다."
        cancelText="돌아가기"
        confirmText="비공개하기"
        variant="success"
        onOpenChange={setPrivatizeConfirmOpen}
        onCancel={() => setPrivatizeConfirmOpen(false)}
        onConfirm={() => {
          setPrivatizeConfirmOpen(false)
          onPrivatize?.()
        }}
      />
    </>
  )
}
