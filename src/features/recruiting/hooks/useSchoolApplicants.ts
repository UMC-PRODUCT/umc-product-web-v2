import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { recruitingKeys } from "../api/queryKeys"
import { getAllRoundApplications } from "../api/recruitingApi"
import { getStageStatuses, toApplicantRow } from "../model/applicantMapper"

import type { RecruitingRoundGroup } from "../api/types"
import type { ApplicantRow } from "../model/applicantListTypes"
import type { EvaluationStage } from "../model/evaluationStage"

export function useSchoolApplicants(
  group: RecruitingRoundGroup,
  stage: EvaluationStage,
) {
  const roundIds = group.rounds.map((round) => String(round.roundId))

  return useQuery<ApplicantRow[]>({
    queryKey: recruitingKeys.schoolApplications(roundIds, stage),
    queryFn: async () => {
      const statuses = getStageStatuses(stage)
      const perRound = await Promise.all(
        group.rounds.map(async (round) => {
          const summaries = await getAllRoundApplications(
            String(round.roundId),
            { statuses },
          )
          return summaries
            .map((summary) => toApplicantRow(summary, group, round))
            .filter((row): row is ApplicantRow => row != null)
        }),
      )
      return perRound.flat()
    },
    enabled: roundIds.length > 0,
    // 403 은 권한이 없다는 확정 답이라 다시 물어봐도 달라지지 않는다.
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 403) &&
      failureCount < 2,
    staleTime: 60 * 1000,
  })
}
