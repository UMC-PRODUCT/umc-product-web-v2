import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"

import type { ReactNode } from "react"

interface RecruitmentNoticePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: ReactNode
  isClosed?: boolean
  applyLoading?: boolean
  onApply: () => void
  onBack?: () => void
}

export function RecruitmentNoticePreviewModal({
  open,
  onOpenChange,
  title,
  content,
  isClosed = false,
  applyLoading = false,
  onApply,
  onBack,
}: RecruitmentNoticePreviewModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay tone="light" />
        <Modal.Content className="shadow-drop-neutral-3 flex max-h-155 w-204 max-w-[calc(100vw-2rem)] flex-col gap-6 rounded-[1.25rem] bg-white p-5 focus:outline-none">
          <div className="flex min-h-0 flex-1 flex-col items-start gap-4">
            <div className="flex w-full items-center gap-2">
              <div className="bg-teal-gray-200 h-10 w-10 shrink-0 rounded-lg" />
              <Modal.Title className="text-heading-6-semibold text-teal-gray-900 min-w-0 flex-1 truncate">
                {title}
              </Modal.Title>
            </div>

            <Modal.Description className="text-body-1-regular text-teal-gray-600 min-h-34.5 w-full flex-1 overflow-y-auto whitespace-pre-wrap">
              {content}
            </Modal.Description>
          </div>

          <div className="flex w-full items-start gap-2.5">
            <Button
              type="button"
              variant="weak"
              color="neutral"
              size="m"
              className="grow"
              onClick={() => {
                onOpenChange(false)
                onBack?.()
              }}
            >
              돌아가기
            </Button>
            {!isClosed && (
              <Button
                type="button"
                variant="fill"
                color="primary"
                size="m"
                className="grow"
                isLoading={applyLoading}
                onClick={applyLoading ? undefined : onApply}
              >
                지원하기
              </Button>
            )}
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
