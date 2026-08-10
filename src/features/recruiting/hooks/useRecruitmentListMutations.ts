import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { recruitingKeys } from "../api/queryKeys"
import {
  cloneRecruitingRound,
  deleteRecruitingRound,
  updateRecruitingRound,
  updateRecruitingRoundStatus,
} from "../api/recruitingApi"

import type {
  CloneRecruitingRoundRequest,
  RecruitingRoundStatus,
  UpdateRecruitingRoundRequest,
} from "../api/types"

interface UpdateRoundStatusVariables {
  seasonId: string
  roundId: string
  status: RecruitingRoundStatus
}

interface CloneRoundVariables {
  seasonId: string
  roundId: string
  payload: CloneRecruitingRoundRequest
}

interface DeleteRoundVariables {
  seasonId: string
  roundId: string
}

interface UpdateRoundVariables {
  seasonId: string
  roundId: string
  payload: UpdateRecruitingRoundRequest
}

// 백엔드가 준 실제 실패 사유(예: 제목 중복)를 우선 보여주고, 없을 때만 뭉뚱그린
// 기본 문구로 대체한다. 호출부에서 별도로 catch해 또 토스트를 띄우지 않도록
// 에러 토스트는 이 훅들이 전담한다.
function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

// 비공개(DRAFT)/발행(OPEN) 처리에 쓰인다. 목록은 admin/rounds 재조회로 갱신되며,
// 낙관적 업데이트는 하지 않는다(다른 recruiting mutation 훅과 동일한 방식).
export function useUpdateRecruitingRoundStatus() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ seasonId, roundId, status }: UpdateRoundStatusVariables) =>
      updateRecruitingRoundStatus(seasonId, roundId, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitingKeys.rounds() })
    },
    onError: (error) => {
      addToast({
        message: extractApiErrorMessage(
          error,
          "상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}

// 모집 기간·트랙·2지망 정책·면접 설정을 변경한다(RECRUITING-ADMIN-014). OPEN 상태인
// 기존 차수의 "수정하기"에 쓰인다 — CLOSED는 UI에서 애초에 진입을 막는다.
export function useUpdateRecruitingRound() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ seasonId, roundId, payload }: UpdateRoundVariables) =>
      updateRecruitingRound(seasonId, roundId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitingKeys.rounds() })
    },
    onError: (error) => {
      addToast({
        message: extractApiErrorMessage(
          error,
          "저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}

// 원본 Round의 설정·지원 Form·활성 공통 질문을 대상 시즌의 새 DRAFT Round로
// 복제한다(RECRUITING-ADMIN-016).
export function useCloneRecruitingRound() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ seasonId, roundId, payload }: CloneRoundVariables) =>
      cloneRecruitingRound(seasonId, roundId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitingKeys.rounds() })
    },
    onError: (error) => {
      addToast({
        message: extractApiErrorMessage(
          error,
          "복제에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}

// 지원서·Form 응답이 없는 DRAFT Round만 삭제 가능(백엔드 검증). 복구 불가능한
// 삭제라 낙관적 업데이트나 실행취소는 지원하지 않는다.
export function useDeleteRecruitingRound() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ seasonId, roundId }: DeleteRoundVariables) =>
      deleteRecruitingRound(seasonId, roundId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitingKeys.rounds() })
    },
    onError: (error) => {
      addToast({
        message: extractApiErrorMessage(
          error,
          "삭제에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}
