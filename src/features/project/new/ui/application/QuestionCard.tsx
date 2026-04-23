import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useRef, useState } from "react"

import { CheckboxFieldList } from "@/shared/ui/input/checkbox/CheckboxFieldList"
import { FileUploadField } from "@/shared/ui/input/file/FileUploadField"
import { PortfolioField } from "@/shared/ui/input/file/PortfolioField"
import { RadioFieldList } from "@/shared/ui/input/radio/RadioFieldList"
import { QuestionForm } from "@/shared/ui/question-field/QuestionForm"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import type { Question } from "@/features/project/new/model/applicationQuestion"

const MAX_FILE_BYTES = 100 * 1024 * 1024

interface QuestionFieldRendererProps {
  question: Question
  onOptionsChange: (opts: string[]) => void
}

function QuestionFieldRenderer({
  question,
  onOptionsChange,
}: QuestionFieldRendererProps) {
  const [textValue, setTextValue] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    setFileName(file.name)
  }

  function handleFileDelete() {
    setFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  switch (question.fieldType) {
    case "text":
      return <TextQuestionField value={textValue} onChange={setTextValue} />
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
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <FileUploadField
            fileName={fileName}
            placeholder="100MB 이하의 파일만 업로드 가능합니다."
            onUpload={() => fileInputRef.current?.click()}
            onDelete={handleFileDelete}
          />
        </>
      )
    case "portfolio":
      return <PortfolioField />
  }
}

interface QuestionCardProps {
  question: Question
  index: number
  focused: boolean
  isError?: boolean
  onFocus: () => void
  onUpdate: (patch: Partial<Question>) => void
  onDelete: () => void
}

export function QuestionCard({
  question,
  index,
  focused,
  isError = false,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
          onDelete={onDelete}
          dragHandleProps={{ ...attributes, ...listeners }}
        >
          <QuestionFieldRenderer
            question={question}
            onOptionsChange={(options) => onUpdate({ options })}
          />
        </QuestionForm>
      </div>
    </div>
  )
}
