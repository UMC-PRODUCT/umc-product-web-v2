import ToggleCheckboxIcon from "@/shared/assets/icon/toggle/ToggleCheckboxIcon"
import ToggleFileUploadIcon from "@/shared/assets/icon/toggle/ToggleFileUploadIcon"
import ToggleRadioIcon from "@/shared/assets/icon/toggle/ToggleRadioIcon"
import ToggleTextIcon from "@/shared/assets/icon/toggle/ToggleTextIcon"
import { FieldTypeButtonGroup } from "@/shared/ui/button/FieldTypeButtonGroup"
import { FloatingActionButton } from "@/shared/ui/button/FloatingActionButton"

import type { FieldType } from "@/features/project/new/model/applicationQuestion"
import type { FieldTypeOption } from "@/shared/ui/button/FieldTypeButtonGroup"

const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { key: "text", label: "텍스트", icon: ToggleTextIcon },
  { key: "radio", label: "단일 선택", icon: ToggleRadioIcon },
  { key: "checkbox", label: "복수 선택", icon: ToggleCheckboxIcon },
  { key: "file", label: "파일 업로드", icon: ToggleFileUploadIcon },
  { key: "portfolio", label: "포트폴리오", icon: ToggleFileUploadIcon },
]

interface QuestionTypeToolbarProps {
  selected: FieldType
  onChange: (type: FieldType) => void
  onAddAfter: () => void
}

export function QuestionTypeToolbar({
  selected,
  onChange,
  onAddAfter,
}: QuestionTypeToolbarProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <FieldTypeButtonGroup
        options={FIELD_TYPE_OPTIONS}
        selected={selected}
        onChange={(key) => onChange(key as FieldType)}
      />
      <FloatingActionButton aria-label="질문 추가" onClick={onAddAfter} />
    </div>
  )
}
