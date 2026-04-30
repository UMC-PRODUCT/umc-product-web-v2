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
        "border-teal-gray-150 flex w-full flex-col justify-center gap-1.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] px-5 py-4",
        "data-[state=focus]:bg-[color-mix(in_srgb,var(--color-teal-50)_50%,white_50%)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
