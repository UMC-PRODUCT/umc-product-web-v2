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
  ManagePermission,
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
  managePermission: ManagePermission,
) {
  const { isGranted: hasManagePermission, isResolved: isPermissionResolved } =
    managePermission
  const { data: me } = useMe()
  const apiStage = toApiStage(stage)
  // 평가 목록은 단계별 API 라 최종 단계에는 없지만, 평가자 명단은 차수 단위라
  // 최종 화면에서도 조회해야 한다. 하나로 묶으면 최종 화면에서 명단이 비어
  // 관리 권한을 판정하지 못해 합불 처리가 잠긴다.
  const evaluationsEnabled = roundId != null && apiStage != null

  // 평가자 명단은 모집 관리 권한이 있어야 조회할 수 있다. 권한이 없다고 이미
  // 알고 있으면 403 을 부르지 않는다. 명단은 총원(분모) 계산에만 쓴다.
  const evaluatorsQuery = useQuery({
    queryKey: recruitingKeys.evaluators(roundId ?? ""),
    queryFn: () => getRoundEvaluators(roundId!),
    enabled: roundId != null && hasManagePermission === true,
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
  // 명단은 관리 권한자만 조회한다. 권한 판정이 끝났고 권한자가 아니라면 기다릴
  // 것이 없다. 판정 자체가 아직 안 끝났으면 기다린다.
  const rosterSettled =
    (isPermissionResolved && hasManagePermission !== true) ||
    evaluatorsQuery.isSuccess ||
    evaluatorsQuery.isError

  const evaluationsQuery = useQuery({
    queryKey: recruitingKeys.stageEvaluations(
      roundId ?? "",
      applicationId,
      apiStage ?? "DOCUMENT",
    ),
    queryFn: () => getStageEvaluations(roundId!, applicationId, apiStage!),
    enabled: evaluationsEnabled,
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
  //  · 관리 권한이 있으면 명단을 직접 받아 확인한다.
  //  · 권한이 없거나 판정하지 못했다면, 그런데도 평가 목록을 받았다는 사실이
  //    서버가 평가자로 인정했다는 뜻이다(운영진 경로가 막혔으므로). 권한 조회
  //    장애로 평가자를 막지 않는다. 평가자가 이 화면의 주 사용자다.
  //  · 조회가 아직 끝나지 않았으면 단정하지 않는다.
  const evaluatorState: EvaluatorState = useMemo(() => {
    if (!me) return "unknown"
    if (hasManagePermission === true) {
      if (!rosterKnown) return "unknown"
      const myId = String(me.id)
      return roster.some((evaluator) => String(evaluator.memberId) === myId)
        ? "yes"
        : "no"
    }
    if (!isPermissionResolved) return "unknown"
    if (evaluationsQuery.isSuccess) return "yes"
    if (evaluationsQuery.isError) return "no"
    return "unknown"
  }, [
    me,
    hasManagePermission,
    isPermissionResolved,
    rosterKnown,
    roster,
    evaluationsQuery.isSuccess,
    evaluationsQuery.isError,
  ])

  const eligibility = resolveEvaluationEligibility(
    stage,
    status,
    evaluatorState,
  )

  const evaluation = useMemo(() => {
    if (!evaluationsEnabled || !me || !rosterSettled) return null
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
    evaluationsEnabled,
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
    hasManagePermission: hasManagePermission === true,
    canSubmit: eligibility.canSubmit,
    isLoading: evaluationsQuery.isLoading,
    isError: evaluationsQuery.isError,
  }
}
