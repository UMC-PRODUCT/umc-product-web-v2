import { RatingFace } from "@/shared/assets/icon/emoji"
import { cn } from "@/shared/lib/utils"

import type { ComponentPropsWithoutRef } from "react"

import type { RatingScore } from "@/shared/assets/icon/emoji"

export interface EmojiRadioButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "type"
> {
  selected: boolean
  label: string
  score: RatingScore
}

export const EmojiRadioButton = ({
  selected,
  label,
  score,
  className,
  ...props
}: EmojiRadioButtonProps) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        "text-subtitle-3-semibold inline-flex cursor-pointer items-center gap-3 rounded-[8px] border-[1.5px] py-2 pr-3 pl-2.5 transition-colors",
        selected
          ? "border-teal-300 bg-teal-100 text-teal-600 hover:border-transparent hover:bg-[linear-gradient(0deg,rgba(199,235,230,0.5)_0%,rgba(199,235,230,0.5)_100%)]"
          : "text-teal-gray-600 bg-teal-gray-100 hover:bg-teal-gray-150 border-transparent",
        className,
      )}
      {...props}
    >
      <RatingFace
        score={score}
        variant={selected ? "default" : "neutral"}
        size="sm"
        className="shrink-0"
      />
      <span className="flex-1 text-center">{label}</span>
    </button>
  )
}
