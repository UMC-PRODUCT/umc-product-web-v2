import { cn } from "@/shared/lib/utils"

import { RecruitmentSchoolSectionLabel } from "./RecruitmentSchoolSectionLabel"

import type { ReactNode } from "react"

interface RecruitmentSchoolSectionProps {
  schoolName: string
  children: ReactNode
  className?: string
}

export function RecruitmentSchoolSection({
  schoolName,
  children,
  className,
}: RecruitmentSchoolSectionProps) {
  return (
    <div className={cn("flex w-full flex-col items-start", className)}>
      <RecruitmentSchoolSectionLabel schoolName={schoolName} />
      <div className="bg-teal-gray-150 flex w-full flex-col items-start overflow-hidden rounded-b-lg border-r border-b border-l border-teal-200 p-px [&>*:last-child]:rounded-b-[7px]">
        {children}
      </div>
    </div>
  )
}
