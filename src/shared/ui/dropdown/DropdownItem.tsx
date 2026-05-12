import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"

interface DropdownItemProps {
  label: string
  onClick: () => void
  isSelected?: boolean
  className?: string
  size?: "xs" | "md"
}

type Size = "xs" | "md"

const baseClass: Record<Size, string> = {
  xs: "text-body-3-regular text-teal-gray-600 h-[1.625rem] py-1",
  md: "text-body-2-regular text-teal-gray-700 h-10 py-0",
}

const paddingClass: Record<Size, { default: string; selected: string }> = {
  xs: { default: "px-3", selected: "pl-3 pr-2" },
  md: { default: "px-4", selected: "pl-4 pr-2.5" },
}

const labelSelectedClass: Record<Size, string> = {
  xs: "text-body-3-medium text-teal-600",
  md: "text-body-2-medium text-teal-600",
}

export function DropdownItem({
  label,
  onClick,
  isSelected = false,
  className,
  size = "md",
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full shrink-0 rounded-lg bg-white text-left transition-[background-color,color,box-shadow]",
        baseClass[size],
        isSelected ? paddingClass[size].selected : paddingClass[size].default,
        isSelected
          ? "shadow-inner-neutral-1 bg-teal-50"
          : "hover:bg-teal-gray-50 hover:shadow-inner-neutral-2",
        className,
      )}
    >
      <span
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-2.5",
          isSelected && labelSelectedClass[size],
        )}
      >
        {label}
        {isSelected && (
          <CheckIcon className="size-4 shrink-0 text-teal-500" aria-hidden />
        )}
      </span>
    </button>
  )
}
