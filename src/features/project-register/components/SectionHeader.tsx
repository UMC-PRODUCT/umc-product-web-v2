interface SectionHeaderProps {
  index: number
  title: string
}

export function SectionHeader({ index, title }: SectionHeaderProps) {
  return (
    <div className="text-heading-6-semibold flex gap-2">
      <span className="text-teal-600">{String(index).padStart(2, "0")}</span>
      <span className="text-teal-gray-900">{title}</span>
    </div>
  )
}
