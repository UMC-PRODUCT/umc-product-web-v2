import { useMemo } from "react"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { useAdminRecruitingRounds } from "../../hooks/useAdminRecruitingRounds"
import { useApplicationStatusSummary } from "../../hooks/useApplicationStatusSummary"
import { toInterviewScheduleRounds } from "../../model/interviewSchedule"
import { InterviewScheduleRoundCard } from "./InterviewScheduleRoundCard"

export function InterviewSchedulePage() {
  const {
    groups,
    isLoading: isRoundsLoading,
    isError: isRoundsError,
    isForbidden: isRoundsForbidden,
  } = useAdminRecruitingRounds()
  const { data: statusSummary } = useApplicationStatusSummary()

  const rounds = useMemo(
    () => toInterviewScheduleRounds(groups, statusSummary),
    [groups, statusSummary],
  )
  const bySchool = useMemo(() => {
    const grouped = new Map<string, typeof rounds>()
    for (const round of rounds) {
      const bucket = grouped.get(round.schoolName) ?? []
      bucket.push(round)
      grouped.set(round.schoolName, bucket)
    }
    return [...grouped.entries()]
  }, [rounds])

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "evaluation-management", label: "평가 관리" },
          { id: "interview-schedule", label: "면접 스케줄링" },
        ]}
        title="면접 스케줄링"
        description="서류 전형을 합격한 지원자들의 면접 일정을 정합니다."
        className="pl-3"
      />

      {isRoundsLoading ? (
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
          모집 정보를 불러오는 중입니다.
        </div>
      ) : isRoundsError || isRoundsForbidden ? (
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
          모집 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      ) : bySchool.length === 0 ? (
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
          면접을 진행할 모집이 없습니다.
        </div>
      ) : (
        bySchool.map(([schoolName, rounds]) => (
          <section key={schoolName} className="mt-8 flex flex-col">
            <h2 className="text-heading-5-semibold px-3 text-teal-700">
              {schoolName}
            </h2>
            {rounds.map((round) => (
              <InterviewScheduleRoundCard key={round.roundId} round={round} />
            ))}
          </section>
        ))
      )}
    </div>
  )
}
