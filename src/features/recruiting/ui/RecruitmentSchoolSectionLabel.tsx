import { cn } from "@/shared/lib/utils"

interface RecruitmentSchoolSectionLabelProps {
  schoolName: string
  className?: string
}

export function RecruitmentSchoolSectionLabel({
  schoolName,
  className,
}: RecruitmentSchoolSectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between self-stretch rounded-t-lg border-t border-r border-l border-teal-300 bg-teal-100 py-2 pr-5 pl-7.5",
        className,
      )}
    >
      <span className="text-heading-7-semibold text-teal-600">
        {schoolName}
      </span>
    </div>
  )
}
