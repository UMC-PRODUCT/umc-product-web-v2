import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { recruitingKeys } from "../api/queryKeys"
import {
  confirmInterviewSchedules,
  createInterviewSession,
  deleteInterviewSession,
  updateInterviewSession,
} from "../api/recruitingApi"

import type {
  ConfirmInterviewSchedulesRequest,
  RecruitingInterviewSessionRequest,
} from "../api/types"

function toErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

// 세션을 고치면 보드의 슬롯 계산도 달라지므로 면접 스케줄링 키를 통째로 무효화한다.
function useScheduleInvalidation() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({
      queryKey: recruitingKeys.interviewSchedule(),
    })
  }
}

interface SessionVariables {
  roundId: string
  payload: RecruitingInterviewSessionRequest
}

export function useCreateInterviewSession() {
  const invalidate = useScheduleInvalidation()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({ roundId, payload }: SessionVariables) =>
      createInterviewSession(roundId, payload),
    onSuccess: invalidate,
    onError: (error) => {
      addToast({
        message: toErrorMessage(error, "면접을 추가하지 못했습니다."),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}

export function useUpdateInterviewSession() {
  const invalidate = useScheduleInvalidation()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({
      roundId,
      sessionId,
      payload,
    }: SessionVariables & { sessionId: string }) =>
      updateInterviewSession(roundId, sessionId, payload),
    onSuccess: invalidate,
    onError: (error) => {
      addToast({
        message: toErrorMessage(error, "면접을 저장하지 못했습니다."),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}

export function useDeleteInterviewSession() {
  const invalidate = useScheduleInvalidation()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({
      roundId,
      sessionId,
    }: {
      roundId: string
      sessionId: string
    }) => deleteInterviewSession(roundId, sessionId),
    onSuccess: invalidate,
    onError: (error) => {
      addToast({
        message: toErrorMessage(error, "면접을 삭제하지 못했습니다."),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}

export function useConfirmInterviewSchedules() {
  const invalidate = useScheduleInvalidation()
  const addToast = useToastStore((state) => state.addToast)

  return useMutation({
    mutationFn: ({
      roundId,
      payload,
    }: {
      roundId: string
      payload: ConfirmInterviewSchedulesRequest
    }) => confirmInterviewSchedules(roundId, payload),
    onSuccess: () => {
      invalidate()
      addToast({
        message: "면접 일정을 확정했습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: (error) => {
      addToast({
        message: toErrorMessage(error, "면접 일정을 확정하지 못했습니다."),
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })
}
