import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useMemo } from "react"

import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { recruitingKeys } from "../api/queryKeys"
import {
  getRecruitingSeasonConfiguration,
  updateRecruitingSeasonQuotas,
} from "../api/recruitingApi"

import type {
  RecruitingSeasonConfigurationResponse,
  ReplaceRecruitingSeasonTrackQuotasRequest,
} from "../api/types"

interface UpdateSeasonQuotaVariables {
  seasonId: string
  payload: ReplaceRecruitingSeasonTrackQuotasRequest
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useRecruitingSeasonQuotas(seasonIds: string[]) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const uniqueSeasonIds = useMemo(
    () => [...new Set(seasonIds.filter(Boolean))].sort(),
    [seasonIds],
  )

  const { seasonConfigsMap, isLoading, isError } = useQueries({
    queries: uniqueSeasonIds.map((seasonId) => ({
      queryKey: recruitingKeys.seasonConfiguration(seasonId),
      queryFn: () => getRecruitingSeasonConfiguration(seasonId),
      enabled: Boolean(seasonId),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => {
      const map = new Map<string, RecruitingSeasonConfigurationResponse>()
      results.forEach((query, index) => {
        const seasonId = uniqueSeasonIds[index]
        if (seasonId && query.data) {
          map.set(seasonId, query.data)
        }
      })
      return {
        seasonConfigsMap: map,
        isLoading: results.some((query) => query.isLoading),
        isError: results.some((query) => query.isError),
      }
    },
  })

  const updateQuotasMutation = useMutation({
    mutationFn: async (variablesList: UpdateSeasonQuotaVariables[]) => {
      await Promise.all(
        variablesList.map(({ seasonId, payload }) =>
          updateRecruitingSeasonQuotas(seasonId, payload),
        ),
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitingKeys.seasons() })
      addToast({
        message: "모집 인원 설정이 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
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

  return {
    seasonConfigsMap,
    isLoading,
    isError,
    updateQuotas: updateQuotasMutation.mutateAsync,
    isSaving: updateQuotasMutation.isPending,
  }
}
