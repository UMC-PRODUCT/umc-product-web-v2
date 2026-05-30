import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { Button } from "@/shared/ui/Button"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { FormHeader } from "@/shared/ui/FormHeader"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { RadioList } from "@/shared/ui/input/radio/RadioList"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import {
  PortfolioField,
  type PortfolioValue,
} from "@/shared/ui/question-field/PortfolioField"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import {
  type ApplicationAnswerItem,
  createApplicationDraft,
  saveApplicationDraft,
  submitApplication,
} from "../../api/matchingProject"
import {
  buildApplyAnswersSchema,
  defaultByFieldType,
} from "../../model/applyValidation"
import { isRecruitDone } from "../../model/matchingProject"

import type { FieldErrors, Resolver } from "react-hook-form"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

import type { MatchingProject } from "../../model/matchingProject"

type ApplyAnswerValue = string | string[] | PortfolioValue | null

const OPTION_LIST_CLASS =
  "border-teal-gray-150 flex flex-col gap-0.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] p-1"
const COMMON_SECTION_ID = "common"

function isPortfolioValue(v: ApplyAnswerValue): v is PortfolioValue {
  return v !== null && typeof v === "object" && !Array.isArray(v)
}

function buildAnswerPayload(
  formValues: Record<string, ApplyAnswerValue>,
  sections: Section[],
): ApplicationAnswerItem[] {
  const questionMap = new Map<string, Question>()
  sections.forEach((s) => s.questions.forEach((q) => questionMap.set(q.id, q)))

  return Object.entries(formValues).flatMap(([questionId, value]) => {
    const question = questionMap.get(questionId)
    if (!question) return []

    const base = { questionId: Number(questionId) }

    if (question.fieldType === "text") {
      return [{ ...base, textValue: typeof value === "string" ? value : "" }]
    }

    if (question.fieldType === "radio") {
      if (typeof value !== "string" || !value) return [base]
      const idx = question.options.indexOf(value)
      const optionId = idx !== -1 ? (question.optionIds?.[idx] ?? 0) : 0
      return [{ ...base, selectedOptionIds: [optionId] }]
    }

    if (question.fieldType === "checkbox") {
      if (!Array.isArray(value) || value.length === 0) return [base]
      const selectedIds = value.flatMap((content) => {
        const idx = question.options.indexOf(content)
        return idx !== -1 ? [question.optionIds?.[idx] ?? 0] : []
      })
      return [{ ...base, selectedOptionIds: selectedIds }]
    }

    if (question.fieldType === "portfolio") {
      if (!isPortfolioValue(value)) return [base]
      if (value.kind === "link") return [{ ...base, textValue: value.url }]
      return [base]
    }

    return [base]
  })
}

function FileAnswerField({
  value,
  onChange,
  error,
}: {
  value: string | null
  onChange: (name: string | null) => void
  error?: string
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
        error={error}
      />
    </>
  )
}

interface ProjectApplyModalProps {
  data: MatchingProject
  projectId: number
  matchingRoundId: number
  sections: Section[]
  canToggleSection?: boolean
  onBack: () => void
  onSubmitSuccess: () => void
}

