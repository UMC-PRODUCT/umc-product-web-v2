import { isAxiosError } from "axios"
import { useEffect, useRef, useState } from "react"

import CloseThinIcon from "@/shared/assets/icon/close/CloseThinIcon"
import DragAndDrop from "@/shared/assets/icon/drag-and-drop/DragAndDrop"
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

import {
  createRecruitingRound,
  getRecruitingApplicationForm,
  upsertRecruitingApplicationForm,
} from "../../api/recruitingApi"
import { useAdminRecruitingRounds } from "../../hooks/useAdminRecruitingRounds"
import {
  MAX_ADDITIONAL_ROUND_NO,
  resolveAdditionalRoundNoOptions,
} from "../../model/additionalRoundNo"
import {
  getRecruitableTracks,
  PART_KEY_TO_TRACK,
  PARTS,
} from "../../model/parts"
import {
  buildRecruitmentPreviewTitle,
  buildRoundConfigurationPayload,
  composeRecruitmentTitle,
} from "../../model/recruitmentCreate"
import {
  buildCommonSectionUpsertRequest,
  buildTrackSectionUpsertRequest,
  extractSectionIds,
  getRecruitmentFieldTypePatch,
  makeRecruitmentQuestion,
  mapAdminFormToQuestionDraft,
  RECRUITMENT_DEFAULT_QUESTIONS,
  syncQuestionIdsAfterSave,
  validateRecruitmentQuestionForm,
} from "../../model/recruitmentQuestion"
import { getRecruitingRoundCreateErrorMessage } from "../../model/recruitmentRoundErrors"
import { useRecruitmentCreateStore } from "../../model/useRecruitmentCreateStore"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

import type { FieldTypeOption } from "@/shared/ui/button/FieldTypeButtonGroup"

import type { RecruitingAdminFormStructureResponse } from "../../api/types"
import type { PartKey } from "../../model/parts"
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
          <TextQuestionField value="" onChange={() => {}} />
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
}: {
  questions: RecruitmentQuestion[]
  focusedQuestionId: string | null
  onFocus: (id: string) => void
  onUpdate: (id: string, patch: Partial<RecruitmentQuestion>) => void
  onAdd: () => void
  onDelete: (id: string) => void
}) {
  const focusedQuestion = questions.find((q) => q.id === focusedQuestionId)

  return (
    <>
      <div className="bg-teal-gray-100 flex w-full flex-col items-center gap-4 rounded-br-xl rounded-bl-xl border-r border-b border-l border-teal-200 pb-5">
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
  enabled: boolean
  required: boolean
  onEnabledChange: (enabled: boolean) => void
  onRequiredChange: (required: boolean) => void
}) {
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const options = question.options ?? []
  const isDisabled = allowDisable && !enabled
  const showControls = allowDisable && (focused || isDisabled)

  useEffect(() => {
    if (!focused) return
    const handleOutsidePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleOutsidePointerDown)
    return () =>
      document.removeEventListener("mousedown", handleOutsidePointerDown)
  }, [focused])

  const controlsRow = allowDisable && (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ToggleButton
          role="checkbox"
          componentName="Checkbox"
          checked={required}
          onChange={onRequiredChange}
          aria-label="필수 항목 여부"
          className="inline-flex items-center justify-center"
        >
          <CheckboxIndicator checked={required} variant="list" />
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
      {isDisabled ? (
        <div className="flex items-start gap-1.5">
          <span className="text-heading-7-semibold text-teal-gray-400 w-7 shrink-0">
            00
          </span>
          <span className="text-heading-7-semibold text-teal-gray-400">
            {question.title}
          </span>
        </div>
      ) : (
        <QuestionItemTitle
          index={question.index}
          title={question.title}
          required={allowDisable ? required : true}
        />
      )}

      <div className="w-full pl-3">
        {isDisabled ? (
          <StaticRadioOptionsList options={options} muted />
        ) : (
          <ToggleableRadioOptionsBox
            options={options}
            removedOptions={removedOptions}
            onRemoveOption={onRemoveOption}
            onRestoreOption={onRestoreOption}
          />
        )}
      </div>
    </div>
  )

  if (isDisabled && !focused) {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onClick={() => setFocused(true)}
        className="bg-teal-gray-100 flex w-full flex-col items-end gap-4 rounded-br-xl rounded-bl-xl border-r border-b border-l border-teal-300 px-5 pt-8.5 pb-9.5"
      >
        {titleAndOptions}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onFocus={() => setFocused(true)}
      className={cn(
        "relative flex w-full flex-col items-end gap-4",
        focused &&
          "bg-teal-gray-100 rounded-br-xl rounded-bl-xl border-r border-b border-l border-teal-200 px-5 pt-4 pb-5",
      )}
    >
      {focused && (
        <>
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-2 rounded-bl-xl bg-teal-500"
          />
          <div className="flex w-full justify-center">
            <DragAndDrop className="h-2.5 w-4" aria-hidden="true" />
          </div>
        </>
      )}

      {titleAndOptions}

      {showControls && controlsRow}
    </div>
  )
}

