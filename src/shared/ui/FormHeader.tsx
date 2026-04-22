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
  className?: string
}

type FormHeaderProps = FormHeaderCommonProps | FormHeaderPartProps

export function FormHeader(props: FormHeaderProps) {
  if (props.variant === "common") {
    return (
      <div className={cn("flex w-full flex-col", props.className)}>
        <div className="flex items-center justify-center gap-2.5 self-start rounded-t-[8px] bg-teal-500 px-[42px] pt-2 pb-0.5">
          <span className="text-label-1-semibold text-white">공통 문항</span>
        </div>
        <div className="h-1.5 w-full bg-teal-500" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between bg-teal-100 py-2 pr-5 pl-[30px]",
        props.toggleChecked
          ? "rounded-t-[8px] border-t border-r border-l border-teal-300"
          : "rounded-[8px] border border-teal-300",
        props.className,
      )}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-heading-7-semibold text-teal-600">
          {props.partName}
        </span>
        <span className="text-body-2-medium text-teal-500">(선택 사항)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-label-2-medium text-teal-gray-500">
          섹션 사용
        </span>
        <Toggle
          checked={props.toggleChecked}
          onChange={props.onToggleChange}
          size="sm"
          aria-label="섹션 사용 토글"
        />
      </div>
    </div>
  )
}
