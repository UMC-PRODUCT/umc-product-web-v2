import { useMemo } from "react"

import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { FormHeader } from "@/shared/ui/FormHeader"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { RadioList } from "@/shared/ui/input/radio/RadioList"
import MemberCount from "@/shared/ui/MemberCount"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import { PortfolioField } from "@/shared/ui/question-field/PortfolioField"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import { isRecruitDone } from "../../model/matchingProject"
import { ApplyProjectTitleCard } from "./ApplyProjectTitleCard"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

import type { MatchingProject } from "../../model/matchingProject"

const OPTION_LIST_CLASS =
  "border-teal-gray-150 flex flex-col gap-0.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] p-1"
const COMMON_SECTION_ID = "common"

interface RecruitQuestionsViewModalProps {
  data: MatchingProject
  sections: Section[]
}

export function RecruitQuestionsViewModal({
  data,
  sections,
}: RecruitQuestionsViewModalProps) {
  const questionIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    sections.forEach((section) => {
      if (section.isEnabled) {
        section.questions.forEach((q, i) => {
          map[q.id] = i + 1
        })
      }
    })
    return map
  }, [sections])

  return (
    <div className="flex w-232 flex-col">
      <div className="flex w-full">
        <ApplyProjectTitleCard
          projectName={data.title}
          subtitle={data.authorSchoolLine}
        />
      </div>
      <div className="shadow-drop-neutral-3 flex w-full flex-col rounded-2xl bg-white">
        <div className="scrollbar-none max-h-[75vh] overflow-y-auto px-11.5 py-9">
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
              const enabled = section.isEnabled

              return (
                <div key={section.id}>
                  {isCommon ? (
                    <FormHeader variant="common" />
                  ) : (
                    <FormHeader
                      variant="part"
                      partName={section.name}
                      toggleChecked={enabled}
                      showToggle
                      toggleDisabled
                      onToggleChange={() => {}}
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
                          <div className="pointer-events-none w-full">
                            {renderPreviewField(q)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderPreviewField(q: Question) {
  switch (q.fieldType) {
    case "text":
      return (
        <TextQuestionField
          value=""
          onChange={() => {}}
          maxLength={500}
          showCounter={false}
        />
      )
    case "checkbox":
      return (
        <div className={OPTION_LIST_CLASS}>
          {q.options.map((opt) => (
            <CheckboxList key={opt} checked={false} onChange={() => {}}>
              {opt}
            </CheckboxList>
          ))}
        </div>
      )
    case "radio":
      return (
        <div className={OPTION_LIST_CLASS}>
          {q.options.map((opt) => (
            <RadioList key={opt} checked={false} onChange={() => {}}>
              {opt}
            </RadioList>
          ))}
        </div>
      )
    case "file":
      return (
        <FileUploadField
          fileName={null}
          onUpload={() => {}}
          onDelete={() => {}}
        />
      )
    case "portfolio":
      return <PortfolioField value={null} onChange={() => {}} />
  }
}
