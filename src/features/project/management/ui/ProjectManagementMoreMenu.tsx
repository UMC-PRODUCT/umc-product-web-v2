import { Popover } from "radix-ui"
import { useState } from "react"

import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

const MENU_ITEMS = [
  { label: "지원현황 확인하기", onClick: () => {} },
  { label: "기획 보기", onClick: () => {} },
  { label: "프로젝트 수정하기", onClick: () => {} },
  { label: "팀원 구성보기", onClick: () => {} },
] as const

interface ProjectManagementMoreMenuProps {
  projectName: string
  onDelete?: () => void
}

export function ProjectManagementMoreMenu({
  projectName,
  onDelete,
}: ProjectManagementMoreMenuProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDeleteClick = () => {
    setPopoverOpen(false)
    setDeleteOpen(true)
  }

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <MoreVerticalIcon />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={10}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="shadow-drop-neutral-1 border-teal-gray-50 z-[1100] flex w-[9.5rem] flex-col items-start gap-1 rounded-lg border bg-white px-0.5 pt-2.5 pb-0.5"
          >
            <span className="text-label-3-semibold text-teal-gray-400 px-4">
              바로가기
            </span>

            <div className="flex w-full flex-col">
              {MENU_ITEMS.map(({ label, onClick }) => (
                <DropdownItem key={label} label={label} onClick={onClick} />
              ))}
              <DropdownItem
                label="삭제"
                onClick={handleDeleteClick}
                className="text-error-500"
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <CtaModal
        open={deleteOpen}
        title="프로젝트 삭제"
        content={
          <>
            프로젝트를 삭제하면 복구할 수 없습니다. <br /> '{projectName}'을
            정말 삭제하시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="삭제하기"
        variant="error"
        onOpenChange={setDeleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete?.()
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