export function ProjectApplyModal({
  data,
  projectId,
  matchingRoundId,
  sections,
  canToggleSection = false,
  onBack,
  onSubmitSuccess,
}: ProjectApplyModalProps) {
  const addToast = useToastStore((s) => s.addToast)
  const [sectionEnabled, setSectionEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.isEnabled])),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const draftInitializedRef = useRef(false)

  useEffect(() => {
    if (draftInitializedRef.current) return
    draftInitializedRef.current = true
    async function initDraft() {
      try {
        await createApplicationDraft(projectId, matchingRoundId)
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 409) {
          return
        }
        addToast({
          message: "지원서 생성에 실패했습니다. 다시 시도해 주세요.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        onBack()
      }
    }
    void initDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schema = useMemo(
    () => buildApplyAnswersSchema(sections, sectionEnabled),
    [sections, sectionEnabled],
  )

  const defaultValues = useMemo(
    () =>
      Object.fromEntries(
        sections.flatMap((s) =>
          s.questions.map((q) => [q.id, defaultByFieldType(q)]),
        ),
      ),
    [sections],
  )

  const {
    control,
    handleSubmit,
    getValues,
    clearErrors,
    formState: { isDirty },
  } = useForm<Record<string, ApplyAnswerValue>>({
    resolver: zodResolver(schema) as Resolver<Record<string, ApplyAnswerValue>>,
    mode: "onChange",
    defaultValues,
  })

  useEffect(() => {
    clearErrors()
  }, [sectionEnabled, clearErrors])

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

  async function handleLeaveConfirm() {
    try {
      const answers = buildAnswerPayload(getValues(), sections)
      await saveApplicationDraft(projectId, answers)
    } catch {
      // 임시저장 실패 시에도 이탈은 허용
    }
    setIsLeaveModalOpen(false)
    onBack()
  }

  function handleBackClick() {
    if (isDirty) {
      setIsLeaveModalOpen(true)
    } else {
      onBack()
    }
  }

  async function onValid(formValues: Record<string, ApplyAnswerValue>) {
    setIsSubmitting(true)
    try {
      const answers = buildAnswerPayload(formValues, sections)
      await saveApplicationDraft(projectId, answers)
      await submitApplication(projectId)
      setIsCompleteModalOpen(true)
    } catch {
      addToast({
        message: "지원서 제출에 실패했습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function onInvalid(errs: FieldErrors<Record<string, ApplyAnswerValue>>) {
    const firstId = Object.keys(errs)[0]
    if (!firstId) return
    const firstEntry = errs[firstId]
    const firstMessage =
      firstEntry &&
      "message" in firstEntry &&
      typeof firstEntry.message === "string"
        ? firstEntry.message
        : "필수 항목을 입력해 주세요."
    addToast({
      message: firstMessage,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    const questionEl = document.querySelector(`[data-question-id="${firstId}"]`)
    questionEl?.scrollIntoView({ behavior: "smooth", block: "center" })
    const candidates = questionEl?.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]), textarea, button',
    )
    if (candidates) {
      for (const el of Array.from(candidates)) {
        if (el.offsetParent !== null) {
          el.focus()
          break
        }
      }
    }
  }

  function renderAnswerField(
    q: Question,
    value: ApplyAnswerValue,
    onChange: (v: ApplyAnswerValue) => void,
    error?: string,
  ) {
    switch (q.fieldType) {
      case "text":
        return (
          <TextQuestionField
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            maxLength={500}
            error={error}
          />
        )
      case "checkbox":
        return (
          <div className="flex flex-col gap-1">
            <div className={OPTION_LIST_CLASS}>
              {q.options.map((opt) => (
                <CheckboxList
                  key={opt}
                  checked={Array.isArray(value) && value.includes(opt)}
                  onChange={(checked) => {
                    const current = Array.isArray(value) ? value : []
                    onChange(
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
            {error && (
              <p className="text-caption-2-regular text-error-600 px-1">
                {error}
              </p>
            )}
          </div>
        )
      case "radio":
        return (
          <div className="flex flex-col gap-1">
            <div className={OPTION_LIST_CLASS}>
              {q.options.map((opt) => (
                <RadioList
                  key={opt}
                  checked={value === opt}
                  onChange={(checked) => {
                    if (checked) onChange(opt)
                  }}
                >
                  {opt}
                </RadioList>
              ))}
            </div>
            {error && (
              <p className="text-caption-2-regular text-error-600 px-1">
                {error}
              </p>
            )}
          </div>
        )
      case "file":
        return (
          <FileAnswerField
            value={typeof value === "string" ? value : null}
            onChange={(name) => onChange(name)}
            error={error}
          />
        )
      case "portfolio":
        return (
          <PortfolioField
            value={isPortfolioValue(value) ? value : null}
            onChange={(val: PortfolioValue | null) => onChange(val)}
            error={error}
          />
        )
    }
  }

  const SUB_MODAL_CLASS =
    "shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none"

  return (
    <>
      <div className="flex w-232 flex-col">
        <div className="flex w-full">
          <ProjectTitleCard
            size="sm"
            projectName={data.title}
            subtitle={data.authorSchoolLine}
          />
        </div>
        <div className="flex w-full flex-col rounded-b-2xl bg-white">
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
                          <div
                            key={q.id}
                            className="flex w-full flex-col gap-3"
                            data-question-id={q.id}
                          >
                            <QuestionItemTitle
                              index={`Q${questionIndexMap[q.id]}`}
                              title={q.title}
                              required={q.required}
                            />
                            <Controller
                              name={q.id}
                              control={control}
                              render={({ field, fieldState }) =>
                                renderAnswerField(
                                  q,
                                  field.value,
                                  (v: ApplyAnswerValue) => field.onChange(v),
                                  fieldState.error?.message,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-teal-gray-100 flex justify-center gap-3 border-t px-6 py-4">
            <Button
              variant="weak"
              color="neutral"
              size="xl"
              onClick={handleBackClick}
              disabled={isSubmitting}
            >
              돌아가기
            </Button>
            <Button
              size="xl"
              disabled={isSubmitting}
              onClick={() => {
                void handleSubmit(onValid, onInvalid)()
              }}
            >
              제출하기
            </Button>
          </div>
        </div>
      </div>

      <Modal.Root open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className={SUB_MODAL_CLASS}>
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <WarningTriangleIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  페이지 이탈
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                작성 중인 지원서가 있습니다.
                <br />
                임시저장 후 나가시겠습니까?
              </Modal.Description>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="weak"
                color="neutral"
                size="s"
                onClick={() => setIsLeaveModalOpen(false)}
              >
                돌아가기
              </Button>
              <Button size="s" onClick={() => void handleLeaveConfirm()}>
                임시저장 후 나가기
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root
        open={isCompleteModalOpen}
        onOpenChange={setIsCompleteModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className={SUB_MODAL_CLASS}>
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  제출 완료
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                프로젝트 지원서가 제출되었습니다.
              </Modal.Description>
            </div>
            <div className="flex justify-end">
              <Button size="s" onClick={onSubmitSuccess}>
                확인
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
