import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"

interface AddRadioOptionButtonProps extends Omit<
  ComponentProps<"button">,
  "onClick"
> {
  onAdd: () => void
}

export function AddRadioOptionButton({
  onAdd,
  children = "옵션 추가",
  className,
  ...props
}: AddRadioOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        "hover:bg-teal-gray-50 inline-flex items-center gap-3 rounded-[8px] p-2 transition-colors",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="border-teal-gray-300 inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white md:size-5"
      />
      <span className="text-body-2-regular text-teal-gray-400">{children}</span>
    </button>
  )
}
