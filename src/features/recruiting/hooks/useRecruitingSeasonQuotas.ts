import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

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
  /**
   * 같은 지부끼리 묶는 열쇠.
   *
   * 지부 합계는 앞선 요청이 반영된 결과를 전제로 계산돼 있다. 하나가 실패하면
   * 그 뒤 요청들은 전제가 깨진 값을 들고 있어, 같은 지부인지 알아야 멈출 수 있다.
   */
  chapterKey?: string
  payload: ReplaceRecruitingSeasonTrackQuotasRequest
}

export interface UpdateSeasonQuotasResult {
  successfulVariables: UpdateSeasonQuotaVariables[]
  failedVariables: UpdateSeasonQuotaVariables[]
  fulfilledCount: number
  failedCount: number
}

export interface RecruitingSeasonQuotasOptions {
  fresh?: boolean
  refetchInterval?: number | false
}

const SEASON_CONFIGURATION_REQUEST_GAP = 100

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })

export function useRecruitingSeasonQuotas(
  seasonIds: string[],
  options: RecruitingSeasonQuotasOptions = {},
) {
  const shouldRefresh = options.fresh ?? false
  const refetchInterval = options.refetchInterval ?? false
  const shouldUseSequentialRefetch =
    typeof refetchInterval === "number" && refetchInterval > 0
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const [isSequentialLoading, setIsSequentialLoading] = useState(false)
  const seasonIdsKey = seasonIds.join("|")

  const uniqueSeasonIds = useMemo(
    () => [...new Set(seasonIdsKey.split("|").filter(Boolean))].sort(),
    [seasonIdsKey],
  )

  const { seasonConfigsMap, isLoading, isError } = useQueries({
    queries: uniqueSeasonIds.map((seasonId) => ({
      queryKey: recruitingKeys.seasonConfiguration(seasonId),
      queryFn: () => getRecruitingSeasonConfiguration(seasonId),
      enabled: !shouldUseSequentialRefetch && Boolean(seasonId),
      staleTime: shouldRefresh ? 0 : 5 * 60 * 1000,
      refetchOnMount: shouldUseSequentialRefetch
        ? false
        : shouldRefresh
          ? "always"
          : true,
      refetchOnWindowFocus: shouldUseSequentialRefetch ? false : shouldRefresh,
      refetchInterval: false,
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

  useEffect(() => {
    if (!shouldUseSequentialRefetch || uniqueSeasonIds.length === 0) {
      setIsSequentialLoading(false)
      return
    }

    let cancelled = false
    let isFetching = false

    const fetchSeasonConfigurations = async (initialFetch: boolean) => {
      if (cancelled || isFetching) return

      isFetching = true
      if (initialFetch) setIsSequentialLoading(true)

      for (const [index, seasonId] of uniqueSeasonIds.entries()) {
        if (cancelled) break

        await queryClient
          .fetchQuery({
            queryKey: recruitingKeys.seasonConfiguration(seasonId),
            queryFn: () => getRecruitingSeasonConfiguration(seasonId),
            staleTime: 0,
            retry: false,
          })
          .catch(() => undefined)

        if (!cancelled && index < uniqueSeasonIds.length - 1) {
          await wait(SEASON_CONFIGURATION_REQUEST_GAP)
        }
      }

      if (initialFetch && !cancelled) setIsSequentialLoading(false)
      isFetching = false
    }

    void fetchSeasonConfigurations(true)
    const intervalId = window.setInterval(() => {
      void fetchSeasonConfigurations(false)
    }, refetchInterval)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [
    queryClient,
    refetchInterval,
    shouldUseSequentialRefetch,
    uniqueSeasonIds,
  ])

  const createSeasonMutation = useMutation({
    mutationFn: (payload: CreateRecruitingSeasonRequest) =>
      createRecruitingSeason(payload),
    onSuccess: () => {
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
    onSuccess: (_data, variables) => {
      void queryClient.fetchQuery({
        queryKey: recruitingKeys.seasonConfiguration(variables.seasonId),
        queryFn: () => getRecruitingSeasonConfiguration(variables.seasonId),
        staleTime: 0,
        retry: false,
      })
    },
  })

  const updateQuotasMutation = useMutation({
    mutationFn: async (
      variablesList: UpdateSeasonQuotaVariables[],
    ): Promise<UpdateSeasonQuotasResult> => {
      // 한 지부 안에서는 순서가 결과를 가른다. 서버가 매 요청을 "그 시점에
      // 저장된 다른 학교 값" 과 대조하기 때문에, 동시에 던지면 처리 순서에 따라
      // 통과 여부가 달라진다. 호출부가 정해 준 차례대로 하나씩 보낸다.
      //
      // 그래서 하나가 실패하면 같은 지부의 남은 요청은 보내지 않는다. 그 값들은
      // 실패한 요청이 반영됐다고 치고 계산돼 있어, 보내 봐야 합계 불일치로 다시
      // 튕긴다. 실패 하나가 지부 전체의 실패로 번지는 것만 늘어난다.
      const results: PromiseSettledResult<UpdateSeasonQuotaVariables>[] = []
      const failedChapterKeys = new Set<string>()

      for (const v of variablesList) {
        const chapterKey = v.chapterKey
        if (chapterKey !== undefined && failedChapterKeys.has(chapterKey)) {
          results.push({
            status: "rejected",
            reason: new Error(
              "같은 지부의 앞선 저장이 실패해 보내지 않았습니다.",
            ),
          })
          continue
        }

        try {
          await updateRecruitingSeasonQuotas(v.seasonId, v.payload)
          results.push({ status: "fulfilled", value: v })
        } catch (reason) {
          results.push({ status: "rejected", reason })
          if (chapterKey !== undefined) failedChapterKeys.add(chapterKey)
        }
      }

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
        const successfulSeasonIds = new Set(
          data.successfulVariables.map(({ seasonId }) => seasonId),
        )

        successfulSeasonIds.forEach((seasonId) => {
          void queryClient.fetchQuery({
            queryKey: recruitingKeys.seasonConfiguration(seasonId),
            queryFn: () => getRecruitingSeasonConfiguration(seasonId),
            staleTime: 0,
            retry: false,
          })
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
    isLoading: shouldUseSequentialRefetch ? isSequentialLoading : isLoading,
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
