import { useProjectApplications } from "../hooks/useApplications"
import { toApplicantDetail } from "../model/mappers"
import { ApplicantDetailRow } from "./ApplicantDetailRow"

interface LazyApplicantRowsProps {
  projectId: string
  onApplicantClick?: (applicationId: string) => void
}

export function LazyApplicantRows({
  projectId,
  onApplicantClick,
}: LazyApplicantRowsProps) {
  const query = useProjectApplications(Number(projectId))

  if (query.isLoading) {
    return (
      <div className="border-teal-gray-150 flex h-17 items-center justify-center">
        <p className="text-body-2-medium text-teal-gray-400">
          지원자를 불러오는 중...
        </p>
      </div>
    )
  }

  const applicants = (query.data ?? []).map(toApplicantDetail)

  if (applicants.length === 0) {
    return (
      <div className="border-teal-gray-150 flex h-17 items-center justify-center">
        <p className="text-body-2-medium text-teal-gray-400">
          아직 지원자가 없습니다
        </p>
      </div>
    )
  }

  return (
    <div className="border-teal-gray-150 py-1">
      {applicants.map((applicant) => (
        <ApplicantDetailRow
          key={applicant.id}
          round={applicant.round}
          role={applicant.role}
          name={applicant.name}
          university={applicant.university}
          status={applicant.status}
          processedAt={applicant.processedAt}
          appliedAt={applicant.appliedAt}
          onChallengerClick={
            onApplicantClick ? () => onApplicantClick(applicant.id) : undefined
          }
        />
      ))}
    </div>
  )
}
