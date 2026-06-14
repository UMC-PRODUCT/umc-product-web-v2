import { cn } from "@/shared/lib/utils"
import { CheckboxIndicator } from "@/shared/ui/input/checkbox/CheckboxIndicator"

interface CalendarScheduleListProps {
  roundLabel: string
  title: string
  startDate: string // "2025-05-11"
  startTime: string // "00:00"
  endDate: string // "2025-05-13"
  endTime: string // "23:59"
  state?: "default" | "active" | "disabled"
  onClick?: () => void
  className?: string
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-")
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const currentYear = new Date().getFullYear()
  return Number(y) !== currentYear ? `${y}년 ${m}월 ${d}일` : `${m}월 ${d}일`
}

function formatScheduleDateTime(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
) {
  if (startDate === endDate) {
    return `${formatDate(startDate)} ${startTime} ~ ${endTime}`
  }
  return `${formatDate(startDate)} ${startTime} ~ ${formatDate(endDate)} ${endTime}`
}

export function CalendarScheduleList({
  roundLabel,
  title,
  startDate,
  startTime,
  endDate,
  endTime,
  state = "default",
  onClick,
  className,
}: CalendarScheduleListProps) {
  const isActive = state === "active"
  const isDisabled = state === "disabled"

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        "flex w-95 rounded-lg border-l-8 border-l-teal-500 pl-2",
        isActive ? "bg-teal-50" : "bg-teal-gray-50",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-1 items-center gap-2.5 rounded-r-lg border-y border-r px-3.5 py-2.25",
          isActive ? "border-teal-100" : "border-teal-gray-100",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* 제목 */}
          <div
            className={cn(
              "flex items-start gap-1.5 tracking-[-0.32px]",
              isActive
                ? "text-label-1-semibold text-teal-600"
                : "text-label-1-medium",
            )}
          >
            <span
              className={cn(
                "w-7 shrink-0 overflow-hidden text-ellipsis",
                !isActive && "text-teal-600",
              )}
            >
              {roundLabel}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap",
                !isActive && !isDisabled && "text-teal-gray-900",
                isDisabled && "text-teal-gray-500",
              )}
            >
              {title}
            </span>
          </div>

          {/* 날짜 & 시간: 날짜 미입력 시 invisible로 높이 유지 */}
          <span
            className={cn(
              "text-body-3-medium whitespace-nowrap opacity-80",
              isDisabled ? "text-teal-gray-400" : "text-teal-gray-500",
              !startDate && "invisible",
            )}
          >
            {startDate
              ? formatScheduleDateTime(startDate, startTime, endDate, endTime)
              : "\u00A0"}
          </span>
        </div>

        {/* 완료 체크박스 */}
        {isDisabled && (
          <CheckboxIndicator
            checked
            variant="primary"
            disabled
            className="size-6"
          />
        )}
      </div>
    </div>
  )
}
