import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { cn } from "@/shared/lib/utils"

import type { Staff } from "../../model/evaluatorAllocation"

interface AssignedStaffChipProps {
  staff: Staff
  isSelected: boolean
  onSelect: (id: string | null) => void
}

export function AssignedStaffChip({
  staff,
  isSelected,
  onSelect,
}: AssignedStaffChipProps) {
  const textColorClass = isSelected
    ? "text-teal-gray-400"
    : "text-role-product-600"

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onSelect(isSelected ? null : staff.id)
      }}
      className="bg-role-product-200 flex w-fit cursor-pointer items-center gap-[7px] rounded-[8px] px-[9px] py-[2.5px] select-none"
    >
      <HamburgerIcon className={cn("h-4 w-4", textColorClass)} />
      <div className="flex items-center gap-0.5">
        <span className={cn("text-subtitle-2-medium", textColorClass)}>
          {staff.nickname}
        </span>
        <span className={cn("text-subtitle-2-medium", textColorClass)}>/</span>
        <span className={cn("text-subtitle-2-medium", textColorClass)}>
          {staff.name}
        </span>
      </div>
    </div>
  )
}
