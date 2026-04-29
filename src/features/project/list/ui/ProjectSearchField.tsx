import SearchIcon from "@/shared/assets/icon/search/SearchIcon"

export function ProjectSearchField() {
  return (
    <div className="bg-teal-gray-100 flex h-11 w-[28.5rem] items-center justify-between rounded-xl px-4">
      <input
        type="text"
        placeholder="프로젝트 명으로 검색하세요."
        aria-label="프로젝트 검색"
        className="text-body-2-medium text-teal-gray-900 placeholder:text-teal-gray-400 w-full bg-transparent outline-none"
      />
      <SearchIcon className="color-teal-gray-400 shrink-0" aria-hidden />
    </div>
  )
}
