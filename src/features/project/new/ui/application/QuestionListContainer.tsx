import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

interface QuestionListContainerProps {
  children: ReactNode
  className?: string
}

export function QuestionListContainer({
  children,
  className,
}: QuestionListContainerProps) {
  return (
    <div
      className={cn(
        "shadow-inner-neutral-2 bg-teal-gray-50 flex w-full flex-col items-start gap-10 rounded-b-[12px] border-r border-b border-l border-teal-300",
        className,
      )}
    >
      {children}
    </div>
  )
}
