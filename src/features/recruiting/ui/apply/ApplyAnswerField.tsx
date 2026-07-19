import { useRef } from "react"

import { Dropdown } from "@/shared/ui/Dropdown"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { OPTION_LIST_CLASS } from "@/shared/ui/input/optionList"
import { RadioList } from "@/shared/ui/input/radio/RadioList"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import { PortfolioField } from "@/shared/ui/question-field/PortfolioField"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import {
  APPLY_LONG_TEXT_MAX,
  APPLY_SHORT_TEXT_MAX,
  type ApplyAnswerValue,
  isApplyPortfolioValue,
  isApplyUploadedFile,
} from "../../model/applyForm"

import type { ApplicationQuestion } from "../../model/applicationDetail"

interface ApplyAnswerFieldProps {
  question: ApplicationQuestion
  value: ApplyAnswerValue
  onChange: (value: ApplyAnswerValue) => void
  error?: string
}

function OptionError({ error }: { error?: string }) {
  if (!error) return null
  return <p className="text-caption-2-regular text-error-600 px-1">{error}</p>
}

function FileAnswerField({
  value,
  onChange,
  error,
}: {
  value: ApplyAnswerValue
  onChange: (value: ApplyAnswerValue) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fileName = isApplyUploadedFile(value) ? value.name : null

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onChange({ name: file.name })
          event.target.value = ""
        }}
      />
      <FileUploadField
        fileName={fileName}
        error={error}
        onUpload={() => inputRef.current?.click()}
        onDelete={() => onChange(null)}
      />
    </>
  )
}

export function ApplyAnswerField({
  question,
  value,
  onChange,
  error,
}: ApplyAnswerFieldProps) {
  switch (question.type) {
    case "shortText":
      return (
        <TextQuestionField
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          maxLength={APPLY_SHORT_TEXT_MAX}
          size="md"
          error={error}
          ariaLabel={question.title}
          ariaRequired={question.required}
        />
      )
    case "longText":
      return (
        <TextQuestionField
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          maxLength={APPLY_LONG_TEXT_MAX}
          size="lg"
          error={error}
          ariaLabel={question.title}
          ariaRequired={question.required}
        />
      )
    case "radio":
      return (
        <div className="flex flex-col gap-1">
          <div
            role="radiogroup"
            aria-label={question.title}
            aria-required={question.required || undefined}
            className={OPTION_LIST_CLASS}
          >
            {question.options.map((option) => (
              <RadioList
                key={option.optionId}
                checked={value === option.optionId}
                onChange={(checked) => {
                  onChange(checked ? option.optionId : "")
                }}
              >
                {option.content}
              </RadioList>
            ))}
          </div>
          <OptionError error={error} />
        </div>
      )
    case "checkbox":
      return (
        <div className="flex flex-col gap-1">
          <div
            role="group"
            aria-label={question.title}
            className={OPTION_LIST_CLASS}
          >
            {question.options.map((option) => {
              const current = Array.isArray(value) ? value : []
              return (
                <CheckboxList
                  key={option.optionId}
                  checked={current.includes(option.optionId)}
                  onChange={(checked) => {
                    onChange(
                      checked
                        ? [...current, option.optionId]
                        : current.filter((id) => id !== option.optionId),
                    )
                  }}
                >
                  {option.content}
                </CheckboxList>
              )
            })}
          </div>
          <OptionError error={error} />
        </div>
      )
    case "dropdown":
      return (
        <div className="flex flex-col gap-1">
          <Dropdown
            value={typeof value === "string" && value ? value : undefined}
            onChange={onChange}
            options={question.options.map((option) => ({
              value: option.optionId,
              label: option.content,
            }))}
            placeholder="선택해 주세요."
            error={Boolean(error)}
          />
          <OptionError error={error} />
        </div>
      )
    case "portfolio":
      return (
        <PortfolioField
          value={isApplyPortfolioValue(value) ? value : null}
          onChange={onChange}
          error={error}
          ariaLabel={question.title}
          ariaRequired={question.required}
        />
      )
    case "file":
      return <FileAnswerField value={value} onChange={onChange} error={error} />
  }
}
