import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface TimestampProps {
  children: ReactNode
  className?: string
}

export function Timestamp({ children, className }: TimestampProps) {
  return (
    <span className={cn("text-body-2-regular text-teal-gray-500", className)}>
      {children}
    </span>
  )
}
