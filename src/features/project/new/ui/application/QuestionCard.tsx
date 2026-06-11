import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"

import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { CheckboxFieldList } from "@/shared/ui/question-field/CheckboxFieldList"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import { PortfolioField } from "@/shared/ui/question-field/PortfolioField"
import { QuestionForm } from "@/shared/ui/question-field/QuestionForm"
import { RadioFieldList } from "@/shared/ui/question-field/RadioFieldList"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import type { Question } from "@/features/project/new/model/applicationQuestion"

interface QuestionFieldRendererProps {
  question: Question
  onOptionsChange: (opts: string[]) => void
}

function QuestionFieldRenderer({
  question,
  onOptionsChange,
}: QuestionFieldRendererProps) {
  switch (question.fieldType) {
    case "text":
      return (
        <div className="pointer-events-none w-full">
          <TextQuestionField value="" onChange={() => {}} />
        </div>
      )
    case "radio":
      return (
        <RadioFieldList
          options={question.options}
          onOptionsChange={onOptionsChange}
        />
      )
    case "checkbox":
      return (
        <CheckboxFieldList
          options={question.options}
          onOptionsChange={onOptionsChange}
        />
      )
    case "file":
      return (
        <div className="pointer-events-none w-full">
          <FileUploadField
            fileName={null}
            placeholder="100MB 이하의 파일만 업로드 가능합니다."
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

interface QuestionCardProps {
  question: Question
  index: number
  focused: boolean
  isError?: boolean
  canDelete?: boolean
  onFocus: () => void
  onUpdate: (patch: Partial<Question>) => void
  onDelete: () => void
}

export function QuestionCard({
  question,
  index,
  focused,
  isError = false,
  canDelete = true,
  onFocus,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasContent =
    question.title.trim().length > 0 || (question.options?.length ?? 0) > 0

  const handleDeleteRequest = () => {
    if (hasContent) {
      setConfirmDeleteOpen(true)
      return
    }
    onDelete()
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <div
        onClick={focused ? undefined : onFocus}
        className={focused ? "w-full" : "w-full cursor-pointer"}
      >
        <QuestionForm
          index={`Q${index + 1}`}
          title={question.title}
          onTitleChange={(title) => onUpdate({ title })}
          caption={question.caption}
          onCaptionChange={(caption) => onUpdate({ caption })}
          focused={focused}
          isFirst={index === 0}
          isError={isError}
          readonlyTitle={question.fieldType === "portfolio"}
          required={question.required}
          onRequiredChange={(required) => onUpdate({ required })}
          canDelete={canDelete}
          onDelete={handleDeleteRequest}
          dragHandleProps={{ ...attributes, ...listeners }}
        >
          <QuestionFieldRenderer
            question={question}
            onOptionsChange={(options) => onUpdate({ options })}
          />
        </QuestionForm>
      </div>

      <CtaModal
        open={confirmDeleteOpen}
        title="질문 삭제"
        content="삭제한 질문은 되돌릴 수 없습니다. 질문을 삭제하시겠습니까?"
        cancelText="돌아가기"
        confirmText="삭제하기"
        variant="error"
        onOpenChange={setConfirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          onDelete()
          setConfirmDeleteOpen(false)
        }}
      />
    </div>
  )
}
