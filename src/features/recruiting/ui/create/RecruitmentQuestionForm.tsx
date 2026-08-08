import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { useEffect, useRef, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import CloseThinIcon from "@/shared/assets/icon/close/CloseThinIcon"
import ToggleCheckboxIcon from "@/shared/assets/icon/toggle/ToggleCheckboxIcon"
import ToggleFileUploadIcon from "@/shared/assets/icon/toggle/ToggleFileUploadIcon"
import ToggleRadioIcon from "@/shared/assets/icon/toggle/ToggleRadioIcon"
import ToggleTextIcon from "@/shared/assets/icon/toggle/ToggleTextIcon"
import CloudUploadIcon from "@/shared/assets/icon/upload/CloudUploadIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { FieldTypeButtonGroup } from "@/shared/ui/button/FieldTypeButtonGroup"
import { FloatingActionButton } from "@/shared/ui/button/FloatingActionButton"
import { FormHeader } from "@/shared/ui/FormHeader"
import { CheckboxIndicator } from "@/shared/ui/input/checkbox/CheckboxIndicator"
import { RadioIndicator } from "@/shared/ui/input/radio/RadioIndicator"
import { ToggleButton } from "@/shared/ui/input/ToggleButton"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import { OptionFieldList } from "@/shared/ui/question-field/OptionFieldList"
import { PortfolioField } from "@/shared/ui/question-field/PortfolioField"
import { QuestionFieldBox } from "@/shared/ui/question-field/QuestionFieldBox"
import { QuestionForm } from "@/shared/ui/question-field/QuestionForm"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"
import { useToastStore } from "@/shared/ui/toast/useToastStore"
import { Toggle } from "@/shared/ui/Toggle"

import { recruitingKeys } from "../../api/queryKeys"
import {
  createRecruitingRound,
  upsertRecruitingApplicationForm,
} from "../../api/recruitingApi"
import {
  getRecruitableTracks,
  PART_KEY_TO_TRACK,
  PARTS,
} from "../../model/parts"
import { clearRecruitmentBasicDraft } from "../../model/recruitmentBasicDraft"
import {
  buildRecruitmentPreviewTitle,
  buildRoundConfigurationPayload,
  composeRecruitmentTitle,
} from "../../model/recruitmentCreate"
import {
  buildBasicSectionUpsertRequest,
  buildCommonQuestionSectionUpsertRequest,
  buildTrackSectionUpsertRequest,
  getRecruitmentFieldTypePatch,
  makeRecruitmentQuestion,
  RECRUITMENT_DEFAULT_QUESTIONS,
  validateRecruitmentQuestionForm,
} from "../../model/recruitmentQuestion"
import { getRecruitingRoundCreateErrorMessage } from "../../model/recruitmentRoundErrors"
import { useRecruitmentCreateStore } from "../../model/useRecruitmentCreateStore"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

import type { FieldTypeOption } from "@/shared/ui/button/FieldTypeButtonGroup"

import type { PartKey } from "../../model/parts"
import type { RecruitmentQuestionDraftState } from "../../model/recruitingDraftHydration"
import type {
  RecruitmentDefaultQuestion,
  RecruitmentFieldType,
  RecruitmentPartSection,
  RecruitmentQuestion,
  RecruitmentQuestionOption,
} from "../../model/recruitmentQuestion"

// 파트 섹션(PM/Design/Web/Mobile) 본문의 문항 유형 선택줄에 쓰는 옵션.
const PART_FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { key: "text", label: "주관식", icon: ToggleTextIcon },
  { key: "radio", label: "단일 선택", icon: ToggleRadioIcon },
  { key: "checkbox", label: "복수 선택", icon: ToggleCheckboxIcon },
  { key: "file", label: "파일 업로드", icon: CloudUploadIcon },
  { key: "portfolio", label: "포트폴리오", icon: ToggleFileUploadIcon },
]

const OPTIONAL_TOGGLE_QUESTION_INDEXES = ["03", "04"]
const QUESTION_DISABLE_TOGGLE_INDEXES = ["04"]

