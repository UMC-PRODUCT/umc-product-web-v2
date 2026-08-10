import { cn } from "@/shared/lib/utils"

export type ScheduleStep = "sessions" | "assignment"

const STEPS: { id: ScheduleStep; label: string }[] = [
  { id: "sessions", label: "면접 시간 및 장소 등록" },
  { id: "assignment", label: "지원자 일정 등록" },
]

interface ScheduleStepTabsProps {
  value: ScheduleStep
  onValueChange: (value: ScheduleStep) => void
  className?: string
}

export function ScheduleStepTabs({
  value,
  onValueChange,
  className,
}: ScheduleStepTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "bg-teal-gray-100 flex w-full items-center gap-2 rounded-[12px] p-1.5",
        className,
      )}
    >
      {STEPS.map((step, index) => {
        const selected = step.id === value
        return (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onValueChange(step.id)}
            className={cn(
              "flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] transition-colors",
              selected
                ? "border-teal-gray-100 shadow-drop-neutral-3 border bg-white"
                : "hover:bg-teal-gray-150 bg-transparent",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[13px] leading-none font-semibold",
                selected
                  ? "bg-teal-600 text-white"
                  : "bg-teal-gray-200 text-teal-gray-600",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                selected
                  ? "text-subtitle-3-semibold text-teal-gray-800"
                  : "text-body-1-medium text-teal-gray-500",
              )}
            >
              {step.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
