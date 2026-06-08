import { cn } from "@/shared/lib/utils"
import { InputBox } from "@/shared/ui/input/InputBox"

import { EmojiScaleQuestion } from "./EmojiScaleQuestion"

import type { ChangeEvent } from "react"

import type { RatingScore } from "@/shared/assets/icon/emoji"

export interface EmojiScaleWithTextQuestionProps {
  scores: RatingScore[]
  labels: string[]
  textPlaceholder: string
  scaleValue: RatingScore | null
  textValue: string
  onScaleChange: (score: RatingScore) => void
  onTextChange: (text: string) => void
  ariaLabel?: string
}

export const EmojiScaleWithTextQuestion = ({
  scores,
  labels,
  textPlaceholder,
  scaleValue,
  textValue,
  onScaleChange,
  onTextChange,
  ariaLabel,
}: EmojiScaleWithTextQuestionProps) => {
  const showText = scaleValue !== null

  return (
    <div className="flex w-full flex-col">
      <EmojiScaleQuestion
        ariaLabel={ariaLabel}
        scores={scores}
        labels={labels}
        value={scaleValue}
        onChange={onScaleChange}
      />
      <div
        aria-hidden={!showText}
        inert={!showText || undefined}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          showText
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex w-full justify-center pt-6">
            <InputBox
              value={textValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onTextChange(e.target.value)
              }
              placeholder={textPlaceholder}
              className="w-full max-w-75"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
