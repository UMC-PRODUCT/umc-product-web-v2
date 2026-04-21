import {
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  forwardRef,
  useRef,
} from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import { cn } from "@/shared/lib/utils"

interface MemberSearchBarProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "size" | "className"
> {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onClear: () => void
  isSelected?: boolean
  className?: string
  inputClassName?: string
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
    className,
    inputClassName,
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
    <div
      className={cn(
        "shadow-inner-neutral-2 inline-flex h-11 w-full max-w-[312px] cursor-text items-center gap-1 rounded-[12px] border pl-4",
        "border-teal-gray-300 bg-white",
        "focus-within:border-teal-400",
        hasValue && "border-teal-400 bg-teal-50",
        hasValue ? "pr-2.5" : "pr-3 focus-within:pr-2.5",
        className,
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
            ;(ref as React.MutableRefObject<HTMLInputElement | null>).current =
              el
          }
        }}
        type="text"
        value={value}
        onChange={onChange}
        className={cn(
          "text-label-1-medium text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 cursor-text bg-transparent outline-none",
          inputClassName,
        )}
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={isSelected ? "선택 해제" : "검색어 지우기"}
          className="text-teal-gray-400 shrink-0 cursor-pointer"
        >
          {isSelected ? (
            <CheckIcon width={16} height={16} aria-hidden="true" />
          ) : (
            <CloseCircleIcon width={18} height={18} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  )
})
