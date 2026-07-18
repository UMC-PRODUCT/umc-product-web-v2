import FileClip from "@/shared/assets/icon/upload/FileClip"
import { cn } from "@/shared/lib/utils"
import { CheckboxIndicator } from "@/shared/ui/input/checkbox/CheckboxIndicator"
import { RadioIndicator } from "@/shared/ui/input/radio/RadioIndicator"
import { QuestionFieldBox } from "@/shared/ui/question-field/QuestionFieldBox"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"

import type { ApplicationQuestion } from "../../model/applicationDetail"

interface ReadonlyAnswerFieldProps {
  question: ApplicationQuestion
  index: string
}

function OptionRow({
  kind,
  selected,
  content,
}: {
  kind: "radio" | "checkbox"
  selected: boolean
  content: string
}) {
  return (
    <div className="flex items-center gap-2">
      {kind === "radio" ? (
        <RadioIndicator checked={selected} variant="primary" />
      ) : (
        <CheckboxIndicator checked={selected} variant="primary" />
      )}
      <span
        className={cn(
          "text-body-1-regular",
          selected ? "text-teal-gray-900" : "text-teal-gray-600",
        )}
      >
        {content}
      </span>
    </div>
  )
}

function AnswerBody({ question }: { question: ApplicationQuestion }) {
  if (question.type === "radio" || question.type === "checkbox") {
    const kind = question.type === "radio" ? "radio" : "checkbox"
    return (
      <QuestionFieldBox className="gap-3">
        {question.options.map((option) => (
          <OptionRow
            key={option.optionId}
            kind={kind}
            selected={question.selectedOptionIds.includes(option.optionId)}
            content={option.content}
          />
        ))}
      </QuestionFieldBox>
    )
  }

  if (question.type === "file" || question.type === "portfolio") {
    const link = question.textValue
    const isEmpty = !link && question.files.length === 0
    return (
      <QuestionFieldBox className="gap-2">
        {isEmpty && (
          <span className="text-body-1-regular text-teal-gray-400">-</span>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-body-1-regular text-teal-gray-700 flex items-center gap-1.5 underline-offset-2 hover:underline"
          >
            <FileClip className="text-teal-gray-500 size-5 shrink-0" />
            <span className="truncate">{link}</span>
          </a>
        )}
        {question.files.map((file) => (
          <a
            key={file.fileId}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="text-body-1-regular text-teal-gray-700 flex items-center gap-1.5 underline-offset-2 hover:underline"
          >
            <FileClip className="text-teal-gray-500 size-5 shrink-0" />
            <span className="truncate">{file.name}</span>
          </a>
        ))}
      </QuestionFieldBox>
    )
  }

  if (question.type === "dropdown") {
    const selectedContent = question.options
      .filter((option) => question.selectedOptionIds.includes(option.optionId))
      .map((option) => option.content)
      .join(", ")
    return (
      <QuestionFieldBox>
        <span
          className={cn(
            "text-body-1-regular",
            selectedContent ? "text-teal-gray-900" : "text-teal-gray-400",
          )}
        >
          {selectedContent || "-"}
        </span>
      </QuestionFieldBox>
    )
  }

  return (
    <QuestionFieldBox>
      <span
        className={cn(
          "text-body-1-regular",
          question.textValue ? "text-teal-gray-900" : "text-teal-gray-400",
        )}
      >
        {question.textValue || "-"}
      </span>
    </QuestionFieldBox>
  )
}

export function ReadonlyAnswerField({
  question,
  index,
}: ReadonlyAnswerFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <QuestionItemTitle
        index={index}
        title={question.title}
        caption={question.description}
        required={question.required}
      />
      <div className="pl-8.5">
        <AnswerBody question={question} />
      </div>
    </div>
  )
}