function RemovableRadioOption({
  option,
  onRemove,
  disabled,
}: {
  option: string
  onRemove: () => void
  disabled?: boolean
}) {
  return (
    <div className="group/option hover:bg-teal-gray-50 flex w-full items-center justify-between gap-3 rounded-lg p-2">
      <div className="flex min-w-0 items-center gap-3">
        <RadioIndicator checked={false} variant="list" />
        <span className="text-body-1-regular text-teal-gray-700">{option}</span>
      </div>
      {!disabled && (
        <button
          type="button"
          aria-label={`${option} 옵션 사용 해제`}
          onClick={onRemove}
          className="text-teal-gray-400 flex size-5 shrink-0 items-center justify-center opacity-0 transition-opacity group-hover/option:opacity-100 focus-visible:opacity-100"
        >
          <CloseThinIcon className="size-3.5" />
        </button>
      )}
    </div>
  )
}

function RemovedRadioOption({
  option,
  onRestore,
}: {
  option: string
  onRestore: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRestore}
      className="flex w-full items-center gap-3 rounded-lg bg-white p-2 text-left"
    >
      <span className="border-teal-gray-300 size-5 shrink-0 rounded-full border-[1.5px] bg-white" />
      <span className="text-body-1-regular text-teal-gray-400">
        {option} 추가
      </span>
    </button>
  )
}

// 옵션 사용/해제가 가능한 라디오 옵션 목록 박스.
function ToggleableRadioOptionsBox({
  options,
  removedOptions,
  onRemoveOption,
  onRestoreOption,
}: {
  options: string[]
  removedOptions: string[]
  onRemoveOption: (option: string) => void
  onRestoreOption: (option: string) => void
}) {
  const activeOptions = options.filter(
    (option) => !removedOptions.includes(option),
  )
  return (
    <div className="border-teal-gray-100 flex w-full flex-col items-start gap-0.5 rounded-xl border bg-white p-1">
      {activeOptions.map((option) => (
        <RemovableRadioOption
          key={option}
          option={option}
          onRemove={() => onRemoveOption(option)}
          disabled={activeOptions.length <= 1}
        />
      ))}
      {removedOptions.map((option) => (
        <RemovedRadioOption
          key={option}
          option={option}
          onRestore={() => onRestoreOption(option)}
        />
      ))}
    </div>
  )
}

function PartQuestionFieldRenderer({
  question,
  onOptionsChange,
}: {
  question: RecruitmentQuestion
  onOptionsChange: (options: RecruitmentQuestionOption[]) => void
}) {
  switch (question.fieldType) {
    case "text":
      return (
        <div className="pointer-events-none w-full">
          <TextQuestionField
            value=""
            onChange={() => {}}
            placeholder="답변을 작성하세요."
          />
        </div>
      )
    case "radio":
      return (
        <OptionFieldList
          type="radio"
          options={question.options}
          onOptionsChange={onOptionsChange}
        />
      )
    case "checkbox":
      return (
        <OptionFieldList
          type="checkbox"
          options={question.options}
          onOptionsChange={onOptionsChange}
        />
      )
    case "file":
      return (
        <div className="pointer-events-none w-full">
          <FileUploadField
            fileName={null}
            placeholder="파일을 업로드해주세요."
            onUpload={() => {}}
            onDelete={() => {}}
          />
        </div>
      )
    case "portfolio":
      return (
        <div className="pointer-events-none w-full">
          <PortfolioField />
        </div>
      )
  }
}

