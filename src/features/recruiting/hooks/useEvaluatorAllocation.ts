import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { recruitingKeys } from "../api/queryKeys"
import {
  addRoundEvaluator,
  getRoundEvaluators,
  removeRoundEvaluator,
} from "../api/recruitingApi"

import type { Staff } from "../model/evaluatorAllocation"

interface SaveEvaluatorAllocationParams {
  roundId: string
  assignedEvaluators: Staff[]
}

export function useRoundEvaluators(roundId: string | null) {
  return useQuery({
    queryKey: recruitingKeys.evaluators(roundId ?? ""),
    queryFn: () => getRoundEvaluators(roundId!),
    enabled: Boolean(roundId),
  })
}

export function useSaveEvaluatorAllocation() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: async ({
      roundId,
      assignedEvaluators,
    }: SaveEvaluatorAllocationParams) => {
      const currentEvaluators = await getRoundEvaluators(roundId)
      const currentMemberIds = new Set(
        currentEvaluators.map((item) => String(item.memberId)),
      )
      const targetMemberIds = new Set(
        assignedEvaluators.map((item) => String(item.id)),
      )

      const toAdd = assignedEvaluators.filter(
        (staff) => !currentMemberIds.has(String(staff.id)),
      )
      const toRemove = currentEvaluators.filter(
        (item) => !targetMemberIds.has(String(item.memberId)),
      )

      await Promise.all([
        ...toAdd.map((staff) => addRoundEvaluator(roundId, staff.id)),
        ...toRemove.map((item) =>
          removeRoundEvaluator(roundId, String(item.memberId)),
        ),
      ])
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.evaluators(variables.roundId),
      })
      addToast({
        message: "평가 담당자 배정이 저장되었습니다.",
        color: "teal",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: () => {
      addToast({
        message:
          "평가 담당자 배정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}
