import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  buildUpsertApplicationFormBody,
  projectKeys,
  upsertApplicationForm,
} from "@/features/project/new/api"
import {
  getFieldTypePatch,
  validateApplicationForm,
} from "@/features/project/new/model/applicationQuestion"
import { useApplicationForm } from "@/features/project/new/model/useApplicationForm"
import { useProjectRegisterStore } from "@/features/project/new/model/useProjectRegisterStore"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { FloatingActionButton } from "@/shared/ui/button/FloatingActionButton"
import { FormHeader } from "@/shared/ui/FormHeader"

import { QuestionCard } from "./QuestionCard"
import { QuestionListContainer } from "./QuestionListContainer"
import { QuestionTypeToolbar } from "./QuestionTypeToolbar"

export interface ApplicationFormHandle {
  save: () => Promise<boolean>
  getIsDirty: () => boolean
  resetDirty: () => void
}

interface ApplicationFormProps {
  onPrev?: () => void
  onNext?: () => void
  isEditMode?: boolean
  readOnly?: boolean
  isHydrated?: boolean
  isSubmitting?: boolean
  canCreateProject?: boolean
  createPermissionLoading?: boolean
}

export const ApplicationForm = forwardRef<
  ApplicationFormHandle,
  ApplicationFormProps
>(function ApplicationForm(
  {
    onPrev,
    onNext,
    isEditMode = false,
    readOnly = false,
    isHydrated = true,
    isSubmitting = false,
    canCreateProject = true,
    createPermissionLoading = false,
  },
  ref,
) {
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const form = useApplicationForm()
  const projectId = useProjectRegisterStore((s) => s.projectId)
  const commonSectionId = useProjectRegisterStore(
    (s) => s.application.commonSectionId,
  )
  const [hasSavedOnce, setHasSavedOnce] = useState(isEditMode)
  const [errorQuestionIds, setErrorQuestionIds] = useState<string[]>([])

  const currentSnapshot = useMemo(
    () => JSON.stringify({ c: form.commonQuestions, s: form.sections }),
    [form.commonQuestions, form.sections],
  )
  const lastSavedSnapshotRef = useRef<string | null>(null)
  const isDirty = lastSavedSnapshotRef.current !== currentSnapshot
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  useEffect(() => {
    if (isEditMode && isHydrated && lastSavedSnapshotRef.current === null) {
      lastSavedSnapshotRef.current = currentSnapshot
    }
  }, [isEditMode, isHydrated, currentSnapshot])

  const saveAppMutation = useMutation({
    mutationFn: async () => {
      if (!projectId)
        throw new Error(
          "프로젝트 ID가 없습니다. Step 1 임시저장을 먼저 진행해주세요.",
        )
      const body = buildUpsertApplicationFormBody(
        form.commonQuestions,
        form.sections,
        commonSectionId,
      )
      return upsertApplicationForm(projectId, body)
    },
    onSuccess: () => {
      lastSavedSnapshotRef.current = currentSnapshot
      setHasSavedOnce(true)
      if (projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.applicationForm(projectId),
        })
      }
      addToast({
        message: "작성한 내용이 임시 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: () => {
      addToast({
        message: "임시 저장에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!isDirtyRef.current) return true
      try {
        await saveAppMutation.mutateAsync()
        return true
      } catch {
        return false
      }
    },
    getIsDirty: () => {
      if (isEditMode && !isHydrated) return false
      return isDirtyRef.current
    },
    resetDirty: () => {
      lastSavedSnapshotRef.current = currentSnapshot
      isDirtyRef.current = false
    },
  }))

  const canCreateDraft =
    projectId !== null || (canCreateProject && !createPermissionLoading)
  const canTempSave =
    !saveAppMutation.isPending && (isDirty || !hasSavedOnce) && canCreateDraft
  const tempSaveLabel =
    hasSavedOnce && !isDirty && !saveAppMutation.isPending
      ? "저장 완료"
      : "임시 저장"

  const runValidation = (): boolean => {
    const { sectionEmptyName, errors } = validateApplicationForm(
      form.commonQuestions,
      form.sections,
    )

    if (sectionEmptyName) {
      addToast({
        message: `${sectionEmptyName} 섹션에 질문을 추가해주세요!`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }

    const firstError = errors[0]
    if (firstError) {
      setErrorQuestionIds(errors.map((e) => e.questionId))
      form.setFocusedId(firstError.questionId)
      addToast({
        message: "질문 입력을 완료해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }

    setErrorQuestionIds([])
    return true
  }

  const handleTempSave = () => {
    if (!canCreateDraft) {
      addToast({
        message: "임시 저장에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    saveAppMutation.mutate()
  }

  const handlePrev = () => {
    onPrev?.()
  }

  const handleNext = () => {
    if (!runValidation()) return
    onNext?.()
  }

  const focusedCommon = form.commonQuestions.find(
    (q) => q.id === form.focusedId,
  )
  const focusedSectionEntry = form.sections
    .flatMap((s) => s.questions.map((q) => ({ section: s, question: q })))
    .find(({ question }) => question.id === form.focusedId)

  return (
    <div className={cn("flex flex-col gap-4 py-4")}>
      {readOnly && (
        <div className="text-body-2-medium mx-auto w-full max-w-225 rounded-[8px] border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-700">
          매칭 기간 중에는 지원 폼을 수정할 수 없습니다.
        </div>
      )}
      <div
        className={cn(
          "mx-auto flex w-full max-w-225 flex-col gap-6",
          readOnly && "pointer-events-none opacity-60 select-none",
        )}
      >
        <div className="flex flex-col">
          <FormHeader variant="common" />
          <QuestionListContainer
            className="pt-0.1"
            itemIds={form.commonQuestions.map((q) => q.id)}
            onReorder={form.reorderCommonQuestion}
          >
            {form.commonQuestions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                focused={form.focusedId === q.id}
                isError={errorQuestionIds.includes(q.id)}
                canDelete={form.commonQuestions.length > 1}
                showFocusIndicator={false}
                onFocus={() => form.setFocusedId(q.id)}
                onUpdate={(patch) => {
                  form.updateCommonQuestion(q.id, patch)
                  setErrorQuestionIds((prev) =>
                    prev.filter((id) => id !== q.id),
                  )
                }}
                onDelete={() => form.deleteCommonQuestion(q.id)}
              />
            ))}
          </QuestionListContainer>
          {focusedCommon && (
            <QuestionTypeToolbar
              selected={focusedCommon.fieldType}
              onChange={(fieldType) =>
                form.updateCommonQuestion(
                  focusedCommon.id,
                  getFieldTypePatch(fieldType, focusedCommon),
                )
              }
              onAddAfter={() => form.addCommonQuestion(focusedCommon.id)}
            />
          )}
        </div>

        {form.sections.map((section) => (
          <div key={section.id} className="flex flex-col">
            <FormHeader
              variant="part"
              partName={section.name}
              toggleChecked={section.isEnabled}
              onToggleChange={(enabled) => {
                form.updateSection(section.id, { isEnabled: enabled })
                if (enabled && section.questions.length === 0) {
                  form.appendSectionQuestion(section.id)
                }
              }}
            />
            {section.isEnabled && (
              <>
                <QuestionListContainer
                  itemIds={section.questions.map((q) => q.id)}
                  onReorder={(from, to) =>
                    form.reorderSectionQuestion(section.id, from, to)
                  }
                >
                  {section.questions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      focused={form.focusedId === q.id}
                      isError={errorQuestionIds.includes(q.id)}
                      onFocus={() => form.setFocusedId(q.id)}
                      onUpdate={(patch) => {
                        form.updateSectionQuestion(section.id, q.id, patch)
                        setErrorQuestionIds((prev) =>
                          prev.filter((id) => id !== q.id),
                        )
                      }}
                      onDelete={() =>
                        form.deleteSectionQuestion(section.id, q.id)
                      }
                    />
                  ))}
                  {section.questions.length === 0 && (
                    <div className="flex items-center justify-center py-6">
                      <FloatingActionButton
                        aria-label="질문 추가"
                        onClick={() => form.appendSectionQuestion(section.id)}
                      />
                    </div>
                  )}
                </QuestionListContainer>
                {focusedSectionEntry?.section.id === section.id && (
                  <QuestionTypeToolbar
                    selected={focusedSectionEntry.question.fieldType}
                    onChange={(fieldType) =>
                      form.updateSectionQuestion(
                        section.id,
                        focusedSectionEntry.question.id,
                        getFieldTypePatch(
                          fieldType,
                          focusedSectionEntry.question,
                        ),
                      )
                    }
                    onAddAfter={() =>
                      form.addSectionQuestion(
                        section.id,
                        focusedSectionEntry.question.id,
                      )
                    }
                  />
                )}
              </>
            )}
          </div>
        ))}

        <div className="bp1:mb-21 mb-14 flex flex-col gap-1">
          <p className="text-body-2-regular text-teal-gray-500 whitespace-pre-wrap">
            {`* 지원자의 파트에 따라 해당하는 섹션의 질문만 노출됩니다.\n* 개발(FE/BE) 섹션의 문항은 추후 기획-개발자 매칭 전 수정이 가능합니다.`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {!readOnly && (
          <Button
            type="button"
            variant="weak"
            color="primary"
            disabled={!canTempSave}
            onClick={handleTempSave}
          >
            {tempSaveLabel}
          </Button>
        )}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="weak"
            color="neutral"
            onClick={handlePrev}
          >
            이전
          </Button>
          {!readOnly && (
            <Button
              type="button"
              variant="fill"
              color="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleNext}
            >
              {isEditMode ? "수정 완료" : "등록하기"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})
