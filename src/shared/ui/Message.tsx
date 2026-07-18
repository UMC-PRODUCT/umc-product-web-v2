import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { cn } from "@/shared/lib/utils"

import type { HTMLAttributes, ReactNode } from "react"

const messageToneClasses = {
  error: "text-error-500",
  success: "text-success-600",
  default: "text-teal-gray-500",
  warning: "text-warning-500",
} as const

const messageIcons = {
  error: CircleBang,
  success: CheckIcon,
  default: InfoCircleIcon,
  warning: WarningTriangleIcon,
} as const

export type MessageTone = keyof typeof messageToneClasses

interface MessageProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: MessageTone
}

export function Message({
  children,
  tone = "error",
  className,
  ...props
}: MessageProps) {
  const Icon = messageIcons[tone]

  return (
    <span
      className={cn(
        "text-body-2-medium inline-flex items-center gap-1",
        messageToneClasses[tone],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span>{children}</span>
    </span>
  )
}
