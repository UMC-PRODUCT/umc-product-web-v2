import { cn } from "@/shared/lib/utils"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"

import { ApplicantRow } from "./ApplicantRow"

import type { ApplicantDetail, Role, StatusValue } from "../../model/types"

interface ApplicantRoleSectionProps {
  role: Role
  applicants: ApplicantDetail[]
  totalCount: number
  selectedApplicantId: string | null
  onApplicantClick: (id: string) => void
  onStatusChange?: (applicantId: string, status: StatusValue) => void
  className?: string
}

export function ApplicantRoleSection({
  role,
  applicants,
  totalCount,
  selectedApplicantId,
  onApplicantClick,
  onStatusChange,
  className,
}: ApplicantRoleSectionProps) {
  const roundCounts = applicants.reduce<Record<number, number>>((acc, a) => {
    acc[a.round] = (acc[a.round] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className={cn("flex flex-col", className)}>
      {/* 섹션 헤더 */}
      <div className="flex h-6.5 items-center justify-between pr-0.5 pl-2.5">
        <div className="flex items-center gap-2.25">
          <RoleTagChip role={role} />
          <span className="text-body-1-medium text-teal-gray-400 flex items-center gap-0.5">
            <span className="min-w-2.5 text-center">{applicants.length}</span>
            <span>/</span>
            <span className="min-w-2.5 text-center">{totalCount}</span>
          </span>
        </div>

        {/* 배지 */}
        <div className="bg-teal-gray-50 flex items-center gap-2.5 rounded-lg px-2.5 py-1 text-[12px] leading-normal whitespace-nowrap">
          {Object.entries(roundCounts)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([round, count]) => (
              <span key={round} className="flex items-center gap-1">
                <span className="text-teal-gray-900">{round}차</span>
                <span className="text-caption-2-medium text-teal-600">
                  {count}명
                </span>
              </span>
            ))}
        </div>
      </div>

      {/* 행 */}
      <div className="mt-2">
        {applicants.map((applicant) => (
          <ApplicantRow
            key={applicant.id}
            name={applicant.name}
            university={applicant.university}
            round={applicant.round}
            status={applicant.status}
            processedAt={applicant.processedAt}
            appliedAt={applicant.appliedAt}
            isSelected={selectedApplicantId === applicant.id}
            onClick={() => onApplicantClick(applicant.id)}
            onStatusChange={(s) => onStatusChange?.(applicant.id, s)}
          />
        ))}
      </div>
    </div>
  )
}
