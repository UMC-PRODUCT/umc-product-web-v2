import FilterDropDownIcon from "@/shared/assets/icon/chevron/FilterDropDownIcon"
import { cn } from "@/shared/lib/utils"

export interface FilterDropdownProps {
  label: string
  open?: boolean
  onClick?: () => void
  className?: string
}

function ChevronIcon({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "text-teal-gray-700 flex h-5 w-5 shrink-0 items-center justify-center",
        active && "text-teal-500",
      )}
    >
      <FilterDropDownIcon />
    </span>
  )
}

export function FilterDropdown({
  label,
  open = false,
  onClick,
  className,
}: FilterDropdownProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 min-w-[6.375rem] shrink-0 items-center gap-1 rounded-xl border py-0 pr-2.5 pl-4 text-left transition-colors",
        open
          ? "border-teal-300 bg-teal-50 text-teal-600"
          : [
              "border-teal-gray-300 text-teal-gray-900 bg-white",
              "hover:bg-teal-gray-50",
            ],
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-center justify-between gap-1">
        <span className="text-subtitle-4-semibold truncate">{label}</span>
        <ChevronIcon active={open} />
      </span>
    </button>
  )
}
