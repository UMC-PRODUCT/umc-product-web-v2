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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"

import HamburgerIcon from "@/shared/assets/icon/hamburger/HamburgerIcon"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import type { DragEndEvent } from "@dnd-kit/core"

import type { CurriculumItem } from "../model/curriculumData"

interface SortableCurriculumItemProps {
  item: CurriculumItem
  onRequestDelete: (item: CurriculumItem) => void
}

function SortableCurriculumItem({
  item,
  onRequestDelete,
}: SortableCurriculumItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-teal-gray-200 shadow-drop-neutral-3 flex w-full justify-between rounded-[16px] border bg-white py-5 pr-5 pl-4"
    >
      <div className="flex gap-3">
        <div className="h-full">
          <button
            type="button"
            className="cursor-grab touch-none active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <HamburgerIcon className="text-teal-gray-700 size-6" />
          </button>
        </div>

        <div className="flex gap-[11px]">
          <span className="text-heading-6-semibold text-teal-600">
            {item.number}
          </span>

          <div className="flex flex-col gap-1">
            <span className="text-heading-6-semibold text-teal-gray-900">
              {item.title}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-body-1-medium text-teal-gray-500">
                워크북 {String(item.workbookCount).padStart(2, "0")}개
              </span>
              <div className="bg-teal-gray-300 size-[3px] rounded-full" />
              <span className="text-body-1-medium text-teal-gray-500">
                미션 {String(item.missionCount).padStart(2, "0")}개
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-full">
        <button
          type="button"
          onClick={() => onRequestDelete(item)}
          className="text-subtitle-2-medium text-teal-gray-500 decoration-teal-gray-500 cursor-pointer px-1 py-0.5 hover:underline"
        >
          삭제
        </button>
      </div>
    </div>
  )
}

interface CurriculumSettingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CurriculumItem[]
  onDeleteItem: (id: string) => void
  onReorderItems: (fromIndex: number, toIndex: number) => void
  onRestoreItem?: (item: CurriculumItem, index: number) => void
}

export function CurriculumSettingModal({
  open,
  onOpenChange,
  items,
  onDeleteItem,
  onReorderItems,
  onRestoreItem,
}: CurriculumSettingModalProps) {
  const [itemToDelete, setItemToDelete] = useState<CurriculumItem | null>(null)
  const addToast = useToastStore((s) => s.addToast)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const itemIds = items.map((i) => i.id)
    const fromIndex = itemIds.indexOf(String(active.id))
    const toIndex = itemIds.indexOf(String(over.id))
    if (fromIndex < 0 || toIndex < 0) return
    onReorderItems(fromIndex, toIndex)
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    const targetItem = itemToDelete
    const targetIndex = items.findIndex((i) => i.id === targetItem.id)

    onDeleteItem(targetItem.id)
    setItemToDelete(null)

    addToast({
      message: "선택한 커리큘럼이 삭제되었습니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 5000,
      action: {
        label: "되돌리기",
        onClick: () => {
          onRestoreItem?.(
            targetItem,
            targetIndex >= 0 ? targetIndex : items.length,
          )
        },
      },
    })
  }

  return (
    <>
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="shadow-drop-neutral-2 border-teal-gray-100 flex h-180 w-227 flex-col gap-8 overflow-y-auto rounded-[16px] border bg-white px-8 py-7.5 focus:outline-none">
            <Modal.Title className="text-heading-4-semibold text-teal-gray-900">
              커리큘럼 설정
            </Modal.Title>

            {items.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex w-full flex-col gap-2.5">
                    {items.map((item) => (
                      <SortableCurriculumItem
                        key={item.id}
                        item={item}
                        onRequestDelete={(target) => setItemToDelete(target)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="flex w-full flex-1 items-center justify-center">
                <p className="text-body-2-medium text-teal-gray-400">
                  현재 등록된 커리큘럼이 없습니다
                </p>
              </div>
            )}
          </Modal.Content>
        </Modal.Portal>

        <CtaModal
          open={!!itemToDelete}
          title="커리큘럼을 삭제하시겠습니까?"
          content={
            <span className="block w-full break-keep">
              해당 커리큘럼의 워크북과 미션들까지 삭제되며
              <br />
              삭제 후 복구 할 수 없습니다.
            </span>
          }
          cancelText="돌아가기"
          confirmText="삭제하기"
          variant="error"
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setItemToDelete(null)
          }}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      </Modal.Root>
    </>
  )
}
