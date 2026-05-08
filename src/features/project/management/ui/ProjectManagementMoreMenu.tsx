import { Popover } from "radix-ui"

import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"

const MENU_ITEMS = [
  { label: "지원현황 확인하기", onClick: () => {} },
  { label: "기획 보기", onClick: () => {} },
  { label: "프로젝트 수정하기", onClick: () => {} },
  { label: "팀원 구성보기", onClick: () => {} },
] as const

interface ProjectManagementMoreMenuProps {
  onDelete?: () => void
}

export function ProjectManagementMoreMenu({
  onDelete,
}: ProjectManagementMoreMenuProps) {
  return (
    <Popover.Root>
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
              onClick={onDelete ?? (() => {})}
              className="text-error-500"
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
