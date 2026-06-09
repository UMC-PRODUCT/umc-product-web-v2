import { cn } from "@/shared/lib/utils"

import { isItemAnswered } from "../model/types"
import { QuestionField } from "./QuestionField"
import { QuestionHeader } from "./QuestionHeader"
import { SectionDivider } from "./SectionDivider"

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyItem,
  SurveyRevealMode,
} from "../model/types"

export type { SurveyAnswers, SurveyAnswerValue } from "../model/types"

const REVEAL_DURATION = "duration-[1500ms]"
const REVEAL_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]"

interface SurveyQuestionListProps {
  items: SurveyItem[]
  answers: SurveyAnswers
  onAnswer: (id: string, value: SurveyAnswerValue) => void
  startNumber?: number
  reveal?: SurveyRevealMode
}

interface NumberedItem {
  item: SurveyItem
  number: number
}

export const SurveyQuestionList = ({
  items,
  answers,
  onAnswer,
  startNumber = 1,
  reveal,
}: SurveyQuestionListProps) => {
  let runningNumber = startNumber
  const numbered: NumberedItem[] = items.map((item) => {
    if (item.kind === "divider") return { item, number: 0 }
    const number = runningNumber
    runningNumber += 1
    return { item, number }
  })

  const renderItem = ({ item, number }: NumberedItem) => {
    if (item.kind === "divider") {
      return <SectionDivider label={item.label} />
    }
    return (
      <div className="flex w-full flex-col gap-3">
        <QuestionHeader number={number} question={item.text} />
        <QuestionField question={item} answers={answers} onAnswer={onAnswer} />
      </div>
    )
  }

  if (reveal === "optional-group") {
    const lastRequiredIndex = items.reduce(
      (last, item, index) =>
        item.kind !== "divider" && !item.optional ? index : last,
      -1,
    )
    const leading = numbered.slice(0, lastRequiredIndex + 1)
    const trailing = numbered.slice(lastRequiredIndex + 1)
    const revealed = leading.every((entry) =>
      isItemAnswered(entry.item, answers),
    )

    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-12">
          {leading.map((entry) => (
            <div key={entry.item.id}>{renderItem(entry)}</div>
          ))}
        </div>

        {trailing.length > 0 && (
          <div
            aria-hidden={!revealed}
            inert={!revealed || undefined}
            className={cn(
              "grid transition-[grid-template-rows] motion-reduce:transition-none",
              REVEAL_DURATION,
              REVEAL_EASE,
              revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  "flex flex-col gap-12 pt-12 transition-[transform,opacity] motion-reduce:transition-none",
                  REVEAL_DURATION,
                  REVEAL_EASE,
                  revealed
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                )}
              >
                {trailing.map((entry) => (
                  <div
                    key={entry.item.id}
                    className={
                      entry.item.kind === "divider" ? "-mb-2" : undefined
                    }
                  >
                    {renderItem(entry)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-12">
      {numbered.map((entry) => (
        <div key={entry.item.id}>{renderItem(entry)}</div>
      ))}
    </div>
  )
}
