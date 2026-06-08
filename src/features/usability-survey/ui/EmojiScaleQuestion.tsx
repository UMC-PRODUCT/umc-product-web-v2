import { RatingFace } from "@/shared/assets/icon/emoji"
import { cn } from "@/shared/lib/utils"

import type { RatingScore } from "@/shared/assets/icon/emoji"

export interface EmojiScaleQuestionProps {
  scores: RatingScore[]
  labels: string[]
  value: RatingScore | null
  onChange: (score: RatingScore) => void
  ariaLabel?: string
}

export const EmojiScaleQuestion = ({
  scores,
  labels,
  value,
  onChange,
  ariaLabel,
}: EmojiScaleQuestionProps) => {
  return (
    <div className="flex w-full justify-center">
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(
          "relative flex items-end pt-7",
          scores.length <= 3 ? "gap-23" : "gap-10",
        )}
      >
        <div className="absolute right-5.5 bottom-4 left-5.5 h-0.5 bg-teal-100" />
        {scores.map((score, index) => {
          const selected = value === score
          const label = labels[index]
          return (
            <div key={score} className="relative z-10 flex w-11 justify-center">
              {label && (
                <span className="text-label-2-medium absolute bottom-full left-1/2 mb-1.5 w-max -translate-x-1/2 text-center whitespace-nowrap text-teal-500">
                  {label}
                </span>
              )}
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label || `${index + 1} / ${scores.length}`}
                onClick={() => onChange(score)}
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center"
              >
                <RatingFace
                  score={score}
                  variant={selected ? "filled" : "default"}
                  size={selected ? "lg" : "md"}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
