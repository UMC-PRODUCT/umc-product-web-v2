import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"

import type { ReactNode } from "react"

type CtaModalVariant = "warning" | "error"

interface CtaModalProps {
  open: boolean
  title: string
  content: ReactNode
  cancelText: string
  confirmText: string
  variant?: CtaModalVariant
  overlayTone?: "light" | "deep"
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: () => void
}

export function CtaModal({
  open,
  title,
  content,
  cancelText,
  confirmText,
  variant = "warning",
  overlayTone = "light",
  onOpenChange,
  onCancel,
  onConfirm,
}: CtaModalProps) {
  const toneClassName = variant === "error" ? "text-error-500" : "text-teal-500"

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) onCancel()
      }}
    >
      <Modal.Portal>
        <Modal.Overlay tone={overlayTone} />
        <Modal.Content className="shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none">
          <div className="flex flex-col items-start gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <WarningTriangleIcon className={cn("h-6 w-6", toneClassName)} />
              <Modal.Title
                className={cn("text-subtitle-1-semibold", toneClassName)}
              >
                {title}
              </Modal.Title>
            </div>
            <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
              {content}
            </Modal.Description>
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
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="fill"
              color="primary"
              size="s"
              className="rounded-[10px]"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
