import { SearchField } from "@/shared/ui/search-field/SearchField"

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
    <SearchField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="프로젝트 명으로 검색하세요."
      aria-label="프로젝트 검색"
      className={className}
      inputClassName="text-body-2-medium"
    />
  )
}
