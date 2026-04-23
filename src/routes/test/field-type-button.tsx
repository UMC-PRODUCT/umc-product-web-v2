import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import ToggleCheckboxIcon from "@/shared/assets/icon/toggle/ToggleCheckboxIcon"
import ToggleFileUploadIcon from "@/shared/assets/icon/toggle/ToggleFileUploadIcon"
import ToggleRadioIcon from "@/shared/assets/icon/toggle/ToggleRadioIcon"
import ToggleTextIcon from "@/shared/assets/icon/toggle/ToggleTextIcon"
import SvgUploadImageIcon from "@/shared/assets/icon/upload/UploadImageIcon"
import { FieldTypeButtonGroup } from "@/shared/ui/button/FieldTypeButtonGroup"

import type { FieldTypeOption } from "@/shared/ui/button/FieldTypeButtonGroup"

export const Route = createFileRoute("/test/field-type-button")({
  component: FieldTypeButtonTestPage,
})

const FIELD_TYPES: readonly FieldTypeOption[] = [
  { key: "text", label: "텍스트", icon: ToggleTextIcon },
  { key: "radio", label: "단일 선택", icon: ToggleRadioIcon },
  { key: "checkbox", label: "복수 선택", icon: ToggleCheckboxIcon },
  { key: "file", label: "파일 업로드", icon: ToggleFileUploadIcon },
  { key: "portfolio", label: "포트폴리오", icon: SvgUploadImageIcon },
]

function FieldTypeButtonTestPage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        FieldTypeButton Test Page
      </h1>

      <div className="flex w-[900px] flex-col items-center gap-4">
        <FieldTypeButtonGroup
          options={FIELD_TYPES}
          selected={selected}
          onChange={(key) => setSelected(selected === key ? null : key)}
        />
        <p className="text-caption-1-medium text-teal-gray-500">
          선택: {selected ?? "없음"}
        </p>
      </div>
    </main>
  )
}
