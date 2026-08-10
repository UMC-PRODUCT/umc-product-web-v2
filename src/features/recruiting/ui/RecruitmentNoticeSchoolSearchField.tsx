import { useRef, useState } from "react"

import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { SearchField } from "@/shared/ui/search-field/SearchField"

interface RecruitmentNoticeSchoolSearchFieldProps {
  value: string
  onChange: (value: string) => void
  schools: string[]
  className?: string
}

export function RecruitmentNoticeSchoolSearchField({
  value,
  onChange,
  schools,
  className,
}: RecruitmentNoticeSchoolSearchFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside(containerRef, () => setOpen(false), open)

  const matches = value
    ? schools.filter((school) => school.includes(value))
    : []
  const showDropdown = open && value.length > 0 && matches.length > 0

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <SearchField
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="학교명으로 검색하세요"
        aria-label="학교명으로 검색"
        className="focus-within:bg-teal-gray-100 focus-within:border-transparent"
        inputClassName="text-body-2-medium"
      />

      {showDropdown && (
        <ul
          role="listbox"
          className="border-teal-gray-50 shadow-drop-neutral-1 absolute top-[calc(100%+0.5rem)] left-0 z-30 flex max-h-55 w-full flex-col items-start gap-0.5 overflow-y-auto rounded-lg border bg-white p-0.5"
        >
          {matches.map((school) => (
            <li
              key={school}
              role="option"
              aria-selected={false}
              className="w-full"
            >
              <DropdownItem
                label={school}
                onClick={() => {
                  onChange(school)
                  setOpen(false)
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
