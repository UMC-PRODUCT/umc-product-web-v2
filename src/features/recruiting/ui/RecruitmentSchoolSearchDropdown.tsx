import { useEffect, useRef, useState } from "react"

import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { useClickOutside } from "@/shared/hooks/useClickOutside"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"

import type { Chapter } from "@/entities/organization/model/chapters"

interface RecruitmentSchoolSearchDropdownProps {
  open: boolean
  chapter?: Chapter
  // 실제 기수 조직 데이터(getChaptersWithSchools) 등 호출부가 이미 들고 있는 학교
  // 목록을 그대로 쓰고 싶을 때 전달한다. 없으면 하드코딩된 SCHOOLS_BY_BRANCH로 대체한다.
  schools?: readonly string[]
  onOpenChange: (open: boolean) => void
  onSelect: (school: string) => void
  className?: string
}

export function RecruitmentSchoolSearchDropdown({
  open,
  chapter,
  schools,
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

  // 호출부가 조회 중이라 빈 배열을 넘기는 경우가 있다. 그때까지 "검색 결과가
  // 없습니다" 를 보여주지 않도록 지부 목록으로 받쳐 준다.
  const schoolList =
    schools && schools.length > 0
      ? schools
      : chapter
        ? SCHOOLS_BY_BRANCH[chapter]
        : []
  const filteredSchools = schoolList.filter((school) =>
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
            <li
              key={school}
              role="option"
              aria-selected={false}
              className="w-full"
            >
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
