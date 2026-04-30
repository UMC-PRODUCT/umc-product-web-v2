import { useMemo, useRef, useState } from "react"

import { Button } from "@/shared/ui/Button"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { FormHeader } from "@/shared/ui/FormHeader"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { RadioList } from "@/shared/ui/input/radio/RadioList"
import MemberCount from "@/shared/ui/MemberCount"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import {
  PortfolioField,
  type PortfolioValue,
} from "@/shared/ui/question-field/PortfolioField"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import { isRecruitDone } from "../model/matchingProject"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

import type { MatchingProject } from "../model/matchingProject"

type ApplyAnswerValue = string | string[] | PortfolioValue | null

const OPTION_LIST_CLASS =
  "border-teal-gray-150 flex flex-col gap-0.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] p-1"
const COMMON_SECTION_ID = "common"

function asString(v: ApplyAnswerValue | undefined): string {
  return typeof v === "string" ? v : ""
}

function asStringArray(v: ApplyAnswerValue | undefined): string[] {
  return Array.isArray(v) ? v : []
}

function asPortfolioValue(
  v: ApplyAnswerValue | undefined,
): PortfolioValue | null {
  if (v == null || Array.isArray(v) || typeof v === "string") return null
  return v
}

interface ProjectApplyModalProps {
  data: MatchingProject
  sections: Section[]
  canToggleSection?: boolean
  onBack: () => void
  onSubmit: (answers: Record<string, ApplyAnswerValue>) => void
}

function FileAnswerField({
  value,
  onChange,
}: {
  value: string | null
  onChange: (name: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          onChange(file?.name ?? null)
        }}
      />
      <FileUploadField
        fileName={value}
        onUpload={() => inputRef.current?.click()}
        onDelete={() => onChange(null)}
      />
    </>
  )
}

export function ProjectApplyModal({
  data,
  sections,
  canToggleSection = false,
  onBack,
  onSubmit,
}: ProjectApplyModalProps) {
  const [answers, setAnswers] = useState<Record<string, ApplyAnswerValue>>({})
  const [sectionEnabled, setSectionEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.isEnabled])),
  )

  const questionIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    sections.forEach((section) => {
      const enabled = sectionEnabled[section.id] ?? section.isEnabled
      if (enabled) {
        section.questions.forEach((q, i) => {
          map[q.id] = i + 1
        })
      }
    })
    return map
  }, [sections, sectionEnabled])

  function setAnswer(questionId: string, value: ApplyAnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function renderAnswerField(q: Question) {
    const answer = answers[q.id]
    switch (q.fieldType) {
      case "text":
        return (
          <TextQuestionField
            value={asString(answer)}
            onChange={(val) => setAnswer(q.id, val)}
            maxLength={500}
          />
        )
      case "checkbox":
        return (
          <div className={OPTION_LIST_CLASS}>
            {q.options.map((opt) => (
              <CheckboxList
                key={opt}
                checked={asStringArray(answer).includes(opt)}
                onChange={(checked) => {
                  const current = asStringArray(answer)
                  setAnswer(
                    q.id,
                    checked
                      ? [...current, opt]
                      : current.filter((o) => o !== opt),
                  )
                }}
              >
                {opt}
              </CheckboxList>
            ))}
          </div>
        )
      case "radio":
        return (
          <div className={OPTION_LIST_CLASS}>
            {q.options.map((opt) => (
              <RadioList
                key={opt}
                checked={answer === opt}
                onChange={(checked) => {
                  if (checked) setAnswer(q.id, opt)
                }}
              >
                {opt}
              </RadioList>
            ))}
          </div>
        )
      case "file":
        return (
          <FileAnswerField
            value={typeof answer === "string" ? answer : null}
            onChange={(name) => setAnswer(q.id, name)}
          />
        )
      case "portfolio":
        return (
          <PortfolioField
            value={asPortfolioValue(answer)}
            onChange={(val) => setAnswer(q.id, val)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex w-232 flex-col overflow-hidden rounded-2xl bg-white px-11.5 py-9">
      <div className="max-h-[75vh] overflow-y-auto">
        <div className="flex items-start gap-6 self-stretch px-1 py-5">
          <p className="text-body-1-regular text-teal-gray-600 flex-1">
            {data.description}
          </p>
          <div className="flex w-74.5 shrink-0 flex-col gap-1.25">
            {data.recruitRows.map((row) => {
              const done = isRecruitDone(row)
              return (
                <div
                  key={row.part}
                  className="flex w-full items-center justify-between pr-1"
                >
                  <div className="flex w-30.5 items-center justify-between">
                    <span className="text-body-2-medium text-teal-gray-700">
                      {row.part}
                    </span>
                    <MemberCount
                      size="sm"
                      current={row.current}
                      total={row.total}
                    />
                  </div>
                  <RecruitStatusChip done={done} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 pb-6">
          {sections.map((section) => {
            const isCommon = section.id === COMMON_SECTION_ID
            const enabled = sectionEnabled[section.id] ?? section.isEnabled

            return (
              <div key={section.id}>
                {isCommon ? (
                  <FormHeader variant="common" />
                ) : (
                  <FormHeader
                    variant="part"
                    partName={section.name}
                    toggleChecked={enabled}
                    showToggle={canToggleSection}
                    onToggleChange={(checked) =>
                      setSectionEnabled((prev) => ({
                        ...prev,
                        [section.id]: checked,
                      }))
                    }
                  />
                )}
                {enabled && section.questions.length > 0 && (
                  <div className="flex flex-col items-start gap-10 self-stretch rounded-b-[12px] border border-teal-200 bg-white pt-8.5 pr-5 pb-9.5 pl-5">
                    {section.questions.map((q) => (
                      <div key={q.id} className="flex w-full flex-col gap-3">
                        <QuestionItemTitle
                          index={`Q${questionIndexMap[q.id]}`}
                          title={q.title}
                          required={q.required}
                        />
                        {renderAnswerField(q)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="border-teal-gray-100 flex justify-center gap-3 border-t px-6 py-4">
          <Button variant="weak" color="neutral" size="xl" onClick={onBack}>
            돌아가기
          </Button>
          <Button size="xl" onClick={() => onSubmit(answers)}>
            제출하기
          </Button>
        </div>
      </div>
    </div>
  )
}