// 파트 섹션("섹션 사용" 토글 ON) 본문
function PartSectionBody({
  questions,
  focusedQuestionId,
  onFocus,
  onUpdate,
  onAdd,
  onDelete,
  captionPlaceholder,
}: {
  questions: RecruitmentQuestion[]
  focusedQuestionId: string | null
  onFocus: (id: string) => void
  onUpdate: (id: string, patch: Partial<RecruitmentQuestion>) => void
  onAdd: () => void
  onDelete: (id: string) => void
  captionPlaceholder?: string
}) {
  const focusedQuestion = questions.find((q) => q.id === focusedQuestionId)

  return (
    <>
      <div
        className={cn(
          "bg-teal-gray-100 flex w-full flex-col items-center gap-4 rounded-br-xl rounded-bl-xl border-r border-b border-l border-teal-200",
          questions.length === 0 && "p-2",
        )}
      >
        {questions.map((question, index) => {
          const focused = question.id === focusedQuestionId
          return (
            <div
              key={question.id}
              onClick={focused ? undefined : () => onFocus(question.id)}
              onFocusCapture={focused ? undefined : () => onFocus(question.id)}
              className={cn("w-full", !focused && "cursor-pointer")}
            >
              <QuestionForm
                index={String(index + 1).padStart(2, "0")}
                title={question.title}
                onTitleChange={(title) => onUpdate(question.id, { title })}
                caption={question.caption}
                captionPlaceholder={captionPlaceholder}
                onCaptionChange={(caption) =>
                  onUpdate(question.id, { caption })
                }
                focused={focused}
                isFirst={index === 0}
                readonlyTitle={question.fieldType === "portfolio"}
                required={question.required}
                onRequiredChange={(required) =>
                  onUpdate(question.id, { required })
                }
                onDelete={() => onDelete(question.id)}
              >
                <PartQuestionFieldRenderer
                  question={question}
                  onOptionsChange={(options) =>
                    onUpdate(question.id, { options })
                  }
                />
              </QuestionForm>
            </div>
          )
        })}
      </div>
      <div className="flex w-full flex-col items-center gap-4 pt-4">
        {focusedQuestion && (
          <FieldTypeButtonGroup
            options={PART_FIELD_TYPE_OPTIONS}
            selected={focusedQuestion.fieldType}
            onChange={(key) =>
              onUpdate(
                focusedQuestion.id,
                getRecruitmentFieldTypePatch(
                  key as RecruitmentFieldType,
                  focusedQuestion,
                ),
              )
            }
            className="max-w-full flex-wrap justify-center"
          />
        )}
        <FloatingActionButton aria-label="질문 추가" onClick={onAdd} />
      </div>
    </>
  )
}

// 수정 불가한 정적 라디오 옵션 목록. muted면 질문 자체가 꺼진 상태처럼 전부 회색으로 표시한다.
function StaticRadioOptionsList({
  options,
  muted = false,
}: {
  options: string[]
  muted?: boolean
}) {
  return (
    <div className="border-teal-gray-100 flex w-full flex-col items-start gap-0.5 rounded-xl border bg-white p-1">
      {options.map((option) => (
        <div
          key={option}
          className="flex w-full items-center gap-3 rounded-lg bg-white p-2"
        >
          {muted ? (
            <span className="border-teal-gray-300 size-5 shrink-0 rounded-full border-[1.5px] bg-white" />
          ) : (
            <RadioIndicator checked={false} variant="list" />
          )}
          <span
            className={cn(
              "text-body-1-regular",
              muted ? "text-teal-gray-400" : "text-teal-gray-700",
            )}
          >
            {option}
          </span>
        </div>
      ))}
    </div>
  )
}

function DefaultRadioQuestion({
  question,
  removedOptions,
  onRemoveOption,
  onRestoreOption,
  allowDisable,
  alwaysShowControls = false,
  disableFocus = false,
  enabled,
  required,
  onEnabledChange,
  onRequiredChange,
}: {
  question: RecruitmentDefaultQuestion
  removedOptions: string[]
  onRemoveOption: (option: string) => void
  onRestoreOption: (option: string) => void
  allowDisable: boolean
  alwaysShowControls?: boolean
  disableFocus?: boolean
  enabled: boolean
  required: boolean
  onEnabledChange: (enabled: boolean) => void
  onRequiredChange: (required: boolean) => void
}) {
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const options = question.options ?? []
  const isDisabled = allowDisable && !enabled
  const showControls =
    allowDisable && (alwaysShowControls || focused || isDisabled)

  useEffect(() => {
    if (!focused || disableFocus) return
    const handleOutsidePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleOutsidePointerDown)
    return () =>
      document.removeEventListener("mousedown", handleOutsidePointerDown)
  }, [disableFocus, focused])

  const controlsRow = allowDisable && (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ToggleButton
          role="checkbox"
          componentName="Checkbox"
          checked={required}
          onChange={onRequiredChange}
          disabled={!enabled}
          aria-label="필수 항목 여부"
          className="inline-flex items-center justify-center"
        >
          <CheckboxIndicator
            checked={required}
            disabled={!enabled}
            variant="list"
          />
        </ToggleButton>
        <span className="text-body-1-medium text-teal-gray-600">필수 항목</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-body-1-medium text-teal-gray-600">질문 사용</span>
        <Toggle
          checked={enabled}
          onChange={onEnabledChange}
          size="sm"
          aria-label="질문 사용 여부"
        />
      </div>
    </div>
  )

  const titleAndOptions = (
    <div className="flex w-full flex-col items-start gap-2.5">
      <QuestionItemTitle
        index={question.index}
        title={question.title}
        required={allowDisable ? required : true}
      />

      <div className="w-full pl-3">
        <ToggleableRadioOptionsBox
          options={options}
          removedOptions={removedOptions}
          onRemoveOption={onRemoveOption}
          onRestoreOption={onRestoreOption}
        />
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      onFocus={disableFocus ? undefined : () => setFocused(true)}
      className="relative flex w-full flex-col items-end gap-4"
    >
      {titleAndOptions}

      {showControls && controlsRow}
    </div>
  )
}

