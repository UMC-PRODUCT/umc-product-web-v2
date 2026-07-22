import { useEffect, useRef, useState } from "react"

import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"

import type { Chapter } from "@/entities/organization/model/chapters"

interface RecruitmentSchoolSearchDropdownProps {
  open: boolean
  chapter: Chapter
  onOpenChange: (open: boolean) => void
  onSelect: (school: string) => void
  className?: string
}

export function RecruitmentSchoolSearchDropdown({
  open,
  chapter,
  onOpenChange,
  onSelect,
  className,
}: RecruitmentSchoolSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useClickOutside(containerRef, () => onOpenChange(false), open)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    } else {
      setSearchQuery("")
    }
  }, [open])

  if (!open) return null

  // TODO: 지부 개편 시 getChaptersWithSchools API 기반으로 전환 검토 (SCHOOLS_BY_BRANCH 하드코딩 제거)
  const filteredSchools = SCHOOLS_BY_BRANCH[chapter].filter((school) =>
    school.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "border-teal-gray-50 shadow-drop-neutral-1 absolute top-full left-0 z-30 flex w-40 flex-col items-start gap-0.5 rounded-lg border bg-white p-0.5",
        className,
      )}
    >
      <div className="bg-teal-gray-50 flex h-11 w-full items-center gap-2 rounded-lg px-3">
        <SearchIcon className="text-teal-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder="검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-body-2-regular placeholder:text-teal-gray-400 text-teal-gray-900 w-full bg-transparent outline-none"
        />
      </div>
      <ul
        role="listbox"
        className="flex max-h-55 w-full flex-col items-start overflow-y-auto"
      >
        {filteredSchools.length === 0 ? (
          <li className="text-body-2-regular text-teal-gray-400 flex w-full items-center px-4 py-2.5">
            검색 결과가 없습니다.
          </li>
        ) : (
          filteredSchools.map((school) => (
            <li key={school} role="option" className="w-full">
              <DropdownItem
                label={school}
                onClick={() => {
                  onSelect(school)
                  onOpenChange(false)
                }}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
