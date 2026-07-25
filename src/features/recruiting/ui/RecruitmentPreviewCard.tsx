import { cn } from "@/shared/lib/utils"
import { Timestamp } from "@/shared/ui/timestamp/Timestamp"

interface RecruitmentPreviewCardProps {
  title: string
  footer?: string
  // 모집 생성 미리보기 등에서만 명시적으로 넘기는 안내 문구(모집 생성 전용)
  // 넘기지 않으면 footer가 없을 때 기존처럼 아무것도 표시하지 않는다. (타 파일들)
  emptyFooterPlaceholder?: string
  // 모집 생성 전용: footer를 직접 수정할 수 있도록 input을 표시하고, 변경 시 호출되는 콜백
  onFooterChange?: (value: string) => void
  startLabel: string
  endLabel: string
  className?: string
}

export function RecruitmentPreviewCard({
  title,
  footer,
  emptyFooterPlaceholder,
  onFooterChange,
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
          {onFooterChange ? (
            <input
              type="text"
              aria-label="꼬릿말"
              value={footer ?? ""}
              onChange={(e) => onFooterChange(e.target.value)}
              placeholder={emptyFooterPlaceholder}
              className="text-body-1-medium text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 bg-transparent outline-none"
            />
          ) : footer ? (
            <span className="text-body-1-medium text-teal-gray-900 overflow-hidden">
              {footer}
            </span>
          ) : (
            emptyFooterPlaceholder && (
              <span className="text-body-1-medium text-teal-gray-400 overflow-hidden">
                {emptyFooterPlaceholder}
              </span>
            )
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
