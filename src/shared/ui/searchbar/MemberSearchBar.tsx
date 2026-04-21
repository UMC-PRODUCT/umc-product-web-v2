import {
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  forwardRef,
  useRef,
} from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import { cn } from "@/shared/lib/utils"

export type MemberItem = {
  nickname: string
  name: string
  university: string
}

interface MemberSearchBarProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "size" | "className" | "onSelect"
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
  const internalRef = useRef<HTMLInputElement>(null)
  const hasValue = value.length > 0

  const handleClear = () => {
    onClear()
    internalRef.current?.focus()
  }

  return (
    <div className={cn("relative w-full max-w-78", className)}>
      <div
        className={cn(
          "shadow-inner-neutral-2 inline-flex h-11 w-full cursor-text items-center gap-1 rounded-[12px] border pl-4",
          "bg-white",
          error
            ? "border-error-400 focus-within:border-error-400"
            : "border-teal-gray-300 focus-within:border-teal-400",
          !error && hasValue && "border-teal-400 bg-teal-50",
          hasValue ? "pr-2.5" : "pr-3 focus-within:pr-2.5",
        )}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          internalRef.current?.focus()
          e.preventDefault()
        }}
      >
        <input
          ref={(el) => {
            internalRef.current = el
            if (typeof ref === "function") {
              ref(el)
            } else if (ref) {
              ;(
                ref as React.MutableRefObject<HTMLInputElement | null>
              ).current = el
            }
          }}
          type="text"
          value={value}
          onChange={onChange}
          className={cn(
            "text-body-2-medium text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 cursor-text bg-transparent font-medium outline-none",
            inputClassName,
          )}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={isSelected ? "선택 해제" : "검색어 지우기"}
            className={cn(
              "shrink-0 cursor-pointer",
              isSelected ? "text-teal-400" : "text-teal-gray-400",
            )}
          >
            {isSelected ? (
              <CheckIcon width={16} height={16} aria-hidden="true" />
            ) : (
              <CloseCircleIcon width={18} height={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {items && items.length > 0 && (
        <ul className="shadow-drop-neutral-1 border-teal-gray-50 absolute top-11 right-0 z-10 flex max-h-56 w-full flex-col items-start overflow-y-auto rounded-[8px] border bg-white p-0.5">
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
