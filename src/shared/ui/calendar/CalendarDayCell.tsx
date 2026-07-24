import { cn } from "@/shared/lib/utils"

type DayCellState = "default" | "selected" | "active" | "disabled"
type HighlightPosition = "start" | "end" | "middle" | "single"

interface CalendarDayCellProps {
  day: number
  state?: DayCellState
  highlightPosition?: HighlightPosition | null
  onClick?: () => void
}

export function CalendarDayCell({
  day,
  state = "default",
  highlightPosition = null,
  onClick,
}: CalendarDayCellProps) {
  const isDisabled = state === "disabled"
  const isSelected = state === "selected"
  const isActive = state === "active"
  const isSingle = highlightPosition === "single"
  const isRangeEndpoint =
    highlightPosition === "start" || highlightPosition === "end"
  const hasCircleBg = isSelected || isActive || isRangeEndpoint || isSingle

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "relative flex h-9 items-center justify-center",
        isDisabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      {/* 범위 하이라이트 스트립 (단일 날짜 제외) */}
      {highlightPosition && !isSingle && (
        <div
          className={cn(
            "absolute -top-1.5 -bottom-1.5 bg-teal-100",
            highlightPosition === "start" && "right-0 left-1/2",
            highlightPosition === "end" && "right-1/2 left-0",
            highlightPosition === "middle" && "inset-x-0",
          )}
        />
      )}

      {/* 원형 배경 */}
      <div
        className={cn(
          "relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          !hasCircleBg && !isDisabled && "hover:bg-teal-gray-100",
          isSelected && "bg-teal-300 text-white",
          isActive && "bg-teal-500 text-white hover:bg-teal-700",
          (isRangeEndpoint || isSingle) &&
            !isSelected &&
            !isActive &&
            "bg-teal-500 text-white",
          isDisabled && "text-teal-gray-200",
          !hasCircleBg && !isDisabled && "text-teal-gray-900",
        )}
      >
        <span className="text-subtitle-2-medium leading-none">{day}</span>
      </div>
    </button>
  )
}
