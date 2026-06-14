import { useEffect, useState } from "react"

import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"

interface AbortProjectModalProps {
  open: boolean
  projectName: string
  confirmLoading?: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: (reason: string) => void
}

const MAX_REASON_LENGTH = 200

export function AbortProjectModal({
  open,
  projectName,
  confirmLoading = false,
  onOpenChange,
  onCancel,
  onConfirm,
}: AbortProjectModalProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!open) setReason("")
  }, [open])

  const trimmedReason = reason.trim()
  const canConfirm = trimmedReason.length > 0 && !confirmLoading

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
        <Modal.Content className="shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[10px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none">
          <div className="flex flex-col items-start gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <WarningTriangleIcon className="text-error-500 h-6 w-6" />
              <Modal.Title className="text-subtitle-1-semibold text-error-500">
                프로젝트 중단
              </Modal.Title>
            </div>
            <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
              중단하면 '{projectName}'의 모집이 종료되고 진행 중인 지원이
              취소됩니다. 중단 사유를 입력해 주세요.
            </Modal.Description>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={MAX_REASON_LENGTH}
              rows={3}
              placeholder="중단 사유를 입력해 주세요."
              className="text-body-2-regular text-teal-gray-800 placeholder:text-teal-gray-400 h-24 w-full resize-none rounded-[8px] border border-neutral-200 px-3 py-2.5 outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex w-full justify-end gap-3">
            <Button
              type="button"
              variant="weak"
              color="neutral"
              size="s"
              className="rounded-[10px]"
              onClick={onCancel}
            >
              돌아가기
            </Button>
            <Button
              type="button"
              variant="fill"
              color="primary"
              size="s"
              className="rounded-[10px]"
              isLoading={confirmLoading}
              disabled={!canConfirm}
              onClick={() => onConfirm(trimmedReason)}
            >
              중단하기
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
