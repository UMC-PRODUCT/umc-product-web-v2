import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

import { recruitingKeys } from "../api/queryKeys"
import {
  findPublicRound,
  getApplicationDetail,
  getFormStructure,
} from "../api/recruitingApi"
import {
  toApplicationDetail,
  toApplicationSections,
} from "../model/applicationDetailMapper"

import type { RecruitingPublicRoundGroup, RecruitingRound } from "../api/types"

interface RoundLocation {
  group: RecruitingPublicRoundGroup
  round: RecruitingRound
}

function locateRound(
  groups: RecruitingPublicRoundGroup[],
  roundId: string | undefined,
): RoundLocation | null {
  if (!roundId) return null
  for (const group of groups) {
    const round = group.rounds.find(
      (candidate) => String(candidate.roundId) === roundId,
    )
    if (round) return { group, round }
  }
  return null
}

export function useApplicationDetail(
  applicationId: string,
  roundId: string | undefined,
) {
  const gisuQuery = useActiveGisu()
  const gisuId =
    gisuQuery.data?.gisuId != null ? String(gisuQuery.data.gisuId) : null

  // 차수의 applicationFormId 와 지부·학교명이 필요하다. 관리자 목록은 학교
  // 회장단 이상만 볼 수 있어, 평가자로만 등록된 운영진도 쓸 수 있는 공개 목록에서
  // 해당 차수 하나만 가져온다.
  const roundQuery = useQuery({
    queryKey: recruitingKeys.publicRound(gisuId ?? "", roundId ?? ""),
    queryFn: () => findPublicRound(gisuId!, roundId!),
    enabled: gisuId != null && roundId != null,
    staleTime: 5 * 60 * 1000,
  })

  const location = useMemo(
    () => locateRound(roundQuery.data ?? [], roundId),
    [roundQuery.data, roundId],
  )

  const detailQuery = useQuery({
    queryKey: recruitingKeys.applicationDetail(roundId ?? "", applicationId),
    queryFn: () => getApplicationDetail(roundId!, applicationId),
    enabled: roundId != null,
    staleTime: 60 * 1000,
  })

  const application = detailQuery.data?.application
  const applicationFormId = location?.round.applicationFormId ?? null

  const structureQuery = useQuery({
    queryKey: recruitingKeys.formStructure(
      applicationFormId ?? "",
      application?.firstChoice ?? "",
      application?.secondChoice ?? null,
    ),
    queryFn: () =>
      getFormStructure(applicationFormId!, {
        firstChoice: application!.firstChoice,
        secondChoice: application?.secondChoice ?? undefined,
      }),
    enabled: applicationFormId != null && application != null,
    staleTime: 5 * 60 * 1000,
  })

  const detail = useMemo(() => {
    const answers = detailQuery.data?.answers
    const structure = structureQuery.data
    if (!application || !answers || !structure || !location) return null

    return toApplicationDetail(
      application,
      toApplicationSections(structure, answers, application),
      location.group,
      location.round,
    )
  }, [application, detailQuery.data?.answers, structureQuery.data, location])

  const isLoading =
    gisuQuery.isLoading ||
    roundQuery.isLoading ||
    detailQuery.isLoading ||
    structureQuery.isLoading

  // roundId 가 없거나 그 차수를 찾지 못하면 문항 구조를 조회할 수 없다.
  // 조회가 끝났는데도 조립할 수 없는 상태는 에러로 다룬다.
  const unresolvable =
    !isLoading &&
    (roundId == null ||
      (roundQuery.isSuccess && location == null) ||
      (location != null && applicationFormId == null))

  return {
    detail,
    round: location?.round ?? null,
    isError:
      gisuQuery.isError ||
      roundQuery.isError ||
      detailQuery.isError ||
      structureQuery.isError ||
      unresolvable,
  }
}
