import { cn } from "@/shared/lib/utils"
import { Toggle } from "@/shared/ui/Toggle"

type FormHeaderCommonProps = {
  variant: "common"
  className?: string
}

type FormHeaderPartProps = {
  variant: "part"
  partName: string
  toggleChecked: boolean
  onToggleChange: (checked: boolean) => void
  showToggle?: boolean
  toggleDisabled?: boolean
  className?: string
}

type FormHeaderProps = FormHeaderCommonProps | FormHeaderPartProps

export function FormHeader(props: FormHeaderProps) {
  if (props.variant === "common") {
    return (
      <div
        className={cn(
          "flex w-full items-center self-stretch rounded-t-[12px] border-t border-r border-l border-teal-300 bg-teal-100 py-2 pr-5 pl-7.5",
          props.className,
        )}
      >
        <span className="text-heading-7-semibold text-teal-600">공통 문항</span>
      </div>
    )
  }

  const showToggle = props.showToggle ?? true

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between bg-teal-100 py-2 pr-5 pl-7.5",
        props.toggleChecked
          ? "rounded-t-[12px] border-t border-r border-l border-teal-300"
          : "rounded-[12px] border border-teal-300",
        props.className,
      )}
    >
      <span className="text-heading-7-semibold text-teal-600">
        {props.partName}
      </span>
      {showToggle && (
        <div className="flex items-center gap-1.5">
          <span className="text-label-2-medium text-teal-gray-500">
            섹션 사용
          </span>
          <Toggle
            checked={props.toggleChecked}
            onChange={props.onToggleChange}
            disabled={props.toggleDisabled}
            size="sm"
            aria-label="섹션 사용 토글"
          />
        </div>
      )}
    </div>
  )
}
