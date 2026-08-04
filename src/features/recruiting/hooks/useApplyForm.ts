import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import { getAllPublicRounds, getFormStructure } from "../api/recruitingApi"
import { toApplicationSections } from "../model/applicationDetailMapper"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingTrack,
} from "../api/types"
import type { ApplyFormConfig } from "../model/applyForm"

interface RoundLocation {
  group: RecruitingRoundGroup
  round: RecruitingRound
}

function locateRound(
  groups: RecruitingRoundGroup[],
  roundId: string,
): RoundLocation | null {
  for (const group of groups) {
    const round = group.rounds.find(
      (candidate) => String(candidate.roundId) === roundId,
    )
    if (round) return { group, round }
  }
  return null
}

export function useApplyForm(
  roundId: string,
  firstChoice: RecruitingTrack | undefined,
  secondChoice: RecruitingTrack | undefined,
) {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  const roundQuery = useQuery({
    queryKey: recruitingKeys.round(gisuId ?? "", roundId),
    queryFn: () => getAllPublicRounds(gisuId!, [roundId]),
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
  })

  const location = useMemo(
    () => locateRound(roundQuery.data ?? [], roundId),
    [roundQuery.data, roundId],
  )
  const applicationFormId = location?.round.applicationFormId ?? null

  // firstChoice 는 required query 다. 지망을 고르기 전에는 구조를 받을 수 없어
  // 화면이 지망 선택을 먼저 받는다.
  const structureQuery = useQuery({
    queryKey: recruitingKeys.formStructure(
      applicationFormId ?? "",
      firstChoice ?? "",
      secondChoice ?? null,
    ),
    queryFn: () =>
      getFormStructure(applicationFormId!, {
        firstChoice: firstChoice!,
        secondChoice,
      }),
    enabled: applicationFormId != null && firstChoice != null,
    staleTime: 5 * 60 * 1000,
  })

  const config = useMemo((): ApplyFormConfig | null => {
    const structure = structureQuery.data
    if (!structure || !location || !firstChoice) return null

    return {
      recruitment: {
        recruitmentId: String(location.round.roundId),
        title: location.round.title,
        school: location.group.schoolName,
        notice: location.round.announcement ?? "",
        logoUrl: null,
      },
      // 답변 없이 부르면 빈 폼 구조가 나온다. 문항 정렬·선택지 변환·타입 매핑이
      // 평가 상세와 같아야 하므로 같은 매퍼를 쓴다.
      sections: toApplicationSections(structure, [], {
        firstChoice,
        secondChoice: secondChoice ?? null,
      }),
      // 지망은 폼 문항이 아니라 지원서 필드다. 서버가 지망에 해당하는 섹션만
      // 내려주므로 폼 안에서 섹션을 여닫을 일이 없다.
      partQuestionIds: [],
      partOptionSectionMap: {},
    }
  }, [structureQuery.data, location, firstChoice, secondChoice])

  return {
    round: location?.round ?? null,
    config,
    isLoading: roundQuery.isLoading || structureQuery.isLoading,
    isStructureFetching: structureQuery.isFetching,
    isError: gisuQuery.isError || roundQuery.isError || structureQuery.isError,
    // 조회는 됐는데 그 차수가 없는 경우. 잘못된 링크로 들어온 것이라
    // "잠시 후 다시 시도"로 안내하면 아무리 기다려도 달라지지 않는다.
    isNotFound: roundQuery.isSuccess && location == null,
  }
}
