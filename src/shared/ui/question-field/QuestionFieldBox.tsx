import { cn } from "@/shared/lib/utils"

import type { ReactNode } from "react"

export type QuestionFieldState = "default" | "focus" | "filled" | "error"

interface QuestionFieldBoxProps {
  state?: QuestionFieldState
  size?: "lg" | "md"
  children: ReactNode
  className?: string
}

export function QuestionFieldBox({
  state = "default",
  size = "lg",
  children,
  className,
}: QuestionFieldBoxProps) {
  return (
    <div
      data-state={state}
      className={cn(
        "border-teal-gray-100 flex w-full flex-col justify-center gap-1.5 rounded-[12px] border bg-white",
        size === "md" ? "px-4 py-3" : "px-5 py-4",
        "data-[state=focus]:border-teal-gray-150 data-[state=focus]:bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)]",
        "data-[state=error]:border-error-500",
        className,
      )}
    >
      {children}
    </div>
  )
}
