import { useQuery } from "@tanstack/react-query"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAdminFormStructure, getAdminRounds } from "../api/recruitingApi"
import { hydrateRecruitingDraft } from "../model/recruitingDraftHydration"

export function useRecruitingDraft(
  draftRoundId?: string,
  draftSeasonId?: string,
) {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const draftQuery = useQuery({
    queryKey: recruitingKeys.adminDraft(
      gisuId ?? "",
      draftRoundId ?? "",
      draftSeasonId,
    ),
    queryFn: async () => {
      const groups = await getAdminRounds({
        gisuId: gisuId!,
        seasonId: draftSeasonId,
      })
      const group = groups.find((item) =>
        item.rounds.some((round) => String(round.roundId) === draftRoundId),
      )
      const round = group?.rounds.find(
        (item) => String(item.roundId) === draftRoundId,
      )

      if (!group || !round || round.status !== "DRAFT") {
        throw new Error("임시 저장한 모집을 찾을 수 없습니다.")
      }

      const form = await getAdminFormStructure(group.seasonId, round.roundId)
      return hydrateRecruitingDraft(
        group,
        round,
        form,
        gisuQuery.data?.generation,
      )
    },
    enabled: gisuId != null && draftRoundId != null,
    retry: false,
  })

  return {
    ...draftQuery,
    isLoading: gisuQuery.isLoading || draftQuery.isLoading,
    isError: gisuQuery.isError || draftQuery.isError,
  }
}
