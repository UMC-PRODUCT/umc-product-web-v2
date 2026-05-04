import {
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  forwardRef,
} from "react"

import { cn } from "@/shared/lib/utils"
import { InputBox } from "@/shared/ui/input/InputBox"

export type MemberItem = {
  nickname: string
  name: string
  university: string
}

interface MemberSearchBarProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "size" | "disabled" | "value" | "onChange" | "onSelect"
> {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onClear: () => void
  isSelected?: boolean
  error?: boolean
  className?: string
  inputClassName?: string
  items?: MemberItem[]
  onSelect?: (member: MemberItem) => void
}

export const MemberSearchBar = forwardRef<
  HTMLInputElement,
  MemberSearchBarProps
>(function MemberSearchBar(
  {
    value,
    onChange,
    onClear,
    isSelected = false,
    error = false,
    className,
    inputClassName,
    items,
    onSelect,
    ...props
  },
  ref,
) {
  const state = error ? "error" : isSelected ? "success" : "default"

  return (
    <div className={cn("relative w-full max-w-78", className)}>
      <InputBox
        ref={ref}
        value={value}
        onChange={onChange}
        type="clear"
        state={state}
        onClear={onClear}
        inputClassName={inputClassName}
        {...props}
      />
      {items && items.length > 0 && (
        <ul className="shadow-drop-neutral-1 border-teal-gray-50 scrollbar-hide absolute top-11 left-0 z-10 flex max-h-56 w-74.5 flex-col items-start overflow-y-auto rounded-[8px] border bg-white p-0.5">
          {items.map((item) => (
            <li key={item.name} className="w-full">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect?.(item)}
                className="text-body-2-medium text-teal-gray-900 hover:bg-teal-gray-50 hover:shadow-inner-neutral-2 flex h-10 w-full shrink-0 items-center gap-2.5 self-stretch rounded-[8px] pr-2.5 pl-4 text-left leading-none"
              >
                {item.nickname}/{item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
