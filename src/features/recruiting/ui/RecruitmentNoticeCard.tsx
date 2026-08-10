import { cn } from "@/shared/lib/utils"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import { Timestamp } from "@/shared/ui/timestamp/Timestamp"

import type { PartTag } from "@/shared/model/domain"

export interface RecruitmentNoticeCardProps {
  title: string
  period: string
  parts: PartTag[]
  isClosed: boolean
  dDay?: number
  logoUrl?: string
  onClick?: () => void
  className?: string
}

export function RecruitmentNoticeCard({
  title,
  period,
  parts,
  isClosed,
  dDay,
  logoUrl,
  onClick,
  className,
}: RecruitmentNoticeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group border-teal-gray-100 flex w-full flex-col items-start gap-5 rounded-2xl border bg-white py-5 pr-5 pl-4 text-left",
        className,
      )}
    >
      <div className="flex w-full items-start gap-4">
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-12.5 w-12.5 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-teal-gray-200 h-12.5 w-12.5 shrink-0 rounded-lg" />
          )}

          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col items-start gap-1">
              <p className="text-heading-7-semibold text-teal-900 group-hover:text-teal-500">
                {title}
              </p>
              <Timestamp>{period}</Timestamp>
            </div>

            <div className="flex items-center gap-2">
              {parts.map((part) => (
                <PartTagChip key={part} role={part} />
              ))}
            </div>
          </div>
        </div>

        <div className="ml-auto shrink-0">
          {isClosed ? (
            <div className="bg-teal-gray-150 shadow-drop-neutral-3 rounded-[0.375rem] px-2 py-0.5">
              <span className="text-label-2-medium text-teal-gray-600">
                모집 마감
              </span>
            </div>
          ) : (
            <div className="shadow-drop-neutral-3 rounded-[0.375rem] bg-teal-100 px-2 py-0.5">
              <span className="text-label-2-medium text-teal-600">
                모집 마감{dDay !== undefined ? ` D-${dDay}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
