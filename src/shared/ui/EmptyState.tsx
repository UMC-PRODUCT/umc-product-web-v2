import DocumentIcon from "@/shared/assets/icon/document/DocumentIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

import type { ReactNode } from "react"

interface EmptyStateProps {
  message: string
  subMessage: string
  button?: {
    label: string
    onClick: () => void
  }
  action?: ReactNode
  className?: string
}

export function EmptyState({
  message,
  subMessage,
  button,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 self-stretch pt-24 pb-20",
        className,
      )}
    >
      <DocumentIcon />
      <div className="flex flex-col items-center gap-1 self-stretch">
        <span className="text-heading-6-semibold text-teal-gray-400 self-stretch text-center">
          {message}
        </span>
        <span className="text-body-2-regular text-teal-gray-400 self-stretch text-center">
          {subMessage}
        </span>
      </div>
      {button && (
        <Button color="primary" size="lg" onClick={button.onClick}>
          {button.label}
        </Button>
      )}
      {action}
    </div>
  )
}
