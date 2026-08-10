interface CurriculumSummaryProps {
  workbookCount: number
  missionCount: number
}

export function CurriculumSummary({
  workbookCount,
  missionCount,
}: CurriculumSummaryProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-body-1-medium text-teal-gray-500">
        워크북 {workbookCount}개
      </span>
      <div className="bg-teal-gray-300 size-[3px] rounded-full" />
      <span className="text-body-1-medium text-teal-gray-500">
        미션 {missionCount}개
      </span>
    </div>
  )
}
