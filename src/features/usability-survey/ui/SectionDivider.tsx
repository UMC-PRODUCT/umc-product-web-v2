interface SectionDividerProps {
  label?: string
}

export const SectionDivider = ({ label }: SectionDividerProps) => {
  return (
    <div className="flex w-full items-center gap-3.5">
      <span className="bg-teal-gray-300 h-px flex-1" />
      {label && (
        <span className="text-label-2-medium text-teal-gray-400 whitespace-nowrap">
          {label}
        </span>
      )}
      <span className="bg-teal-gray-300 h-px flex-1" />
    </div>
  )
}
