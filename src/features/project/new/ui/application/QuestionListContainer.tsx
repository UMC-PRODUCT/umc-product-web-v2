import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { cn } from "@/shared/lib/utils"

import type { DragEndEvent } from "@dnd-kit/core"
import type { ReactNode } from "react"

interface QuestionListContainerProps {
  children: ReactNode
  className?: string
  itemIds: string[]
  onReorder: (from: number, to: number) => void
}

export function QuestionListContainer({
  children,
  className,
  itemIds,
  onReorder,
}: QuestionListContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = itemIds.indexOf(String(active.id))
    const to = itemIds.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    onReorder(from, to)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            "shadow-inner-neutral-2 bg-teal-gray-50 flex w-full flex-col items-start gap-10 rounded-b-[12px] border-r border-b border-l border-teal-300",
            className,
          )}
        >
          {children}
        </div>
      </SortableContext>
    </DndContext>
  )
}
