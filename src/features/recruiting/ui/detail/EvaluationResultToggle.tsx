import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"

import type { EvaluationResult } from "../../model/applicantListTypes"

interface EvaluationResultToggleProps {
  value: EvaluationResult | null
  onChange: (value: EvaluationResult) => void
  failLabel?: string
  passLabel?: string
  disabled?: boolean
  className?: string
}

const OPTIONS: {
  value: EvaluationResult
  side: "left" | "right"
}[] = [
  { value: "fail", side: "left" },
  { value: "pass", side: "right" },
]

export function EvaluationResultToggle({
  value,
  onChange,
  failLabel = "불합격",
  passLabel = "합격",
  disabled = false,
  className,
}: EvaluationResultToggleProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "bg-teal-gray-150 inline-flex w-fit gap-px overflow-hidden rounded-[8px]",
        disabled && "opacity-40",
        className,
      )}
    >
      {OPTIONS.map(({ value: optionValue, side }) => {
        const selected = value === optionValue
        const label = optionValue === "fail" ? failLabel : passLabel
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(optionValue)}
            className={cn(
              "text-subtitle-3-semibold flex h-11 min-w-22 items-center justify-center gap-1.5 px-7 py-1 transition-colors",
              side === "left" ? "rounded-l-[8px]" : "rounded-r-[8px]",
              selected
                ? "border border-teal-200 bg-teal-100 text-teal-500"
                : "text-teal-gray-700 bg-white",
              !disabled && !selected && "hover:bg-teal-gray-50",
              disabled && "cursor-not-allowed",
            )}
          >
            {selected && <CheckIcon className="size-5 shrink-0" />}
            <span className="whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
