import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

import { searchMembers } from "@/features/challenger/api/member"
import { PART_LABEL } from "@/features/challenger/model/enums"
import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { cn } from "@/shared/lib/utils"
import { InputBox } from "@/shared/ui/input/InputBox"

import type { SearchMemberItem } from "@/features/challenger/model/types"

interface MemberSearchPanelProps {
  selectedMember: SearchMemberItem | null
  onSelectMember: (member: SearchMemberItem) => void
}

function useDebounced<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(handle)
  }, [value, delayMs])
  return debounced
}

export function MemberSearchPanel({
  selectedMember,
  onSelectMember,
}: MemberSearchPanelProps) {
  const [keyword, setKeyword] = useState("")
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedKeyword = useDebounced(keyword.trim(), 300)
  const enabled = debouncedKeyword.length >= 1

  const { data, isFetching, isError } = useQuery({
    queryKey: ["challenger", "member-search", debouncedKeyword],
    queryFn: () =>
      searchMembers({ keyword: debouncedKeyword, page: 0, size: 10 }),
    enabled,
    placeholderData: keepPreviousData,
  })

  const items = data?.page.content ?? []
  const showDropdown = focused && enabled

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    window.addEventListener("mousedown", onMouseDown)
    return () => window.removeEventListener("mousedown", onMouseDown)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-115">
      <InputBox
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onClear={() => setKeyword("")}
        onFocus={() => setFocused(true)}
        type="clear"
        state={selectedMember ? "success" : "default"}
        placeholder="이름, 닉네임, 이메일로 검색"
        rightAdornment={
          keyword.length === 0 ? (
            <span className="text-teal-gray-400">
              <SearchIcon width={20} height={20} />
            </span>
          ) : undefined
        }
        className="w-full max-w-none"
      />

      {showDropdown && (
        <ul className="border-teal-gray-50 shadow-drop-neutral-1 scrollbar-hide absolute top-[calc(100%+0.5rem)] left-0 z-30 flex max-h-72 w-full flex-col overflow-y-auto rounded-[12px] border bg-white p-1">
          {isFetching && items.length === 0 && (
            <li className="text-body-2-medium text-teal-gray-400 px-4 py-3">
              검색 중...
            </li>
          )}
          {!isFetching && isError && (
            <li className="text-body-2-medium text-error-500 px-4 py-3">
              회원을 불러오지 못했습니다.
            </li>
          )}
          {!isFetching && !isError && items.length === 0 && (
            <li className="text-body-2-medium text-teal-gray-400 px-4 py-3">
              일치하는 회원이 없습니다.
            </li>
          )}
          {items.map((item, index) => {
            const isSelected = selectedMember?.memberId === item.memberId
            // 한 회원이 여러 챌린저 기록을 갖는 경우 memberId 가 중복될 수 있어
            // challengerId · gisuId · index 를 조합한 키 사용 (가이드 A-1 응답 특성).
            const itemKey = `${item.memberId}-${item.challengerId || "no-ch"}-${item.gisuId || "no-g"}-${index}`
            return (
              <li key={itemKey}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelectMember(item)
                    setKeyword(`${item.nickname}/${item.name}`)
                    setFocused(false)
                  }}
                  className={cn(
                    "hover:bg-teal-gray-50 hover:shadow-inner-neutral-3 flex w-full flex-col items-start gap-0.5 rounded-[8px] px-4 py-2.5 text-left transition-colors",
                    isSelected && "bg-teal-50",
                  )}
                >
                  <div className="text-body-2-medium text-teal-gray-900 flex items-center gap-2">
                    <span className="font-semibold">{item.nickname}</span>
                    <span className="text-teal-gray-500">/</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="text-caption-2-medium text-teal-gray-500 flex flex-wrap items-center gap-1.5">
                    <span>{item.schoolName}</span>
                    {item.gisu && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{item.gisu}기</span>
                      </>
                    )}
                    {item.part && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{PART_LABEL[item.part]}</span>
                      </>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
