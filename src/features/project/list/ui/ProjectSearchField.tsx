import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { cn } from "@/shared/lib/utils"

interface ProjectSearchFieldProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ProjectSearchField({
  value,
  onChange,
  className,
}: ProjectSearchFieldProps) {
  return (
    <div
      className={cn(
        "bg-teal-gray-100 flex h-11 w-full items-center justify-between rounded-xl px-4",
        className,
      )}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="프로젝트 명으로 검색하세요."
        aria-label="프로젝트 검색"
        className="text-body-2-medium text-teal-gray-900 placeholder:text-teal-gray-400 w-full bg-transparent outline-none"
      />
      <SearchIcon className="text-teal-gray-400 shrink-0" aria-hidden />
    </div>
  )
}
