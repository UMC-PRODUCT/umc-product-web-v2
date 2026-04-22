import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

export type QuestionFieldState = "default" | "focus" | "filled"

interface QuestionFieldBoxProps {
  state?: QuestionFieldState
  children: ReactNode
  className?: string
}

export function QuestionFieldBox({
  state = "default",
  children,
  className,
}: QuestionFieldBoxProps) {
  return (
    <div
      data-state={state}
      className={cn(
        "border-teal-gray-100 flex w-[814px] flex-col justify-center gap-1.5 rounded-[12px] border bg-white px-5 py-4",
        className,
      )}
    >
      {children}
    </div>
  )
}
