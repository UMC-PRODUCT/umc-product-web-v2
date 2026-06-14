import { useEffect, useRef, useState } from "react"

import { useSchools } from "@/features/auth/hooks/useSchools"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { cn } from "@/shared/lib/utils"

export type School = string

interface SchoolDropdownProps {
  value: School | undefined
  onChange: (value: School) => void
  className?: string
}

export function SchoolDropdown({
  value,
  onChange,
  className,
}: SchoolDropdownProps) {
  const [open, setOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { schools, isLoading } = useSchools({ nameType: "short" })

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

  useEffect(() => {
    if (open) {
      setIsFocused(false)
      inputRef.current?.focus()
    }
  }, [open])

  const filteredSchools = schools.filter(
    (school) =>
      school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.originalName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") {
        setOpen(true)
      }
      return
    }

    switch (e.key) {
      case "Escape":
        setOpen(false)
        break
      case "ArrowDown":
        e.preventDefault()
        setFocusedIndex((prev) =>
          prev < filteredSchools.length - 1 ? prev + 1 : prev,
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter": {
        e.preventDefault()
        const selected = filteredSchools[focusedIndex]
        if (selected) {
          onChange(selected.schoolName)
          setOpen(false)
          setSearchQuery("")
        }
        break
      }
    }
  }

  const displayLabel = value ?? "학교를 선택해주세요"
  const hasValue = value !== undefined

  const stateClass = (() => {
    if (open) {
      if (hasValue) {
        return "bg-teal-50 border-teal-300 text-teal-600"
      }
      return "bg-white border-teal-gray-300 text-teal-gray-400"
    }
    if (isFocused) {
      if (hasValue) {
        return "bg-teal-50 border-teal-300 text-teal-600"
      }
      return "bg-white border-teal-gray-300 text-teal-gray-400"
    }
    if (hasValue) {
      return "bg-white border-teal-gray-300 text-teal-gray-700"
    }
    return "bg-white border-teal-gray-300 text-teal-gray-400"
  })()

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "shadow-inner-neutral-2 text-label-1-medium inline-flex h-11 w-full min-w-90 items-center justify-between gap-1 rounded-[12px] border pr-2.5 pl-4 transition-colors",
          stateClass,
          !open && "hover:bg-teal-gray-50",
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <DownChevronIcon className="text-teal-gray-400 size-6 shrink-0" />
      </button>

      {open && (
        <div className="border-teal-gray-50 shadow-drop-neutral-1 absolute top-full left-0 z-30 flex max-h-67.5 w-full flex-col items-center gap-0.5 rounded-[8px] border bg-white p-0.5">
          <div className="bg-teal-gray-50 shadow-inner-neutral-1 flex h-11 w-full items-center gap-2 rounded-[8px] py-3 pr-3.5 pl-3">
            <SearchIcon className="text-teal-gray-400 h-5 w-5" />
            <input
              ref={inputRef}
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setFocusedIndex(-1)
              }}
              className="text-body-2-regular placeholder:text-teal-gray-400 text-teal-gray-900 w-full outline-none"
            />
          </div>

          <ul
            role="listbox"
            className="flex w-full flex-1 flex-col items-center overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {isLoading ? (
              <li className="text-body-2-regular text-teal-gray-400 flex w-full items-center justify-start rounded-[8px] px-4 py-[9.5px]">
                불러오는 중...
              </li>
            ) : filteredSchools.length === 0 ? (
              <li className="text-body-2-regular text-teal-gray-400 flex w-full items-center justify-start rounded-[8px] px-4 py-[9.5px]">
                검색 결과가 없습니다.
              </li>
            ) : (
              filteredSchools.map((school, index) => {
                return (
                  <li key={school.schoolId} role="option" className="w-full">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(school.schoolName)
                        setOpen(false)
                        setSearchQuery("")
                        setFocusedIndex(-1)
                      }}
                      onMouseEnter={() => setFocusedIndex(index)}
                      onMouseLeave={() => setFocusedIndex(-1)}
                      className="text-body-2-regular text-teal-gray-700 hover:shadow-inner-neutral-3 hover:bg-teal-gray-50 flex w-full items-center justify-start rounded-[8px] px-4 py-[9.5px]"
                    >
                      <span className="truncate">{school.schoolName}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
