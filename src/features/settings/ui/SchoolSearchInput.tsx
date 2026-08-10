import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { cn } from "@/shared/lib/utils"

import type { ComponentPropsWithoutRef } from "react"

export interface SchoolSearchInputProps extends ComponentPropsWithoutRef<"input"> {
  className?: string
  onSearch?: () => void
}

export function SchoolSearchInput({
  className,
  onSearch,
  ...props
}: SchoolSearchInputProps) {
  return (
    <div className={cn("relative h-fit w-fit", className)}>
      <input
        type="text"
        className="bg-teal-gray-100 shadow-inner-neutral-3 text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 h-11 w-79.5 rounded-[12px] py-[11.5px] pr-12 pl-4 outline-none"
        placeholder="학교 명으로 검색하세요"
        {...props}
      />

      <button
        type="button"
        onClick={onSearch}
        className="absolute top-2.5 right-4 bottom-2.5 h-fit w-fit"
      >
        <SearchIcon className="text-teal-gray-400 h-6 w-6" />
      </button>
    </div>
  )
}
