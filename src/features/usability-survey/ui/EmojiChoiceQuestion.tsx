import { EmojiRadioButton } from "./EmojiRadioButton"

import type { ChoiceValue } from "../model/types"

export interface EmojiChoiceQuestionProps {
  positiveLabel: string
  negativeLabel: string
  value: ChoiceValue | null
  onChange: (value: ChoiceValue) => void
  ariaLabel?: string
}

export const EmojiChoiceQuestion = ({
  positiveLabel,
  negativeLabel,
  value,
  onChange,
  ariaLabel,
}: EmojiChoiceQuestionProps) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex justify-center"
    >
      <div className="grid grid-cols-2 gap-4">
        <EmojiRadioButton
          selected={value === "positive"}
          score={5}
          label={positiveLabel}
          onClick={() => onChange("positive")}
        />
        <EmojiRadioButton
          selected={value === "negative"}
          score={1}
          label={negativeLabel}
          onClick={() => onChange("negative")}
        />
      </div>
    </div>
  )
}
