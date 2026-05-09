import TypeCheckSizeSm from "@/shared/assets/icon/check/TypeCheckSizeSm"
import { cn } from "@/shared/lib/utils"

interface DropdownItemProps {
  label: string
  onClick: () => void
  isSelected?: boolean
  className?: string
}

export function DropdownItem({
  label,
  onClick,
  isSelected = false,
  className,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-body-2-medium text-teal-gray-700 flex h-10 w-full shrink-0 items-center gap-2.5 rounded-lg bg-white py-0 pr-2.5 pl-4 text-left transition-[background-color,color,box-shadow]",
        !isSelected && "hover:bg-teal-gray-50 hover:shadow-inner-neutral-3",
        isSelected &&
          "shadow-inner-neutral-4 hover:shadow-inner-neutral-4 bg-teal-50 text-teal-600 hover:bg-teal-50",
        className,
      )}
    >
      <span
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-2.5",
          isSelected && "text-subtitle-4-semibold text-teal-600",
        )}
      >
        {label}
        {isSelected && (
          <TypeCheckSizeSm className="shrink-0 text-teal-500" aria-hidden />
        )}
      </span>
    </button>
  )
}
