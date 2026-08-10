import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { recruitingKeys } from "../api/queryKeys"
import { decideFinal, submitEvaluation } from "../api/recruitingApi"
import { toApiStage } from "../model/evaluatorMapper"

import type { FinalDecisionBody, SubmitEvaluationBody } from "../api/types"
import type { EvaluationStage } from "../model/evaluationStage"

function useErrorToast() {
  const addToast = useToastStore((state) => state.addToast)
  return (message: string) =>
    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
}

// 실패 안내는 호출부(MyStageEvaluationPanel)가 이미 띄운다. 여기서 또 띄우면
// 토스트가 두 번 뜬다.
export function useSubmitEvaluation(
  applicationId: string,
  roundId: string | undefined,
  stage: EvaluationStage,
) {
  const queryClient = useQueryClient()
  const apiStage = toApiStage(stage)

  return useMutation({
    mutationFn: (body: SubmitEvaluationBody) =>
      submitEvaluation(roundId!, applicationId, apiStage!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.evaluations(),
      })
      // 목록의 '내 평가 완료' 표시가 바뀐다. applications() 는 상세 키의
      // 접두사라 상세도 함께 무효화된다.
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.applications(),
      })
    },
  })
}

export function useFinalDecision(applicationId: string) {
  const queryClient = useQueryClient()
  const showError = useErrorToast()

  return useMutation({
    mutationFn: (body: FinalDecisionBody) => decideFinal(applicationId, body),
    onSuccess: () => {
      // 합불은 지원서 상태를 바꾼다. 상세와 목록이 모두 이 접두사 아래에 있다.
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.applications(),
      })
    },
    onError: () => {
      showError("최종 결과 저장에 실패했습니다. 잠시 후 다시 시도해주세요.")
    },
  })
}
