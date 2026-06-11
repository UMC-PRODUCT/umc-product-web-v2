import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"

import type { PartRole } from "../model/matchingStatusTypes"

interface AssignmentChallengerRowProps {
  nickname: string
  university: string
  partRole: PartRole
  selected?: boolean
  onClick: () => void
}

export function AssignmentChallengerRow({
  nickname,
  university,
  partRole,
  selected = false,
  onClick,
}: AssignmentChallengerRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-teal-gray-100 flex h-[38px] w-full cursor-pointer items-center gap-3.5 border-b py-1.5 last:border-b-0",
        selected
          ? "bg-teal-50 pl-3.5"
          : "bg-teal-gray-50 hover:bg-teal-gray-100 pl-9",
      )}
    >
      {selected ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <CheckIcon className="h-4 w-4 shrink-0 text-teal-500" />
          <span className="text-body-2-medium w-37 shrink-0 text-left tracking-[-0.14px] text-teal-500">
            {nickname}
          </span>
        </div>
      ) : (
        <span className="text-body-2-medium text-teal-gray-900 w-37 shrink-0 text-left tracking-[-0.14px]">
          {nickname}
        </span>
      )}
      <span
        className={cn(
          "text-body-2-medium w-36.5 shrink-0 text-left tracking-[-0.14px]",
          selected ? "text-teal-500" : "text-teal-gray-900",
        )}
      >
        {university}
      </span>
      <PartTagChip role={partRole} />
    </button>
  )
}
