import { cn } from "@/shared/lib/utils"
import { ChallengerLinkButton } from "@/shared/ui/button/ChallengerLinkButton"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { TimestampLabel } from "@/shared/ui/TimestampLabel"

import type { Role, StatusValue } from "../model/types"

interface ApplicantDetailRowProps {
  round: number
  role: Role
  name: string
  university: string
  status: StatusValue
  processedAt: { date: string; time: string } | null
  appliedAt: { date: string; time: string }
  onChallengerClick?: () => void
  className?: string
}

export function ApplicantDetailRow({
  round,
  role,
  name,
  university,
  status,
  processedAt,
  appliedAt,
  onChallengerClick,
  className,
}: ApplicantDetailRowProps) {
  return (
    <div
      role="row"
      className={cn(
        "border-teal-gray-150/60 flex h-[60px] items-center border-b bg-white pr-[64px] pl-[136px]",
        className,
      )}
    >
      <div className="flex items-center">
        {/* 차수 */}
        <div className="flex h-[50px] w-[74px] items-center justify-center">
          <span className="text-body-2-medium text-teal-gray-800">
            {round}차
          </span>
        </div>

        {/* 파트 */}
        <div className="flex h-[50px] w-[122px] items-center px-2.5">
          <PartTagChip role={role} />
        </div>

        {/* 챌린저 */}
        <div className="w-[200px] px-0.5">
          <ChallengerLinkButton
            name={name}
            university={university}
            onClick={onChallengerClick}
          />
        </div>

        {/* 합불 상태 */}
        <div className="flex h-[50px] w-[136px] items-center px-2.5">
          <StatusChipTag value={status} type="tag" />
        </div>

        {/* 처리 시간 */}
        <div className="flex h-[50px] w-[160px] items-center justify-center">
          {processedAt ? (
            <TimestampLabel
              date={processedAt.date}
              time={processedAt.time}
              action="처리"
            />
          ) : (
            <TimestampLabel date="00/00" time="00:00" action="처리" />
          )}
        </div>

        {/* 지원 시간 */}
        <div className="flex h-[50px] w-[160px] items-center justify-center">
          <TimestampLabel
            date={appliedAt.date}
            time={appliedAt.time}
            action="지원"
          />
        </div>
      </div>
    </div>
  )
}
