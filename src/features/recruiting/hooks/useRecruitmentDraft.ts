import { useQuery } from "@tanstack/react-query"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import {
  getAdminRounds,
  getRecruitingApplicationForm,
} from "../api/recruitingApi"
import { mapRoundToDraftBasicInfo } from "../model/recruitmentDraftBasicInfo"

import type { RecruitingAdminFormStructureResponse } from "../api/types"
import type { RecruitmentDraftBasicInfo } from "../model/recruitmentDraftBasicInfo"

export interface RecruitmentDraft extends RecruitmentDraftBasicInfo {
  gisuGeneration: number | null
  formStructure: RecruitingAdminFormStructureResponse
}

export type RecruitmentDraftErrorReason = "NOT_FOUND" | "NOT_DRAFT"

export class RecruitmentDraftError extends Error {
  readonly reason: RecruitmentDraftErrorReason

  constructor(reason: RecruitmentDraftErrorReason) {
    super(
      reason === "NOT_DRAFT"
        ? "임시 저장 상태가 아닌 모집입니다."
        : "임시 저장한 모집을 찾을 수 없습니다.",
    )
    this.name = "RecruitmentDraftError"
    this.reason = reason
  }
}

// 임시저장한 모집을 생성 마법사에 되돌린다. 차수 자체(기간·파트·공지)는 관리자
// 차수 목록에서, 문항은 Form 구조에서 각각 받아 온다. 공개 목록은 DRAFT 를
// 내려주지 않아 관리자 목록을 써야 한다.
export function useRecruitmentDraft(
  draftRoundId?: string,
  draftSeasonId?: string,
) {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null
  const generation =
    gisuQuery.data?.generation != null
      ? Number(gisuQuery.data.generation)
      : null

  const draftQuery = useQuery({
    queryKey: recruitingKeys.adminDraftRound(
      gisuId ?? "",
      draftRoundId ?? "",
      draftSeasonId,
    ),
    queryFn: async (): Promise<RecruitmentDraft> => {
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

      // 이미 공개된 차수를 이 화면으로 끌고 오면 생성 흐름이 기존 공고를 덮어쓴다.
      if (!group || !round) {
        throw new RecruitmentDraftError("NOT_FOUND")
      }
      if (round.status !== "DRAFT") {
        throw new RecruitmentDraftError("NOT_DRAFT")
      }

      const formStructure = await getRecruitingApplicationForm(
        group.seasonId,
        round.roundId,
      )

      return {
        ...mapRoundToDraftBasicInfo(group, round, generation),
        gisuGeneration: generation,
        formStructure,
      }
    },
    enabled: gisuId != null && draftRoundId != null,
    retry: false,
  })

  return {
    draft: draftQuery.data ?? null,
    isLoading: gisuQuery.isLoading || draftQuery.isLoading,
    isError: gisuQuery.isError || draftQuery.isError,
    error: draftQuery.error ?? gisuQuery.error ?? null,
  }
}
