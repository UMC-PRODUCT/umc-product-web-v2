import { cn } from "@/shared/lib/utils"
import { StatusChipDropdown } from "@/shared/ui/chip/StatusChipDropdown"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"

import type { StatusValue } from "../../model/types"

interface ApplicantRowProps {
  name: string
  university: string
  round: number
  status: StatusValue
  processedAt: { date: string; time: string } | null
  appliedAt: { date: string; time: string }
  isSelected?: boolean
  onClick?: () => void
  onStatusChange?: (status: StatusValue) => void
  statusDisabled?: boolean
}

export function ApplicantRow({
  name,
  university,
  round,
  status,
  processedAt,
  appliedAt,
  isSelected = false,
  onClick,
  onStatusChange,
  statusDisabled = false,
}: ApplicantRowProps) {
  return (
    <div
      role="row"
      className="flex h-15 items-center border-b border-[rgba(239,240,240,0.6)] bg-white transition-colors"
    >
      <div className="flex items-center gap-6">
        {/* 이름 + 대학 */}
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex h-12.5 w-37.5 flex-col justify-center rounded-lg px-3.5 text-left",
            isSelected && "bg-teal-50",
          )}
        >
          <span className="text-body-2-medium text-teal-gray-900">{name}</span>
          <span className="text-caption-3-regular text-teal-gray-600">
            {university}
          </span>
        </button>

        {/* 차수 + 상태 */}
        <div className="flex items-center">
          <div className="flex w-9.5 items-center justify-center overflow-clip">
            <span className="text-label-2-medium text-teal-gray-800">
              {round}차
            </span>
          </div>
          <div className="flex h-12.5 w-25 flex-col items-start justify-center px-2.5">
            {statusDisabled ? (
              <StatusChipTag value={status} type="chip" disabled />
            ) : (
              <StatusChipDropdown
                value={status}
                onValueChange={onStatusChange}
              />
            )}
          </div>
        </div>

        {/* 처리 시간 */}
        <div className="flex h-12.5 w-35 items-center justify-center">
          {processedAt ? (
            <span className="text-body-2-regular flex w-27.75 items-center justify-between whitespace-nowrap">
              <span className="text-teal-gray-900 flex w-20 items-center gap-1">
                <span>{processedAt.date}</span>
                <span>{processedAt.time}</span>
              </span>
              <span className="text-teal-gray-600">처리</span>
            </span>
          ) : (
            <span className="text-body-2-regular text-teal-gray-400">-</span>
          )}
        </div>

        {/* 지원 시간 */}
        <div className="flex h-12.5 w-35 items-center justify-center">
          <span className="text-body-2-regular flex w-27.75 items-center justify-between whitespace-nowrap">
            <span className="text-teal-gray-900 flex w-20 items-center gap-1">
              <span>{appliedAt.date}</span>
              <span>{appliedAt.time}</span>
            </span>
            <span className="text-teal-gray-600">지원</span>
          </span>
        </div>
      </div>
    </div>
  )
}
