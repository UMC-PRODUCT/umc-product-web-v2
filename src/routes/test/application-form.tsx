import { createFileRoute } from "@tanstack/react-router"

import { getFieldTypePatch } from "@/features/project/new/model/applicationQuestion"
import { useApplicationForm } from "@/features/project/new/model/useApplicationForm"
import { QuestionCard } from "@/features/project/new/ui/application/QuestionCard"
import { QuestionListContainer } from "@/features/project/new/ui/application/QuestionListContainer"
import { QuestionTypeToolbar } from "@/features/project/new/ui/application/QuestionTypeToolbar"
import { cn } from "@/shared/lib/utils"
import { FloatingActionButton } from "@/shared/ui/button/FloatingActionButton"
import { FormHeader } from "@/shared/ui/FormHeader"

export const Route = createFileRoute("/test/application-form")({
  component: ApplicationFormTestPage,
})

function ApplicationFormTestPage() {
  const form = useApplicationForm()

  const focusedCommon = form.commonQuestions.find(
    (q) => q.id === form.focusedId,
  )
  const focusedSectionEntry = form.sections
    .flatMap((s) => s.questions.map((q) => ({ section: s, question: q })))
    .find(({ question }) => question.id === form.focusedId)

  return (
    <div className="bg-teal-gray-50 min-h-screen">
      <div className="border-teal-gray-100 border-b bg-white px-10 py-6">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          프로젝트 등록
        </h1>
        <p className="text-body-2-regular text-teal-gray-500 mt-1">
          내 프로젝트에 대한 정보를 등록하고 모집 폼을 작성합니다.
        </p>
      </div>

      <div className="border-teal-gray-100 flex border-b bg-white">
        {(["기본 정보", "모집 정보", "지원 문항"] as const).map((label, i) => (
          <div
            key={label}
            className={cn(
              "text-label-1-medium flex flex-1 items-center justify-center gap-2 py-3",
              i === 2
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-teal-gray-400",
            )}
          >
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold",
                i === 2
                  ? "bg-teal-600 text-white"
                  : "bg-teal-gray-100 text-teal-gray-400",
              )}
            >
              {i + 1}
            </span>
            {label}
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-225 flex-col gap-6 py-8">
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
                onFocus={() => form.setFocusedId(q.id)}
                onUpdate={(patch) => form.updateCommonQuestion(q.id, patch)}
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
                  getFieldTypePatch(fieldType),
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
                      onFocus={() => form.setFocusedId(q.id)}
                      onUpdate={(patch) =>
                        form.updateSectionQuestion(section.id, q.id, patch)
                      }
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
                        getFieldTypePatch(fieldType),
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

        <div className="flex flex-col gap-1">
          <p className="text-label-2-medium text-teal-gray-400 whitespace-pre">
            {`* 지원자의 파트에 따라 해당하는 섹션의 질문만 노출됩니다.\n* 개발(FE/BE) 섹션의 문항은 추후 기획-개발자 매칭 전 수정이 가능합니다.`}
          </p>
        </div>
      </div>

      <div className="border-teal-gray-100 sticky bottom-0 flex items-center justify-between border-t bg-white px-10 py-4">
        <button
          type="button"
          className="text-body-1-medium text-teal-gray-600 border-teal-gray-200 hover:bg-teal-gray-50 rounded-[12px] border px-6 py-3 transition-colors"
        >
          임시 저장
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            className="text-body-1-medium text-teal-gray-600 border-teal-gray-200 hover:bg-teal-gray-50 rounded-[12px] border px-6 py-3 transition-colors"
          >
            이전
          </button>
          <button
            type="button"
            className="text-body-1-medium rounded-[12px] bg-teal-500 px-6 py-3 text-white transition-colors hover:bg-teal-600"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  )
}
