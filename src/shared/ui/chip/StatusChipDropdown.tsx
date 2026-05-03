import { Popover } from "radix-ui"
import { type ReactNode, useState } from "react"

import { cn } from "@/shared/lib/utils"

import { StatusChipTag } from "./StatusChipTag"

type StatusValue = "pass" | "fail" | "pending"

const STATUS_OPTIONS: StatusValue[] = ["pass", "fail", "pending"]

interface StatusChipDropdownProps {
  value: StatusValue
  onValueChange?: (value: StatusValue) => void
  disabled?: boolean
  children?: ReactNode
  className?: string
}

export function StatusChipDropdown({
  value,
  onValueChange,
  disabled = false,
  children,
  className,
}: StatusChipDropdownProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (next: StatusValue) => {
    onValueChange?.(next)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        {children ?? (
          <button type="button" className={cn("cursor-pointer", className)}>
            <StatusChipTag value={value} type="chip" />
          </button>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="shadow-drop-neutral-1 z-[1100] rounded-[0.375rem] bg-white px-3 pt-2.5 pb-3"
          data-status-chip-dropdown
        >
          <div className="flex flex-col gap-2">
            <span className="text-caption-2-medium text-teal-gray-400 pl-0.5">
              배정 상태 변경
            </span>
            <div className="flex flex-col gap-2.5">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleSelect(status)}
                  className="flex cursor-pointer"
                >
                  <StatusChipTag value={status} type="chip" />
                </button>
              ))}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
