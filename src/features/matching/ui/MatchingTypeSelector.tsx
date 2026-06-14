import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

import { MATCHING_TYPES, type MatchingType } from "../model/matchingRoundMock"

const tabVariants = cva(
  "inline-flex h-9.5 w-full flex-1 basis-0 items-center justify-center whitespace-nowrap rounded-[12px] transition-colors",
  {
    variants: {
      selected: {
        true: "bg-white text-teal-gray-800 text-label-1-semibold shadow-[13px_0px_14px_0px_rgba(211,216,216,0.4),0px_1px_2px_0px_rgba(99,196,184,0.2),0px_0px_10px_0px_rgba(156,163,163,0.3)]",
        false: "bg-transparent text-teal-600 text-subtitle-3-semibold",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

interface MatchingTypeSelectorProps {
  selected: MatchingType
  onChange: (value: MatchingType) => void
  className?: string
}

export function MatchingTypeSelector({
  selected,
  onChange,
  className,
}: MatchingTypeSelectorProps) {
  return (
    <div
      className={cn(
        "bg-teal-gray-100 shadow-inner-neutral-2 flex h-11.5 w-[734px] items-center gap-2 rounded-[14px] p-1",
        className,
      )}
    >
      {MATCHING_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          aria-pressed={type === selected}
          onClick={() => onChange(type)}
          className={tabVariants({ selected: type === selected })}
        >
          {type}
        </button>
      ))}
    </div>
  )
}
