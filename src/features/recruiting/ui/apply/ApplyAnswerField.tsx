import { useRef, useState } from "react"

import { uploadFileFlow } from "@/shared/api/storage"
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

import type { PortfolioValue } from "@/shared/ui/question-field/PortfolioField"

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

const FILE_UPLOAD_CATEGORY = "POST_ATTACHMENT" as const
const PORTFOLIO_UPLOAD_CATEGORY = "PORTFOLIO" as const
const UPLOAD_FAILED = "파일 업로드에 실패했습니다. 다시 시도해 주세요."

function FileAnswerField({
  value,
  onChange,
  error,
  ariaLabel,
  ariaRequired,
}: {
  value: ApplyAnswerValue
  onChange: (value: ApplyAnswerValue) => void
  error?: string
  ariaLabel?: string
  ariaRequired?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // 업로드는 취소할 수 없다. 늦게 끝난 요청이 그 사이 지워지거나 교체된 값을
  // 되살리지 않도록, 마지막 요청의 결과만 받는다.
  const requestRef = useRef(0)
  const current = isApplyUploadedFile(value) ? value : null

  // 선택 즉시 올려 fileId 를 확보한다. 저장 요청은 파일 자체가 아니라 fileId 만
  // 받으므로, 제출 시점에 올리면 저장이 파일 업로드를 기다리게 된다.
  const handleSelect = async (file: File) => {
    const request = ++requestRef.current
    setUploadError(null)
    onChange({ name: file.name, uploading: true })
    try {
      const { fileId } = await uploadFileFlow(file, FILE_UPLOAD_CATEGORY)
      if (requestRef.current !== request) return
      onChange({ name: file.name, fileId })
    } catch {
      if (requestRef.current !== request) return
      setUploadError(UPLOAD_FAILED)
      onChange(null)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        aria-label={ariaLabel}
        aria-required={ariaRequired || undefined}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleSelect(file)
          event.target.value = ""
        }}
      />
      <FileUploadField
        fileName={
          current?.uploading
            ? `${current.name} (업로드 중...)`
            : (current?.name ?? null)
        }
        error={uploadError ?? error}
        ariaLabel={ariaLabel}
        onUpload={() => inputRef.current?.click()}
        onDelete={() => {
          requestRef.current += 1
          setUploadError(null)
          onChange(null)
        }}
      />
    </>
  )
}

function PortfolioAnswerField({
  value,
  onChange,
  error,
  ariaLabel,
  ariaRequired,
}: {
  value: ApplyAnswerValue
  onChange: (value: ApplyAnswerValue) => void
  error?: string
  ariaLabel?: string
  ariaRequired?: boolean
}) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  // 파일 문항과 같은 이유. 링크로 바꾸거나 지운 뒤 늦게 끝난 업로드가
  // 사용자의 선택을 덮어쓰지 않게 한다.
  const requestRef = useRef(0)
  const current = isApplyPortfolioValue(value) ? value : null

  const handleChange = async (next: PortfolioValue | null) => {
    const request = ++requestRef.current
    setUploadError(null)
    if (next === null || next.kind === "link") {
      onChange(next)
      return
    }
    if (!next.file) {
      onChange({ kind: "file", name: next.name })
      return
    }
    onChange({ kind: "file", name: next.name, uploading: true })
    try {
      const { fileId } = await uploadFileFlow(
        next.file,
        PORTFOLIO_UPLOAD_CATEGORY,
      )
      if (requestRef.current !== request) return
      onChange({ kind: "file", name: next.name, fileId })
    } catch {
      if (requestRef.current !== request) return
      setUploadError(UPLOAD_FAILED)
      onChange(null)
    }
  }

  const shown: PortfolioValue | null =
    current === null
      ? null
      : current.kind === "link"
        ? current
        : {
            kind: "file",
            name: current.uploading
              ? `${current.name} (업로드 중...)`
              : current.name,
          }

  return (
    <PortfolioField
      value={shown}
      onChange={(next) => void handleChange(next)}
      error={uploadError ?? error}
      ariaLabel={ariaLabel}
      ariaRequired={ariaRequired}
    />
  )
}

// 지원자가 고른 시간대는 저장 요청에 담을 필드(times)가 아직 없다. 화면에서는
// 고를 수 있게 두되 제출 페이로드에서는 뺀다(model/applyPayload.ts).
function ScheduleAnswerField({
  value,
  onChange,
  ariaLabel,
}: {
  value: ApplyAnswerValue
  onChange: (value: ApplyAnswerValue) => void
  ariaLabel?: string
}) {
  const selected = Array.isArray(value) ? value : []

  return (
    <div className="flex flex-col gap-2">
      <input
        type="datetime-local"
        aria-label={ariaLabel}
        className="border-teal-gray-200 text-body-2-regular text-teal-gray-700 h-11 w-60 rounded-[10px] border px-4 outline-none focus:border-teal-500"
        onChange={(event) => {
          const next = event.target.value
          if (!next || selected.includes(next)) return
          onChange([...selected, next])
          event.target.value = ""
        }}
      />
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((slot) => (
            <li
              key={slot}
              className="text-label-1-medium flex items-center gap-1.5 rounded-[8px] bg-teal-50 px-2.5 py-1 text-teal-700"
            >
              {slot.replace("T", " ")}
              <button
                type="button"
                aria-label={`${slot} 삭제`}
                className="text-teal-gray-400 hover:text-teal-gray-600 cursor-pointer"
                onClick={() =>
                  onChange(selected.filter((entry) => entry !== slot))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-label-1-medium text-teal-gray-400">
        면접 가능 일정은 추후 별도로 안내됩니다.
      </p>
    </div>
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
                allowDeselect
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
        <PortfolioAnswerField
          value={value}
          onChange={onChange}
          error={error}
          ariaLabel={question.title}
          ariaRequired={question.required}
        />
      )
    case "file":
      return (
        <FileAnswerField
          value={value}
          onChange={onChange}
          error={error}
          ariaLabel={question.title}
          ariaRequired={question.required}
        />
      )
    case "schedule":
      return (
        <ScheduleAnswerField
          value={value}
          onChange={onChange}
          ariaLabel={question.title}
        />
      )
  }
}
