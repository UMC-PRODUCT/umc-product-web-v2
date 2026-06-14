import { InputBox } from "@/shared/ui/input/InputBox"

import { getScaleTextKey } from "../model/types"
import { EmojiChoiceQuestion } from "./EmojiChoiceQuestion"
import { EmojiScaleQuestion } from "./EmojiScaleQuestion"
import { EmojiScaleWithTextQuestion } from "./EmojiScaleWithTextQuestion"
import { SingleSelectQuestion } from "./SingleSelectQuestion"

import type { ChangeEvent } from "react"

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyQuestion,
} from "../model/types"

interface QuestionFieldProps {
  question: SurveyQuestion
  answers: SurveyAnswers
  onAnswer: (id: string, value: SurveyAnswerValue) => void
}

export const QuestionField = ({
  question,
  answers,
  onAnswer,
}: QuestionFieldProps) => {
  const answer = answers[question.id]

  switch (question.kind) {
    case "emoji-scale":
      return (
        <EmojiScaleQuestion
          ariaLabel={question.text}
          scores={question.scores}
          labels={question.labels}
          value={typeof answer === "number" ? answer : null}
          onChange={(score) => onAnswer(question.id, score)}
        />
      )
    case "emoji-scale-with-text": {
      const text = answers[getScaleTextKey(question.id)]
      return (
        <EmojiScaleWithTextQuestion
          ariaLabel={question.text}
          scores={question.scores}
          labels={question.labels}
          textPlaceholder={question.textPlaceholder}
          scaleValue={typeof answer === "number" ? answer : null}
          textValue={typeof text === "string" ? text : ""}
          onScaleChange={(score) => onAnswer(question.id, score)}
          onTextChange={(value) =>
            onAnswer(getScaleTextKey(question.id), value)
          }
        />
      )
    }
    case "emoji-choice":
      return (
        <EmojiChoiceQuestion
          ariaLabel={question.text}
          positiveLabel={question.positiveLabel}
          negativeLabel={question.negativeLabel}
          value={answer === "positive" || answer === "negative" ? answer : null}
          onChange={(value) => onAnswer(question.id, value)}
        />
      )
    case "text":
      return (
        <div className="flex w-full">
          <InputBox
            value={typeof answer === "string" ? answer : ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onAnswer(question.id, e.target.value)
            }
            placeholder={question.placeholder}
            className="w-full max-w-none"
          />
        </div>
      )
    case "single-select":
      return (
        <SingleSelectQuestion
          ariaLabel={question.text}
          options={question.options}
          value={typeof answer === "string" ? answer : null}
          onChange={(value) => onAnswer(question.id, value)}
        />
      )
    default: {
      const exhaustiveCheck: never = question
      return exhaustiveCheck
    }
  }
}
