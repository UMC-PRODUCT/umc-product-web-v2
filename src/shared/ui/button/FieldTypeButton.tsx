import { cn } from "@/shared/lib/utils"

import type { ComponentProps, ComponentType, SVGProps } from "react"

interface FieldTypeButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  selected: boolean
}

export function FieldTypeButton({
  icon: Icon,
  label,
  selected,
  className,
  type = "button",
  ...props
}: FieldTypeButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[16px] p-1.5 transition-colors",
        selected
          ? "shadow-inner-neutral-2 bg-teal-100 text-teal-600"
          : "bg-teal-gray-50 text-teal-gray-500 hover:bg-teal-gray-100",
        className,
      )}
      {...props}
    >
      <Icon width={30} height={30} className="shrink-0" aria-hidden="true" />
      <span className="text-caption-3-medium text-center">{label}</span>
    </button>
  )
}
