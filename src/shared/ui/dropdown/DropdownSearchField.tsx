import { useState } from "react"

import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { cn } from "@/shared/lib/utils"

export function DropdownSearchField() {
  const [value, setValue] = useState("")

  return (
    <div
      className={cn(
        "flex h-11 w-[8.75rem] items-center gap-2 rounded-lg pr-3.5 pl-3 transition-colors",
        value
          ? "bg-teal-gray-50 border-teal-gray-400 border-[1.5px]"
          : "bg-teal-gray-50 hover:bg-teal-gray-400",
      )}
    >
      <SearchIcon className="text-teal-gray-400 size-5 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-0.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="검색"
          className="text-body-3-regular text-teal-gray-900 placeholder:text-teal-gray-400 min-w-0 flex-1 bg-transparent outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="검색어 지우기"
          >
            <CloseCircleIcon className="text-teal-gray-300 size-[1.125rem] shrink-0" />
          </button>
        )}
      </div>
    </div>
  )
}