interface RecruitmentQuestionFormProps {
  onPrev?: () => void
  onNext?: () => void
  onDirtyChange?: (dirty: boolean) => void
  onBlankPartsChange?: (hasBlankEnabledPart: boolean) => void
  initialFormStructure?: RecruitingAdminFormStructureResponse
  sectionIndex?: number
  // 이미 게시된(OPEN) 라운드를 수정하는 경우 true. 백엔드가 지원 폼 구조
  // upsert를 라운드/폼 둘 다 DRAFT 상태일 때만 허용하고, OPEN으로 전환되는
  // 순간 폼도 함께 PUBLISHED로 잠겨(RECRUITING-0201) 편집 자체가 불가능하다.
  // 그래서 저장을 시도하는 대신 화면을 읽기 전용으로 막는다.
  readOnly?: boolean
}

export function RecruitmentQuestionForm({
  onPrev,
  onNext,
  onDirtyChange,
  onBlankPartsChange,
  initialFormStructure,
  sectionIndex = 3,
  readOnly = false,
}: RecruitmentQuestionFormProps) {
  const addToast = useToastStore((state) => state.addToast)
  // 1단계에서 고른 추가모집 차수는 그 시점 기준 "다음 차수"일 뿐이다. 문항을
  // 채우는 동안 시간이 걸려 다른 라운드가 먼저 만들어지면 그 값이 낡아 서버가
  // RECRUITING-0116으로 거부한다. 그래서 라운드를 실제로 만드는 이 시점에
  // refetchSeasonGroups로 다시 계산해 검증한다(RecruitmentListPage 복제 로직과 동일 패턴).
  const { refetch: refetchSeasonGroups } = useAdminRecruitingRounds()
  const initialDraft = useState(() =>
    mapAdminFormToQuestionDraft(initialFormStructure),
  )[0]
  // 기존 섹션을 저장 시 새 섹션처럼 보내면 백엔드가 지우고 다시 만들어버리므로,
  // GET 응답에서 받은 sectionId를 그대로 들고 있다가 Upsert 요청에 되돌려 보낸다.
  // Upsert 응답은 폼 id만 줄 뿐 새로 배정된 섹션 id는 안 알려주므로, 저장이
  // 성공할 때마다 refetchSectionIds로 직접 갱신해야 한다(그러지 않으면 이
  // 화면을 벗어나지 않고 다시 저장할 때 낡은 id로 FORM-0025가 난다).
  const [commonSectionId, setCommonSectionId] = useState(
    initialDraft?.commonSectionId,
  )
  const [sectionIdByPart, setSectionIdByPart] = useState<
    Partial<Record<PartKey, number>>
  >(() => initialDraft?.sectionIdByPart ?? {})
  // 고정 문항(01~05)의 questionId·optionId. 없이 보내면 매번 새 문항처럼
  // 취급돼 FORM-0025가 난다 — sectionId와 같은 이유로 저장 직후 갱신한다.
  const [defaultQuestionMeta, setDefaultQuestionMeta] = useState(
    () => initialDraft?.defaultQuestionMeta ?? {},
  )
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
  // 파트별 섹션의 문항 목록 편집 상태. 파트당 여러 문항을 가질 수 있다.
  const [partQuestionDrafts, setPartQuestionDrafts] = useState<
    Record<PartKey, RecruitmentQuestion[]>
  >(
    () =>
      Object.fromEntries(
        PARTS.map((part) => [
          part.key,
          initialDraft?.partQuestionDrafts[part.key] ?? [
            makeRecruitmentQuestion(),
          ],
        ]),
      ) as Record<PartKey, RecruitmentQuestion[]>,
  )
  // 파트별로 현재 편집 중(카드가 펼쳐진 상태)인 문항 id.
  const [focusedQuestionIdByPart, setFocusedQuestionIdByPart] = useState<
    Record<PartKey, string | null>
  >(
    () =>
      Object.fromEntries(
        PARTS.map((part) => [
          part.key,
          (partQuestionDrafts[part.key] ?? [])[0]?.id ?? null,
        ]),
      ) as Record<PartKey, string | null>,
  )
  const [questionToggleState, setQuestionToggleState] = useState<
    Record<string, { enabled: boolean; required: boolean }>
  >(() =>
    initialDraft
      ? initialDraft.questionToggleState
      : Object.fromEntries(
          OPTIONAL_TOGGLE_QUESTION_INDEXES.map((index) => [
            index,
            { enabled: true, required: true },
          ]),
        ),
  )
  // 공통 문항 섹션에 운영진이 자유롭게 추가하는 문항 목록. 파트별 섹션과 동일하게
  // 문항 하나로 시작해 추가/삭제/유형 변경이 가능하다.
  const [commonQuestionDrafts, setCommonQuestionDrafts] = useState<
    RecruitmentQuestion[]
  >(() => initialDraft?.commonQuestionDrafts ?? [makeRecruitmentQuestion()])
  const [focusedCommonQuestionId, setFocusedCommonQuestionId] = useState<
    string | null
  >(() => commonQuestionDrafts[0]?.id ?? null)
  const [isSaving, setIsSaving] = useState(false)
  const [showTempSaveModal, setShowTempSaveModal] = useState(false)

  // enabledParts/secondChoiceEnabled는 스토어 소유라 로컬 state로 못 seed한다 —
  // 마운트 시 한 번만 prefill 값으로 덮어쓴다.
  const savedSnapshotRef = useRef(
    JSON.stringify({
      enabledParts,
      removedOptionsByQuestionIndex,
      questionToggleState,
      partQuestionDrafts,
      commonQuestionDrafts,
    }),
  )

  useEffect(() => {
    if (!initialDraft) return
    const nextEnabledParts = {
      ...enabledParts,
      ...initialDraft.enabledParts,
    }
    setEnabledParts(nextEnabledParts)
    setSecondChoiceEnabled(initialDraft.secondChoiceEnabled)
    // draft 프리필은 사용자 입력이 아니라 초기값 채움이므로, 스냅샷 캡처(마운트) 이후에
    // 반영되더라도 기준선에 포함시켜 이탈 모달이 곧바로 뜨지 않게 한다.
    savedSnapshotRef.current = JSON.stringify({
      enabledParts: nextEnabledParts,
      removedOptionsByQuestionIndex,
      questionToggleState,
      partQuestionDrafts,
      commonQuestionDrafts,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      (q) => q.id !== questionId,
    )
    setCommonQuestionDrafts(nextQuestions)
    setFocusedCommonQuestionId((prev) =>
      prev === questionId ? (nextQuestions[0]?.id ?? null) : prev,
    )
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
        enabled,
        required: prev[questionIndex]?.required ?? true,
      },
    }))
    if (questionIndex === "04") setSecondChoiceEnabled(enabled)
  }

  const setQuestionRequired = (questionIndex: string, required: boolean) => {
    setQuestionToggleState((prev) => ({
      ...prev,
      [questionIndex]: {
        enabled: prev[questionIndex]?.enabled ?? true,
        required,
      },
    }))
  }

  const currentSnapshot = JSON.stringify({
    enabledParts,
    removedOptionsByQuestionIndex,
    questionToggleState,
    partQuestionDrafts,
    commonQuestionDrafts,
  })
  const hasUnsavedChanges = savedSnapshotRef.current !== currentSnapshot
  const isSavingOrSubmitting = isSaving || isSubmitting
  const canTempSave = hasUnsavedChanges && !isSavingOrSubmitting

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
  const hasBlankEnabledPart =
    validateRecruitmentQuestionForm(
      commonQuestionDrafts,
      partSectionsForValidation,
    ).length > 0

  useEffect(() => {
    onBlankPartsChange?.(hasBlankEnabledPart)
  }, [hasBlankEnabledPart, onBlankPartsChange])

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
      let freshAdditionalRoundNo: number | undefined
      if (!roundId && basicInfo.recruitmentType === "ADDITIONAL") {
        const { data: freshGroups } = await refetchSeasonGroups()
        const sameSeasonRounds =
          freshGroups?.find((group) => group.seasonId === seasonId)?.rounds ??
          []
        freshAdditionalRoundNo = resolveAdditionalRoundNoOptions(
          sameSeasonRounds,
          MAX_ADDITIONAL_ROUND_NO,
        ).nextRoundNo
      }
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
          roundNo: freshAdditionalRoundNo,
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
            sectionIdByPart[part.key],
          ),
      )
      await upsertRecruitingApplicationForm(seasonId!, currentRoundId, {
        sections: [
          buildCommonSectionUpsertRequest(
            removedOptionsByQuestionIndex,
            questionToggleState,
            commonQuestionDrafts,
            commonSectionId,
            defaultQuestionMeta,
          ),
          ...trackSections,
        ],
      })
      const savedStructure = await getRecruitingApplicationForm(
        seasonId!,
        currentRoundId,
      )
      const savedSectionIds = extractSectionIds(savedStructure)
      setCommonSectionId(savedSectionIds.commonSectionId)
      setSectionIdByPart(savedSectionIds.sectionIdByPart)
      setDefaultQuestionMeta(savedSectionIds.defaultQuestionMeta)
      // 자유 문항(공통 "+", 파트별)도 서버가 새로 배정한 questionId를 안
      // 돌려받으면, 다음 저장 때 이미 만들어진 문항을 또 "새 문항"으로 보내
      // FORM-0025가 난다 — 위 섹션/고정문항 id 갱신과 같은 이유.
      const syncedIds = syncQuestionIdsAfterSave(
        savedStructure,
        commonQuestionDrafts,
        partQuestionDrafts,
      )
      setCommonQuestionDrafts(syncedIds.commonQuestionDrafts)
      setPartQuestionDrafts((prev) => ({
        ...prev,
        ...syncedIds.partQuestionDrafts,
      }))
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
    if (hasBlankEnabledPart) return "사용 중인 섹션의 항목을 모두 적어주세요."
    if (getRecruitableTracks(enabledParts).length === 0)
      return "모집할 트랙을 최소 1개 선택해 주세요."
    if (!seasonId) return "시즌 정보가 없어 모집 차수를 생성할 수 없습니다."
    if (!basicInfo.chapter || !basicInfo.school || !basicInfo.recruitmentType)
      return "1단계 기본 정보를 먼저 입력해 주세요."
    return null
  }

  const handleTempSave = async () => {
    if (isSavingOrSubmitting) return
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
    // 읽기 전용(게시된 라운드)은 고칠 것도, 저장할 것도 없다 — 저장을 시도하면
    // 백엔드가 RECRUITING-0201로 거부하므로 바로 다음 단계로 넘어간다.
    if (readOnly) {
      onNext?.()
      return
    }
    if (isSavingOrSubmitting) return
    const validationError = validateBeforeSave()
    if (validationError) {
      showErrorToast(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await ensureRoundAndSaveForm()
      // "임시 저장"과 마찬가지로 스냅샷을 갱신해야 한다. 안 그러면 여기서
      // 저장된 값인데도 hasUnsavedChanges가 계속 true로 남아, 3단계까지 다
      // 마치고 게시까지 끝낸 뒤에도 페이지 이탈 모달이 계속 뜬다.
      savedSnapshotRef.current = currentSnapshot
      onNext?.()
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
      <RecruitmentSectionHeader index={sectionIndex} title="모집 문항 작성" />
      {readOnly && (
        <p className="text-body-2-regular text-teal-gray-400 border-teal-gray-100 bg-teal-gray-50 rounded-xl border px-4 py-3">
          게시된 모집 공고는 문항을 수정할 수 없습니다.
        </p>
      )}
      <div
        className={cn(
          "flex flex-col gap-8",
          readOnly && "pointer-events-none opacity-60",
        )}
      >
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
                    enabled={
                      questionToggleState[question.index]?.enabled ?? true
                    }
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
                      <StaticRadioOptionsList
                        options={question.options ?? []}
                      />
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
        {/* 공통 문항이 하나도 없으면(엣지 케이스) 지원자 화면에는 이 섹션 자체가 노출되지 않는다. */}
        <div className="flex flex-col">
          <FormHeader variant="common" />
          <PartSectionBody
            questions={commonQuestionDrafts}
            focusedQuestionId={focusedCommonQuestionId}
            onFocus={setFocusedCommonQuestionId}
            onUpdate={updateCommonQuestionDraft}
            onAdd={addCommonQuestion}
            onDelete={deleteCommonQuestion}
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
      </div>
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          onClick={onPrev}
          className="mr-auto"
        >
          이전
        </Button>
        <div className="flex items-center gap-3">
          {!readOnly && (
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
          )}
          <Button
            type="button"
            variant="fill"
            color="primary"
            disabled={isSaving}
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
        onConfirm={() => setShowTempSaveModal(false)}
      />
    </div>
  )
}
