import { useDraggable } from "@dnd-kit/core"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { cn } from "@/shared/lib/utils"

import type { School } from "../model/chapterManagement"

export interface SchoolChipProps {
  school: School
  dragId?: string
  variant?: "waiting" | "assigned"
  draggable?: boolean
  isDragging?: boolean
  isSelected?: boolean
  onSelect?: (id: string | null) => void
  className?: string
}

export function SchoolChip({
  school,
  dragId,
  variant = "waiting",
  draggable = true,
  isDragging: isDraggingProp,
  isSelected = false,
  onSelect,
  className,
}: SchoolChipProps) {
  const draggableHook = useDraggable({
    id: dragId ?? school.id,
    data: school,
    disabled: !draggable,
  })

  const setNodeRef = draggable ? draggableHook.setNodeRef : undefined
  const listeners = draggable ? draggableHook.listeners : undefined
  const attributes = draggable ? draggableHook.attributes : undefined
  const isDragging =
    isDraggingProp ?? (draggable ? draggableHook.isDragging : false)

  const bgClass = variant === "waiting" ? "bg-teal-100" : "bg-role-product-200"

  const iconColorClass = "text-teal-gray-400"

  const textColorClass =
    variant === "waiting"
      ? isDragging
        ? "text-teal-500/40"
        : "text-teal-600"
      : isDragging || isSelected
        ? "text-role-product-600/40"
        : "text-role-product-600"

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={
        onSelect
          ? (e) => {
              e.stopPropagation()
              onSelect(isSelected ? null : school.id)
            }
          : undefined
      }
      className={cn(
        "flex w-fit items-center gap-[7px] rounded-[8px] px-[9px] py-[2.5px] select-none",
        bgClass,
        draggable && "cursor-grab active:cursor-grabbing",
        onSelect && !draggable && "cursor-pointer",
        className,
      )}
    >
      <HamburgerIcon className={cn("h-4 w-4", iconColorClass)} />
      <div className="flex items-center gap-0.5">
        <span className={cn("text-subtitle-2-medium", textColorClass)}>
          {school.name}
        </span>
      </div>
    </div>
  )
}
