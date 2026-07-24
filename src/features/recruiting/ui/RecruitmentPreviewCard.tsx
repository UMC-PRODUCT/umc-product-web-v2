import { cn } from "@/shared/lib/utils"
import { Timestamp } from "@/shared/ui/timestamp/Timestamp"

interface RecruitmentPreviewCardProps {
  title: string
  footer?: string
  startLabel: string
  endLabel: string
  className?: string
}

export function RecruitmentPreviewCard({
  title,
  footer,
  startLabel,
  endLabel,
  className,
}: RecruitmentPreviewCardProps) {
  return (
    <div
      className={cn(
        "border-teal-gray-300 flex w-full items-center gap-1 rounded-xl border bg-white px-5 py-4.5",
        className,
      )}
    >
      <div className="flex flex-col items-start">
        <div className="flex items-start gap-1.75 self-stretch">
          <span className="text-body-1-medium overflow-hidden text-teal-600">
            {title}
          </span>
          {footer && (
            <span className="text-body-1-medium text-teal-gray-900 overflow-hidden">
              {footer}
            </span>
          )}
        </div>
        <div className="flex items-start gap-0.5">
          <Timestamp>{startLabel}</Timestamp>
          <Timestamp>~</Timestamp>
          <Timestamp>{endLabel}</Timestamp>
        </div>
      </div>
    </div>
  )
}
