import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useMemo } from "react"

import { getMemberProfile } from "@/entities/member/api/member"
import { useMe } from "@/entities/member/hooks/useMe"

import { recruitingKeys } from "../api/queryKeys"
import { getRoundEvaluators, getStageEvaluations } from "../api/recruitingApi"
import { resolveEvaluationEligibility } from "../model/evaluationRules"
import {
  toApiStage,
  toOperatorEvaluations,
  toStageEvaluationDetail,
} from "../model/evaluatorMapper"

import type { RecruitingApplicationStatus } from "../api/types"
import type {
  EvaluationBlockReason,
  EvaluatorState,
} from "../model/evaluationRules"
import type { EvaluationStage } from "../model/evaluationStage"

const LOCK_REASON: Record<EvaluationBlockReason, string | undefined> = {
  stageHasNoEvaluation: undefined,
  permissionUnknown:
    "권한 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.",
  notEvaluator: "평가자로 지정된 운영진만 평가를 등록할 수 있습니다.",
  stageClosed: "판정이 끝난 전형이라 평가를 수정할 수 없습니다.",
}

export function useStageEvaluations(
  applicationId: string,
  roundId: string | undefined,
  stage: EvaluationStage,
  status: RecruitingApplicationStatus | undefined,
) {
  const { data: me } = useMe()
  const apiStage = toApiStage(stage)
  const enabled = roundId != null && apiStage != null

  // 평가자 명단은 모집 관리 권한이 있어야 조회할 수 있다. 평가자 whitelist 에만
  // 올라간 운영진은 403 을 받으므로, 실패해도 평가 목록은 그대로 보여준다.
  // 403 은 권한이 없다는 확정 답이라 재시도하지 않고, 나머지 오류만 재시도해
  // 일시적 실패가 권한 없음으로 오인되지 않게 한다.
  const evaluatorsQuery = useQuery({
    queryKey: recruitingKeys.evaluators(roundId ?? ""),
    queryFn: () => getRoundEvaluators(roundId!),
    enabled,
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 403) &&
      failureCount < 2,
    staleTime: 5 * 60 * 1000,
  })
  const roster = useMemo(
    () => evaluatorsQuery.data ?? [],
    [evaluatorsQuery.data],
  )
  const rosterKnown = evaluatorsQuery.isSuccess
  // 403 은 "관리 권한 없음"이라는 확정 답이고, 그 외 실패는 아무것도 알려주지
  // 않는다. 둘을 한 값으로 접으면 장애를 권한 없음으로 오인한다.
  const rosterDenied =
    evaluatorsQuery.isError &&
    isAxiosError(evaluatorsQuery.error) &&
    evaluatorsQuery.error.response?.status === 403
  const rosterUnavailable = evaluatorsQuery.isError && !rosterDenied
  // 명단 조회가 끝나기 전에는 관리 권한 유무를 알 수 없다. 그 사이에 비운영진
  // 화면을 보였다가 뒤바뀌지 않도록 결과가 확정된 뒤에 조립한다.
  const rosterSettled = evaluatorsQuery.isSuccess || evaluatorsQuery.isError

  const evaluationsQuery = useQuery({
    queryKey: recruitingKeys.stageEvaluations(
      roundId ?? "",
      applicationId,
      apiStage ?? "DOCUMENT",
    ),
    queryFn: () => getStageEvaluations(roundId!, applicationId, apiStage!),
    enabled,
    staleTime: 60 * 1000,
  })

  const memberIds = useMemo(() => {
    const ids = [
      ...roster.map((evaluator) => String(evaluator.memberId)),
      ...(evaluationsQuery.data ?? []).map((evaluation) =>
        String(evaluation.evaluatorMemberId),
      ),
    ]
    return [...new Set(ids)].sort()
  }, [roster, evaluationsQuery.data])

  const profilesQuery = useQuery({
    queryKey: recruitingKeys.evaluatorProfiles(memberIds),
    queryFn: async () => {
      // 탈퇴·권한 문제로 한 명이 실패해도 나머지 이름은 살린다.
      const settled = await Promise.allSettled(
        memberIds.map((memberId) => getMemberProfile(memberId)),
      )
      return new Map(
        settled
          .filter((result) => result.status === "fulfilled")
          .map((result) => [
            String(result.value.id),
            result.value.name || result.value.nickname,
          ]),
      )
    },
    enabled: memberIds.length > 0,
    staleTime: 10 * 60 * 1000,
  })

  // 평가 등록은 평가자 명단에 있는 사람만 할 수 있다.
  //  · 명단을 받았으면 직접 확인한다.
  //  · 403 이면 관리 권한이 없다는 뜻이고, 그런데도 평가 목록을 받았다면
  //    서버가 평가자로 인정한 것이다(운영진 경로가 막혔으므로).
  //  · 그 밖의 실패는 아무것도 증명하지 못한다. 운영진도 이 경로로 떨어질 수
  //    있어 평가자로 단정하면 제출 단계에서 거부된다.
  const evaluatorState: EvaluatorState = useMemo(() => {
    if (!me) return "unknown"
    if (rosterKnown) {
      const myId = String(me.id)
      return roster.some((evaluator) => String(evaluator.memberId) === myId)
        ? "yes"
        : "no"
    }
    if (rosterDenied) return evaluationsQuery.isSuccess ? "yes" : "no"
    return "unknown"
  }, [me, rosterKnown, rosterDenied, roster, evaluationsQuery.isSuccess])

  const eligibility = resolveEvaluationEligibility(
    stage,
    status,
    evaluatorState,
  )

  const evaluation = useMemo(() => {
    if (!enabled || !me || !rosterSettled) return null
    const evaluations = evaluationsQuery.data
    if (!evaluations) return null

    return toStageEvaluationDetail(
      toOperatorEvaluations(
        roster,
        evaluations,
        profilesQuery.data ?? new Map(),
        stage,
      ),
      stage,
      String(me.id),
      !eligibility.canSubmit,
      LOCK_REASON[eligibility.reason ?? "stageHasNoEvaluation"],
    )
  }, [
    enabled,
    me,
    rosterSettled,
    roster,
    evaluationsQuery.data,
    profilesQuery.data,
    stage,
    eligibility.canSubmit,
    eligibility.reason,
  ])

  return {
    evaluation,
    // 명단을 못 받으면 아직 평가하지 않은 운영진을 알 수 없어 총원을 셀 수 없다.
    rosterKnown,
    rosterUnavailable,
    canSubmit: eligibility.canSubmit,
    isLoading: evaluationsQuery.isLoading,
    isError: evaluationsQuery.isError,
  }
}
