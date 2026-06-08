import { RadioList } from "@/shared/ui/input/radio/RadioList"

import type { SelectOption } from "../model/types"

export interface SingleSelectQuestionProps {
  options: SelectOption[]
  value: string | null
  onChange: (value: string) => void
  ariaLabel?: string
}

export const SingleSelectQuestion = ({
  options,
  value,
  onChange,
  ariaLabel,
}: SingleSelectQuestionProps) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="border-teal-gray-100 flex w-full flex-col items-start gap-0.5 rounded-[12px] border bg-white p-1"
    >
      {options.map((option) => (
        <RadioList
          key={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="w-full"
        >
          {option.label}
        </RadioList>
      ))}
    </div>
  )
}
