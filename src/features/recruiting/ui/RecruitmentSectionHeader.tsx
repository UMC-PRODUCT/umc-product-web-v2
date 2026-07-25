interface RecruitmentSectionHeaderProps {
  index: number
  title: string
  level?: 2 | 3 | 4
  required?: boolean
}

export function RecruitmentSectionHeader({
  index,
  title,
  level = 3,
  required = false,
}: RecruitmentSectionHeaderProps) {
  const Tag = `h${level}` as "h2" | "h3" | "h4"
  return (
    <Tag className="text-heading-6-semibold flex gap-1.5">
      <span className="w-7 shrink-0 text-teal-600" aria-hidden="true">
        {String(index).padStart(2, "0")}
      </span>
      <span className="text-teal-gray-900 flex items-center">
        {title}
        {required && (
          <>
            <span className="text-error-500" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(필수)</span>
          </>
        )}
      </span>
    </Tag>
  )
}
