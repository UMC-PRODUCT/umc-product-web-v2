import { cn } from "@/shared/lib/utils"

import { FieldTypeButton } from "./FieldTypeButton"

import type { ComponentType, SVGProps } from "react"

export interface FieldTypeOption {
  key: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface FieldTypeButtonGroupProps {
  options: readonly FieldTypeOption[]
  selected: string | null
  onChange: (key: string) => void
  className?: string
}

export function FieldTypeButtonGroup({
  options,
  selected,
  onChange,
  className,
}: FieldTypeButtonGroupProps) {
  return (
    <div
      className={cn(
        "border-teal-gray-100 bg-teal-gray-100 shadow-drop-neutral-3 inline-flex items-center gap-1 rounded-[20px] border p-1.5",
        className,
      )}
    >
      {options.map(({ key, label, icon }) => (
        <FieldTypeButton
          key={key}
          icon={icon}
          label={label}
          selected={selected === key}
          onClick={() => onChange(key)}
        />
      ))}
    </div>
  )
}