interface RecruitmentQuestionFormProps {
  onPrev: () => void
  onNext: () => void
  onDirtyChange?: (dirty: boolean) => void
  onBlankPartsChange?: (hasBlankEnabledPart: boolean) => void
  initialDraft?: RecruitmentQuestionDraftState
}

export function RecruitmentQuestionForm({
  onPrev,
  onNext,
  onDirtyChange,
  onBlankPartsChange,
  initialDraft,
}: RecruitmentQuestionFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const { data: me } = useMe()
  const enabledParts = useRecruitmentCreateStore((s) => s.enabledParts)
  const setEnabledParts = useRecruitmentCreateStore((s) => s.setEnabledParts)
  const setSecondChoiceEnabled = useRecruitmentCreateStore(
    (s) => s.setSecondChoiceEnabled,
  )
  const basicInfo = useRecruitmentCreateStore((s) => s.basicInfo)
  const gisuGeneration = useRecruitmentCreateStore((s) => s.gisuGeneration)
  const seasonId = useRecruitmentCreateStore((s) => s.seasonId)
  const roundId = useRecruitmentCreateStore((s) => s.roundId)
  const setRoundId = useRecruitmentCreateStore((s) => s.setRoundId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removedOptionsByQuestionIndex, setRemovedOptionsByQuestionIndex] =
    useState<Record<string, string[]>>(
      () => initialDraft?.removedOptionsByQuestionIndex ?? {},
    )
  const initialPartQuestionDrafts =
    initialDraft?.partQuestionDrafts ??
    (Object.fromEntries(
      PARTS.map((part) => [part.key, [makeRecruitmentQuestion()]]),
    ) as Record<PartKey, RecruitmentQuestion[]>)
  const initialCommonQuestionDrafts = initialDraft?.commonQuestionDrafts ?? [
    makeRecruitmentQuestion(),
  ]
  const [commonQuestionDrafts, setCommonQuestionDrafts] = useState<
    RecruitmentQuestion[]
  >(() => initialCommonQuestionDrafts)
  const [focusedCommonQuestionId, setFocusedCommonQuestionId] = useState<
    string | null
  >(() => initialCommonQuestionDrafts[0]?.id ?? null)
  // 파트별 섹션의 문항 목록 편집 상태. 파트당 여러 문항을 가질 수 있다.
  const [partQuestionDrafts, setPartQuestionDrafts] = useState<
    Record<PartKey, RecruitmentQuestion[]>
  >(() => initialPartQuestionDrafts)
  // 파트별로 현재 편집 중(카드가 펼쳐진 상태)인 문항 id.
  const [focusedQuestionIdByPart, setFocusedQuestionIdByPart] = useState<
    Record<PartKey, string | null>
  >(
    () =>
      Object.fromEntries(
        PARTS.map((part) => [
          part.key,
          (initialPartQuestionDrafts[part.key] ?? [])[0]?.id ?? null,
        ]),
      ) as Record<PartKey, string | null>,
  )
  const [questionToggleState, setQuestionToggleState] = useState<
    Record<string, { enabled: boolean; required: boolean }>
  >(
    () =>
      initialDraft?.questionToggleState ??
      Object.fromEntries(
        OPTIONAL_TOGGLE_QUESTION_INDEXES.map((index) => [
          index,
          { enabled: true, required: true },
        ]),
      ),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showTempSaveModal, setShowTempSaveModal] = useState(false)

  const savedSnapshotRef = useRef(
    JSON.stringify({
      enabledParts,
      removedOptionsByQuestionIndex,
      questionToggleState,
      commonQuestionDrafts,
      partQuestionDrafts,
    }),
  )

  const updatePartQuestionDraft = (
    part: PartKey,
    questionId: string,
    patch: Partial<RecruitmentQuestion>,
  ) => {
    setPartQuestionDrafts((prev) => ({
      ...prev,
      [part]: prev[part].map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    }))
  }

  const updateCommonQuestionDraft = (
    questionId: string,
    patch: Partial<RecruitmentQuestion>,
  ) => {
    setCommonQuestionDrafts((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    )
  }

  const addCommonQuestion = () => {
    const newQuestion = makeRecruitmentQuestion()
    setCommonQuestionDrafts((prev) => [...prev, newQuestion])
    setFocusedCommonQuestionId(newQuestion.id)
  }

  const deleteCommonQuestion = (questionId: string) => {
    const nextQuestions = commonQuestionDrafts.filter(
      (question) => question.id !== questionId,
    )
    setCommonQuestionDrafts(nextQuestions)
    setFocusedCommonQuestionId((currentId) =>
      currentId === questionId ? (nextQuestions[0]?.id ?? null) : currentId,
    )
  }

  const addPartQuestion = (part: PartKey) => {
    const newQuestion = makeRecruitmentQuestion()
    setPartQuestionDrafts((prev) => ({
      ...prev,
      [part]: [...prev[part], newQuestion],
    }))
    setFocusedQuestionIdByPart((prev) => ({ ...prev, [part]: newQuestion.id }))
  }

  const deletePartQuestion = (part: PartKey, questionId: string) => {
    const nextQuestions = partQuestionDrafts[part].filter(
      (q) => q.id !== questionId,
    )
    setPartQuestionDrafts((prev) => ({ ...prev, [part]: nextQuestions }))
    setFocusedQuestionIdByPart((prev) =>
      prev[part] === questionId
        ? { ...prev, [part]: nextQuestions[0]?.id ?? null }
        : prev,
    )
  }

  const focusPartQuestion = (part: PartKey, questionId: string) => {
    setFocusedQuestionIdByPart((prev) => ({ ...prev, [part]: questionId }))
  }

  const removeOption = (questionIndex: string, option: string) => {
    setRemovedOptionsByQuestionIndex((prev) => ({
      ...prev,
      [questionIndex]: [...(prev[questionIndex] ?? []), option],
    }))
  }

  const restoreOption = (questionIndex: string, option: string) => {
    setRemovedOptionsByQuestionIndex((prev) => {
      const nextOptions = (prev[questionIndex] ?? []).filter(
        (removed) => removed !== option,
      )
      if (nextOptions.length === 0) {
        const nextState = { ...prev }
        delete nextState[questionIndex]
        return nextState
      }
      return { ...prev, [questionIndex]: nextOptions }
    })
  }

  const setQuestionEnabled = (questionIndex: string, enabled: boolean) => {
    setQuestionToggleState((prev) => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        enabled,
        required: enabled ? (prev[questionIndex]?.required ?? true) : false,
      },
    }))
    if (questionIndex === "04") setSecondChoiceEnabled(enabled)
  }

  const setQuestionRequired = (questionIndex: string, required: boolean) => {
    setQuestionToggleState((prev) => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        enabled: prev[questionIndex]?.enabled ?? true,
        required,
      },
    }))
  }

  const currentSnapshot = JSON.stringify({
    enabledParts,
    removedOptionsByQuestionIndex,
    questionToggleState,
    commonQuestionDrafts,
    partQuestionDrafts,
  })
  const hasUnsavedChanges = savedSnapshotRef.current !== currentSnapshot
  const canTempSave = hasUnsavedChanges && !isSaving

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  const partSectionsForValidation: RecruitmentPartSection[] = PARTS.map(
    (part) => ({
      id: part.key,
      name: part.label,
      isEnabled: enabledParts[part.key],
      questions: partQuestionDrafts[part.key],
    }),
  )
  const hasBlankQuestion =
    validateRecruitmentQuestionForm(
      commonQuestionDrafts,
      partSectionsForValidation,
    ).length > 0

  useEffect(() => {
    onBlankPartsChange?.(hasBlankQuestion)
  }, [hasBlankQuestion, onBlankPartsChange])

  const showErrorToast = (message: string) => {
    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  // "임시 저장"과 "다음"이 공유하는 핵심 로직: roundId가 없으면 Round를 새로
  // 만들고(있으면 재사용), Form 구조를 통째로 upsert한다. 실패 원인(Round 생성 vs
  // Form 저장)에 따라 서로 다른 에러 메시지를 던진다.
  const ensureRoundAndSaveForm = async (): Promise<string> => {
    const recruitableTracks = getRecruitableTracks(enabledParts)

    let currentRoundId: string
    try {
      // roundId가 이미 있으면(직전 시도에서 Round 생성은 성공하고 Form 저장만
      // 실패한 경우) 재시도 시 Round를 또 만들지 않고 같은 roundId로 Form만 다시 저장한다.
      currentRoundId =
        roundId ??
        (await createRecruitingRound(seasonId!, {
          ...buildRoundConfigurationPayload({
            title: composeRecruitmentTitle(
              buildRecruitmentPreviewTitle({ ...basicInfo, gisuGeneration }),
              basicInfo.footer,
            ),
            recruitableTracks,
            secondChoiceEnabled: questionToggleState["04"]?.enabled ?? true,
            periodForm: basicInfo.periodForm,
            interviewRequired: basicInfo.interviewRequired,
          }),
          type: basicInfo.recruitmentType!,
          roundNo:
            basicInfo.recruitmentType === "ADDITIONAL" && basicInfo.roundNo
              ? Number(basicInfo.roundNo)
              : undefined,
        }))
    } catch (error) {
      throw new Error(getRecruitingRoundCreateErrorMessage(error))
    }
    if (!roundId) setRoundId(currentRoundId)

    try {
      const trackSections = PARTS.filter((part) => enabledParts[part.key]).map(
        (part) =>
          buildTrackSectionUpsertRequest(
            part.label,
            PART_KEY_TO_TRACK[part.key],
            partQuestionDrafts[part.key],
            initialDraft?.partSectionIds[part.key],
          ),
      )
      await upsertRecruitingApplicationForm(seasonId!, currentRoundId, {
        sections: [
          buildBasicSectionUpsertRequest(
            removedOptionsByQuestionIndex,
            questionToggleState,
            initialDraft?.basicSectionId,
          ),
          buildCommonQuestionSectionUpsertRequest(
            commonQuestionDrafts,
            initialDraft?.commonSectionId,
          ),
          ...trackSections,
        ],
      })
      void queryClient.invalidateQueries({ queryKey: recruitingKeys.rounds() })
      if (me?.id) clearRecruitmentBasicDraft(me.id)
    } catch (formError) {
      const message = isAxiosError(formError)
        ? (formError.response?.data as { message?: string } | undefined)
            ?.message
        : undefined
      throw new Error(message ?? "모집 문항 저장에 실패했습니다.")
    }

    return currentRoundId
  }

  const validateBeforeSave = (): string | null => {
    if (hasBlankQuestion) return "사용 중인 섹션의 항목을 모두 적어주세요."
    if (getRecruitableTracks(enabledParts).length === 0)
      return "모집할 트랙을 최소 1개 선택해 주세요."
    if (!seasonId) return "시즌 정보가 없어 모집 차수를 생성할 수 없습니다."
    if (!basicInfo.chapter || !basicInfo.school || !basicInfo.recruitmentType)
      return "1단계 기본 정보를 먼저 입력해 주세요."
    return null
  }

  const handleTempSave = async () => {
    if (isSaving) return
    const validationError = validateBeforeSave()
    if (validationError) {
      showErrorToast(validationError)
      return
    }

    setIsSaving(true)
    try {
      await ensureRoundAndSaveForm()
      savedSnapshotRef.current = currentSnapshot
      setShowTempSaveModal(true)
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "임시 저장에 실패했습니다.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    const validationError = validateBeforeSave()
    if (validationError) {
      showErrorToast(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await ensureRoundAndSaveForm()
      onNext()
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "모집 차수 생성에 실패했습니다.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-teal-gray-150 mt-6 flex flex-col gap-8 rounded-2xl border bg-white px-8 py-8.5">
      <RecruitmentSectionHeader index={3} title="모집 문항 작성" />
      <div className="flex flex-col">
        <FormHeader variant="basic" />
        <div className="bg-teal-gray-50 flex flex-col gap-10 rounded-b-xl border-r border-b border-l border-teal-300 px-5 pt-8.5 pb-9.5">
          {RECRUITMENT_DEFAULT_QUESTIONS.map((question) => {
            const removedOptions =
              removedOptionsByQuestionIndex[question.index] ?? []

            // 1지망(03)·2지망(04): 옵션 사용/해제가 가능한 전용 컴포넌트로 위임.
            // 2지망만 질문 자체도 껐다 켤 수 있다(allowDisable).
            if (OPTIONAL_TOGGLE_QUESTION_INDEXES.includes(question.index)) {
              return (
                <DefaultRadioQuestion
                  key={question.index}
                  question={question}
                  removedOptions={removedOptions}
                  onRemoveOption={(option) =>
                    removeOption(question.index, option)
                  }
                  onRestoreOption={(option) =>
                    restoreOption(question.index, option)
                  }
                  allowDisable={QUESTION_DISABLE_TOGGLE_INDEXES.includes(
                    question.index,
                  )}
                  alwaysShowControls={question.index === "04"}
                  disableFocus={
                    question.index === "03" || question.index === "04"
                  }
                  enabled={questionToggleState[question.index]?.enabled ?? true}
                  required={
                    questionToggleState[question.index]?.required ?? true
                  }
                  onEnabledChange={(enabled) =>
                    setQuestionEnabled(question.index, enabled)
                  }
                  onRequiredChange={(required) =>
                    setQuestionRequired(question.index, required)
                  }
                />
              )
            }

            return (
              <div key={question.index} className="flex flex-col gap-2.5">
                <QuestionItemTitle
                  index={question.index}
                  title={question.title}
                  caption={question.caption}
                  required
                />
                <div className="pl-3">
                  {question.type === "radio" && (
                    <StaticRadioOptionsList options={question.options ?? []} />
                  )}

                  {question.type === "text" && (
                    <QuestionFieldBox>
                      <span className="text-body-1-regular text-teal-gray-400">
                        답변을 작성하세요.
                      </span>
                    </QuestionFieldBox>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col">
        <FormHeader variant="common" />
        <PartSectionBody
          questions={commonQuestionDrafts}
          focusedQuestionId={focusedCommonQuestionId}
          onFocus={setFocusedCommonQuestionId}
          onUpdate={updateCommonQuestionDraft}
          onAdd={addCommonQuestion}
          onDelete={deleteCommonQuestion}
          captionPlaceholder="설명을 입력하세요"
        />
      </div>
      <div className="flex flex-col gap-4">
        {PARTS.map((part) => (
          <div key={part.key} className="flex flex-col">
            <FormHeader
              variant="part"
              partName={part.label}
              toggleChecked={enabledParts[part.key]}
              onToggleChange={(next) =>
                setEnabledParts({ ...enabledParts, [part.key]: next })
              }
            />
            {enabledParts[part.key] && (
              <PartSectionBody
                questions={partQuestionDrafts[part.key]}
                focusedQuestionId={focusedQuestionIdByPart[part.key]}
                onFocus={(id) => focusPartQuestion(part.key, id)}
                onUpdate={(id, patch) =>
                  updatePartQuestionDraft(part.key, id, patch)
                }
                onAdd={() => addPartQuestion(part.key)}
                onDelete={(id) => deletePartQuestion(part.key, id)}
              />
            )}
          </div>
        ))}
        <span className="text-label-2-medium text-teal-gray-400">
          * 지원자의 파트에 따라 해당하는 섹션의 질문만 노출됩니다.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="weak" color="neutral" onClick={onPrev}>
          이전
        </Button>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="weak"
            color="primary"
            disabled={!canTempSave}
            isLoading={isSaving}
            onClick={handleTempSave}
          >
            임시 저장
          </Button>
          <Button
            type="button"
            variant="fill"
            color="primary"
            isLoading={isSubmitting}
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>

      <CtaModal
        open={showTempSaveModal}
        onOpenChange={setShowTempSaveModal}
        variant="success"
        title="임시 저장 완료"
        content="임시저장이 완료되었습니다."
        confirmText="확인"
        onConfirm={() => navigate({ to: "/recruiting/recruitments" })}
      />
    </div>
  )
}
