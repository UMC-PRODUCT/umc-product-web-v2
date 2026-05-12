import SearchIcon from "@/shared/assets/icon/search/SearchIcon"

interface ProjectSearchFieldProps {
  value: string
  onChange: (value: string) => void
}

export function ProjectSearchField({
  value,
  onChange,
}: ProjectSearchFieldProps) {
  return (
    <div className="bg-teal-gray-100 flex h-11 w-[28.5rem] items-center justify-between rounded-xl px-4">
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
