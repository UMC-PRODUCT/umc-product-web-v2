import { useDraggable } from "@dnd-kit/core"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { cn } from "@/shared/lib/utils"

import type { Staff } from "../../model/evaluatorAllocation"

interface DraggableStaffChipProps {
  staff: Staff
}

export function DraggableStaffChip({ staff }: DraggableStaffChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: staff.id,
    data: staff,
  })

  const textColorClass = isDragging
    ? "text-teal-gray-400"
    : "text-role-product-600"

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-role-product-200 flex w-fit cursor-grab items-center gap-[7px] rounded-[8px] px-[9px] py-[2.5px] select-none active:cursor-grabbing"
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
