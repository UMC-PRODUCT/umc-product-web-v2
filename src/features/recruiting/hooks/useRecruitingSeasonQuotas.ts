import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { recruitingKeys } from "../api/queryKeys"
import {
  createRecruitingSeason,
  getRecruitingSeasonConfiguration,
  updateRecruitingSeason,
  updateRecruitingSeasonQuotas,
} from "../api/recruitingApi"

import type {
  CreateRecruitingSeasonRequest,
  RecruitingSeasonConfigurationResponse,
  ReplaceRecruitingSeasonTrackQuotasRequest,
  UpdateRecruitingSeasonRequest,
} from "../api/types"

export interface UpdateSeasonQuotaVariables {
  seasonId: string
  schoolName?: string
  payload: ReplaceRecruitingSeasonTrackQuotasRequest
}

export interface UpdateSeasonQuotasResult {
  successfulVariables: UpdateSeasonQuotaVariables[]
  failedVariables: UpdateSeasonQuotaVariables[]
  fulfilledCount: number
  failedCount: number
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

  const createSeasonMutation = useMutation({
    mutationFn: (payload: CreateRecruitingSeasonRequest) =>
      createRecruitingSeason(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.seasons(),
      })
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.rounds(),
      })
    },
  })

  const updateSeasonMutation = useMutation({
    mutationFn: ({
      seasonId,
      payload,
    }: {
      seasonId: string
      payload: UpdateRecruitingSeasonRequest
    }) => updateRecruitingSeason(seasonId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: recruitingKeys.seasons(),
      })
    },
  })

  const updateQuotasMutation = useMutation({
    mutationFn: async (
      variablesList: UpdateSeasonQuotaVariables[],
    ): Promise<UpdateSeasonQuotasResult> => {
      const results = await Promise.allSettled(
        variablesList.map(async (v) => {
          await updateRecruitingSeasonQuotas(v.seasonId, v.payload)
          return v
        }),
      )

      const successfulVariables: UpdateSeasonQuotaVariables[] = []
      const failedVariables: UpdateSeasonQuotaVariables[] = []

      results.forEach((result, index) => {
        const item = variablesList[index]
        if (item) {
          if (result.status === "fulfilled") {
            successfulVariables.push(item)
          } else {
            failedVariables.push(item)
          }
        }
      })

      return {
        successfulVariables,
        failedVariables,
        fulfilledCount: successfulVariables.length,
        failedCount: failedVariables.length,
      }
    },
    onSettled: (data) => {
      if (!data) return

      if (data.fulfilledCount > 0) {
        void queryClient.invalidateQueries({
          queryKey: recruitingKeys.seasons(),
        })
      }

      if (data.failedCount === 0) {
        addToast({
          message: "모집 인원 설정이 저장되었습니다.",
          color: "primary",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      } else {
        const failedSchoolNames = data.failedVariables
          .map((v) => v.schoolName)
          .filter((name): name is string => Boolean(name))

        const message =
          failedSchoolNames.length > 0
            ? `${failedSchoolNames.join(", ")} 저장에 실패했습니다. 잠시 후 다시 시도해주세요.`
            : "저장에 실패했습니다. 잠시 후 다시 시도해주세요."

        addToast({
          message,
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    },
  })

  return {
    seasonConfigsMap,
    isLoading,
    isError,
    updateQuotas: updateQuotasMutation.mutateAsync,
    createSeason: createSeasonMutation.mutateAsync,
    updateSeason: updateSeasonMutation.mutateAsync,
    isSaving:
      updateQuotasMutation.isPending ||
      createSeasonMutation.isPending ||
      updateSeasonMutation.isPending,
  }
}
