import { isAxiosError } from "axios"
import { useEffect } from "react"

import { cn } from "@/shared/lib/utils"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { useSchoolApplicants } from "../hooks/useSchoolApplicants"
import { applyApplicantFilters } from "../model/applicantListTypes"
import { ApplicantTableCard } from "./ApplicantTableCard"

import type { RecruitingRoundGroup } from "../api/types"
import type { ApplicantListFilters } from "../model/applicantListTypes"
import type { EvaluationStage } from "../model/evaluationStage"
import type { ApplicantColumnOptions } from "./applicantTableColumns"

interface SchoolApplicantSectionProps {
  group: RecruitingRoundGroup
  stage: EvaluationStage
  filters: ApplicantListFilters
  baseTime: string
  columns?: ApplicantColumnOptions
  className?: string
}

export function SchoolApplicantSection({
  group,
  stage,
  filters,
  baseTime,
  columns,
  className,
}: SchoolApplicantSectionProps) {
  const addToast = useToastStore((state) => state.addToast)
  const { data, isLoading, isError, error } = useSchoolApplicants(group, stage)

  // 조회 권한이 없는 학교는 장애가 아니라 정상 상황이다. 카드도 토스트도 내지
  // 않는다. 그러지 않으면 권한 밖 학교 수만큼 오류가 쏟아진다.
  const isForbidden =
    isError && isAxiosError(error) && error.response?.status === 403

  useEffect(() => {
    if (!isError || isForbidden) return
    addToast({
      message: `${group.schoolName} 지원자를 불러오지 못했습니다.`,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }, [isError, isForbidden, group.schoolName, addToast])

  if (isForbidden) {
    return null
  }

  if (isLoading) {
    return <ApplicantSectionSkeleton className={className} />
  }

  if (isError) {
    return (
      <div
        className={cn(
          "border-teal-gray-100 text-body-2-regular text-teal-gray-500 flex min-h-40 items-center justify-center rounded-[12px] border bg-white",
          className,
        )}
      >
        지원자를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    )
  }

  const rows = data ?? []

  return (
    <ApplicantTableCard
      visibleRows={applyApplicantFilters(rows, filters, stage)}
      allStageRows={rows}
      stage={stage}
      baseTime={baseTime}
      titleBase={group.schoolName}
      columns={columns}
      className={className}
    />
  )
}

function ApplicantSectionSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-teal-gray-100 animate-pulse rounded-[12px] border bg-white p-7",
        className,
      )}
    >
      <div className="bg-teal-gray-100 h-6 w-48 rounded" />
      <div className="bg-teal-gray-100 mt-3 h-4 w-64 rounded" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="bg-teal-gray-100 h-11 w-full rounded" />
        ))}
      </div>
    </div>
  )
}
