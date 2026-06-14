import { useEffect, useRef, useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"

export interface DropdownOption<T extends string | number> {
  value: T
  label: string
  disabled?: boolean
}

interface DropdownProps<T extends string | number> {
  value: T | undefined
  onChange: (value: T) => void
  options: ReadonlyArray<DropdownOption<T>>
  placeholder: string
  disabled?: boolean
  error?: boolean
  hasMore?: boolean
  className?: string
  isLoadingMore?: boolean
  onReachEnd?: () => void
  panelClassName?: string
  id?: string
}

export function Dropdown<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  hasMore = false,
  className,
  isLoadingMore = false,
  onReachEnd,
  panelClassName,
  id,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [open])

  const selected = options.find((option) => option.value === value)
  const displayLabel = selected?.label ?? placeholder
  const hasValue = selected !== undefined

  const stateClass = (() => {
    if (disabled) {
      return "bg-teal-gray-50 border-teal-gray-200 text-teal-gray-300 cursor-not-allowed pointer-events-none"
    }
    if (error) {
      return "bg-error-50/60 border-error-400 text-error-500"
    }
    if (open) {
      return "bg-teal-50 border-teal-400 text-teal-600"
    }
    if (hasValue) {
      return "bg-white border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50"
    }
    return "bg-white border-teal-gray-300 text-teal-gray-400 hover:bg-teal-gray-50"
  })()

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "shadow-inner-neutral-2 text-label-1-medium inline-flex h-11 w-full items-center justify-between gap-1 rounded-[12px] border pr-2.5 pl-4 transition-colors",
          stateClass,
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <DownChevronIcon
          className={cn(
            "text-teal-gray-400 size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          onScroll={(event) => {
            if (!hasMore || isLoadingMore || !onReachEnd) return
            const target = event.currentTarget
            const remaining =
              target.scrollHeight - target.scrollTop - target.clientHeight
            if (remaining <= 24) onReachEnd()
          }}
          className={cn(
            "border-teal-gray-50 shadow-drop-neutral-1 scrollbar-hide absolute top-[calc(100%+0.25rem)] left-0 z-30 flex max-h-60 w-full flex-col overflow-y-auto rounded-[12px] border bg-white p-0.5",
            panelClassName,
          )}
        >
          {options.length === 0 ? (
            <li className="text-body-2-medium text-teal-gray-400 px-4 py-3">
              항목이 없습니다.
            </li>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value
              return (
                <li
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "text-body-2-medium flex h-10 w-full items-center justify-between gap-2.5 rounded-[8px] py-0 pr-2.5 pl-4 text-left transition-[background-color,color,box-shadow]",
                      option.disabled &&
                        "text-teal-gray-300 cursor-not-allowed",
                      !option.disabled &&
                        !isSelected && [
                          "text-teal-gray-700 hover:bg-teal-gray-50 hover:shadow-inner-neutral-3",
                        ],
                      !option.disabled &&
                        isSelected &&
                        "shadow-inner-neutral-4 text-subtitle-4-semibold bg-teal-50 text-teal-600",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <CheckIcon
                        className="size-4 shrink-0 text-teal-500"
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              )
            })
          )}
          {isLoadingMore && (
            <li className="text-body-2-medium text-teal-gray-400 px-4 py-3">
              불러오는 중입니다.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
