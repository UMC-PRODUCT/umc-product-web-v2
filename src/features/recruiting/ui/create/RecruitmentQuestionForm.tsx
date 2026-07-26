import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import CloseThinIcon from "@/shared/assets/icon/close/CloseThinIcon"
import DragAndDrop from "@/shared/assets/icon/drag-and-drop/DragAndDrop"
import TrashCan from "@/shared/assets/icon/garbage/TrashCan"
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
import { QuestionFieldBox } from "@/shared/ui/question-field/QuestionFieldBox"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { Toggle } from "@/shared/ui/Toggle"

import { PARTS } from "../../model/parts"
import { RECRUITMENT_DEFAULT_QUESTIONS } from "../../model/recruitmentQuestion"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

import type { FieldTypeOption } from "@/shared/ui/button/FieldTypeButtonGroup"

import type { PartKey } from "../../model/parts"
import type { RecruitmentDefaultQuestion } from "../../model/recruitmentQuestion"

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
}: {
  option: string
  onRemove: () => void
}) {
  return (
    <div className="group/option hover:bg-teal-gray-50 flex w-full items-center justify-between gap-3 rounded-lg p-2">
      <div className="flex min-w-0 items-center gap-3">
        <RadioIndicator checked={false} variant="list" />
        <span className="text-body-1-regular text-teal-gray-700">{option}</span>
      </div>
      <button
        type="button"
        aria-label={`${option} 옵션 사용 해제`}
        onClick={onRemove}
        className="text-teal-gray-400 flex size-5 shrink-0 items-center justify-center opacity-0 transition-opacity group-hover/option:opacity-100 focus-visible:opacity-100"
      >
        <CloseThinIcon className="size-3.5" />
      </button>
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

// 파트 섹션("섹션 사용" 토글 ON) 본문. 문항 추가/유형 전환은 아직 TODO라
// 공통 문항 섹션과 동일하게 정적 플레이스홀더만 보여준다.
function PartSectionBody() {
  return (
    <div className="bg-teal-gray-100 relative flex w-full flex-col items-end gap-4 rounded-br-xl rounded-bl-xl border-r border-b border-l border-teal-200 px-5 pt-4 pb-5">
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 w-2 rounded-bl-xl bg-teal-500"
      />
      <div className="flex w-full justify-center">
        <DragAndDrop className="h-2.5 w-4" aria-hidden="true" />
      </div>
      <div className="flex w-full flex-col items-start gap-2.5">
        <QuestionItemTitle index="01" title="" caption="설명을 입력하세요." />
        <div className="w-full pl-3">
          <QuestionFieldBox>
            <span className="text-body-1-regular text-teal-gray-400">
              답변을 작성하세요.
            </span>
          </QuestionFieldBox>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckboxIndicator checked={false} variant="list" />
          <span className="text-body-1-medium text-teal-gray-600">
            필수 항목
          </span>
        </div>
        <button
          type="button"
          aria-label="문항 삭제"
          className="text-teal-gray-500 flex size-6.5 shrink-0 items-center justify-center"
        >
          <TrashCan className="size-6" />
        </button>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <FieldTypeButtonGroup
          options={PART_FIELD_TYPE_OPTIONS}
          selected="text"
          onChange={() => {}}
          className="max-w-full flex-wrap justify-center"
        />
        <FloatingActionButton aria-label="질문 추가" />
      </div>
    </div>
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
  onPrev: () => void
  onNext: () => void
  onDirtyChange?: (dirty: boolean) => void
  onBlankPartsChange?: (hasBlankEnabledPart: boolean) => void
}

export function RecruitmentQuestionForm({
  onPrev,
  onNext,
  onDirtyChange,
  onBlankPartsChange,
}: RecruitmentQuestionFormProps) {
  const navigate = useNavigate()
  const [enabledParts, setEnabledParts] = useState<Record<PartKey, boolean>>(
    () =>
      Object.fromEntries(PARTS.map((part) => [part.key, false])) as Record<
        PartKey,
        boolean
      >,
  )
  const [removedOptionsByQuestionIndex, setRemovedOptionsByQuestionIndex] =
    useState<Record<string, string[]>>({})
  const [questionToggleState, setQuestionToggleState] = useState<
    Record<string, { enabled: boolean; required: boolean }>
  >(() =>
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
    }),
  )

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
  })
  const hasUnsavedChanges = savedSnapshotRef.current !== currentSnapshot
  const canTempSave = hasUnsavedChanges && !isSaving

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  // 파트 본문(PartSectionBody)이 아직 입력 불가한 정적 플레이스홀더라 검증할 실제 데이터가 없다.
  // "파트 사용" 토글만으로 미입력 여부를 판단하면 파트를 켜는 순간 영구히 다음 단계가
  // 막히므로, 파트별 문항 편집이 구현되기 전까지는 이 게이트를 임시로 비활성화한다.
  // TODO: 파트별 문항 편집 상태가 생기면 validateRecruitmentQuestionForm으로 교체.
  const hasBlankEnabledPart = false

  useEffect(() => {
    onBlankPartsChange?.(hasBlankEnabledPart)
  }, [hasBlankEnabledPart, onBlankPartsChange])

  const handleTempSave = () => {
    setIsSaving(true)
    // TODO: 실제 임시 저장 API 호출로 교체 (지금은 로딩 상태만 흉내)
    setTimeout(() => {
      savedSnapshotRef.current = currentSnapshot
      setIsSaving(false)
      setShowTempSaveModal(true)
    }, 600)
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
      {/* 공통 문항이 하나도 없으면(엣지 케이스) 지원자 화면에는 이 섹션 자체가 노출되지 않는다.
          여기 보이는 빈 상태(01 질문을 작성하세요.)는 관리자 작성 화면 전용 placeholder다. */}
      <div className="flex flex-col">
        <FormHeader variant="common" />
        <div className="bg-teal-gray-50 flex flex-col gap-10 rounded-b-xl border-r border-b border-l border-teal-300 px-5 pt-8.5 pb-9.5">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-1.5">
              <span className="text-heading-7-semibold text-teal-gray-400 w-7 shrink-0">
                01
              </span>
              <span className="text-heading-7-semibold text-teal-gray-400">
                질문을 작성하세요.
              </span>
            </div>
            <div className="pl-3">
              <QuestionFieldBox>
                <span className="text-body-1-regular text-teal-gray-400">
                  답변을 작성하세요.
                </span>
              </QuestionFieldBox>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {PARTS.map((part) => (
          <div key={part.key} className="flex flex-col">
            <FormHeader
              variant="part"
              partName={part.label}
              toggleChecked={enabledParts[part.key]}
              onToggleChange={(next) =>
                setEnabledParts((prev) => ({ ...prev, [part.key]: next }))
              }
            />
            {enabledParts[part.key] && <PartSectionBody />}
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
          <Button type="button" variant="fill" color="primary" onClick={onNext}>
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
