interface SectionHeaderProps {
  index: number
  title: string
  level?: 2 | 3 | 4
}

export function SectionHeader({ index, title, level = 3 }: SectionHeaderProps) {
  const Tag = `h${level}` as "h2" | "h3" | "h4"
  return (
    <Tag className="text-heading-6-semibold flex gap-2">
      <span className="text-teal-600" aria-hidden="true">
        {String(index).padStart(2, "0")}
      </span>
      <span className="text-teal-gray-900">{title}</span>
    </Tag>
  )
}
