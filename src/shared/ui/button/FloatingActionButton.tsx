import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

interface FloatingActionButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  "aria-label": string
}

export function FloatingActionButton({
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: FloatingActionButtonProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={cn(
        "shadow-drop-neutral-2 inline-flex size-[54px] items-center justify-center rounded-full border transition-colors",
        "border-teal-gray-150 bg-teal-gray-100 text-teal-gray-700",
        "active:border-teal-200 active:bg-teal-100 active:text-teal-600",
        className,
      )}
      {...props}
    >
      <PlusIcon width={30} height={30} aria-hidden="true" />
    </button>
  )
}
