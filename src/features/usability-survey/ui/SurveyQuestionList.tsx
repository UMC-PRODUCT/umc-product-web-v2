import { cn } from "@/shared/lib/utils"

import { isItemAnswered } from "../model/types"
import { QuestionField } from "./QuestionField"
import { QuestionHeader } from "./QuestionHeader"
import { SectionDivider } from "./SectionDivider"

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyItem,
} from "../model/types"

export type { SurveyAnswers, SurveyAnswerValue } from "../model/types"

const REVEAL_DURATION = "duration-1000"
const REVEAL_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]"
const STAGGER_MS = 300

interface SurveyQuestionListProps {
  items: SurveyItem[]
  answers: SurveyAnswers
  onAnswer: (id: string, value: SurveyAnswerValue) => void
  startNumber?: number
  progressive?: boolean
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
  progressive = false,
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

  if (!progressive) {
    return (
      <div className="flex w-full flex-col gap-12">
        {numbered.map((entry) => (
          <div key={entry.item.id}>{renderItem(entry)}</div>
        ))}
      </div>
    )
  }

  const lastGateIndex = (index: number) => {
    for (let i = index - 1; i >= 0; i -= 1) {
      const prev = items[i]
      if (prev && prev.kind !== "divider" && !prev.optional) return i
    }
    return -1
  }

  return (
    <div className="flex w-full flex-col">
      {numbered.map((entry, index) => {
        if (index === 0) {
          return <div key={entry.item.id}>{renderItem(entry)}</div>
        }

        const revealed = items
          .slice(0, index)
          .every((prev) => isItemAnswered(prev, answers))
        const staggerOrder = items
          .slice(lastGateIndex(index) + 1, index)
          .filter((prev) => prev.kind !== "divider").length
        const delay = revealed ? `${staggerOrder * STAGGER_MS}ms` : "0ms"

        return (
          <div
            key={entry.item.id}
            aria-hidden={!revealed}
            inert={!revealed || undefined}
            style={{ transitionDelay: delay }}
            className={cn(
              "grid transition-[grid-template-rows] motion-reduce:transition-none",
              REVEAL_DURATION,
              REVEAL_EASE,
              revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div
                style={{ transitionDelay: delay }}
                className={cn(
                  "pt-12 transition-[transform,opacity] motion-reduce:transition-none",
                  REVEAL_DURATION,
                  REVEAL_EASE,
                  revealed
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                )}
              >
                {renderItem(entry)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
