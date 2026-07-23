import { useRef, useState } from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"

export const SCHOOL_SORT_OPTIONS = [
  { value: "name", label: "학교 이름 순" },
  { value: "branch", label: "지부 순" },
  { value: "count", label: "인원 순" },
] as const

export type SchoolSortOption = (typeof SCHOOL_SORT_OPTIONS)[number]["value"]

interface SchoolSortDropdownProps {
  value: SchoolSortOption
  onValueChange: (value: SchoolSortOption) => void
  className?: string
}

export function SchoolSortDropdown({
  value,
  onValueChange,
  className,
}: SchoolSortDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen)

  const selectedSortLabel =
    SCHOOL_SORT_OPTIONS.find((option) => option.value === value)?.label ??
    "학교 이름 순"

  return (
    <div
      ref={dropdownRef}
      className={cn("relative w-[117px] shrink-0", className)}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className={cn(
          "shadow-inner-neutral-2 text-body-2-medium box-border inline-flex h-11 w-full items-center justify-between rounded-[12px] border py-[11.5px] pr-2.5 pl-4 transition-colors",
          isDropdownOpen
            ? "border-teal-400 bg-teal-50 text-teal-600"
            : "border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 bg-white",
        )}
      >
        <span className="truncate">{selectedSortLabel}</span>
        <DownChevronIcon
          className={cn(
            "text-teal-gray-700 size-5 shrink-0 transition-transform",
            isDropdownOpen && "rotate-180 text-teal-600",
          )}
        />
      </button>

      {isDropdownOpen && (
        <div
          role="listbox"
          className="border-teal-gray-50 shadow-drop-neutral-1 absolute top-full left-0 z-50 flex w-31 flex-col rounded-[12px] border bg-white p-0.5"
        >
          {SCHOOL_SORT_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              label={option.label}
              isSelected={value === option.value}
              onClick={() => {
                onValueChange(option.value)
                setIsDropdownOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
