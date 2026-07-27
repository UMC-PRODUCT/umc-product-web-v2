import { cn } from "@/shared/lib/utils"

const STEPS = [
  { idx: 1, label: "기본 정보" },
  { idx: 2, label: "모집 문항" },
  { idx: 3, label: "모집 공고" },
] as const

interface RecruitmentStepperProps {
  step: number
  onStepChange: (idx: number) => void
  className?: string
}

export function RecruitmentStepper({
  step,
  onStepChange,
  className,
}: RecruitmentStepperProps) {
  return (
    <nav
      aria-label="모집 등록 단계"
      className={cn(
        "bg-teal-gray-100 flex h-11.5 w-full min-w-0 items-center gap-2 rounded-[0.875rem] p-1",
        className,
      )}
    >
      {STEPS.map(({ idx, label }) => {
        const isSelected = idx === step
        return (
          <button
            key={idx}
            type="button"
            aria-current={isSelected ? "step" : undefined}
            onClick={() => onStepChange(idx)}
            className={cn(
              "flex h-9.5 flex-1 items-center gap-2 rounded-xl py-1 pr-5 pl-3",
              isSelected && "bg-white",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "text-label-3-semibold text-teal-gray-600 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                isSelected ? "bg-teal-gray-150" : "bg-teal-gray-200",
              )}
            >
              {idx}
            </span>
            <span
              className={cn(
                "text-label-1-semibold truncate",
                isSelected ? "text-teal-gray-800" : "text-teal-600",
              )}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
