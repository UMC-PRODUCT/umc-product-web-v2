import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getRecruitingSeasonConfiguration,
  updateRecruitingSeasonQuotas,
} from "../api/recruitingApi"
import { useRecruitingSeasonQuotas } from "./useRecruitingSeasonQuotas"

import type { ReactNode } from "react"

import type { RecruitingSeasonConfigurationResponse } from "../api/types"

vi.mock("../api/recruitingApi", () => ({
  createRecruitingSeason: vi.fn(),
  getRecruitingSeasonConfiguration: vi.fn(),
  updateRecruitingSeason: vi.fn(),
  updateRecruitingSeasonQuotas: vi.fn(),
}))

function createConfiguration(
  id: string,
): RecruitingSeasonConfigurationResponse {
  return {
    id,
    gisuId: "15",
    schoolId: id,
    memo: null,
    quotas: [],
    rounds: [],
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe("useRecruitingSeasonQuotas 요청 페이싱", () => {
  const seasonConfigurationRequests: string[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    seasonConfigurationRequests.length = 0
    vi.mocked(getRecruitingSeasonConfiguration).mockImplementation(
      async (seasonId) => {
        seasonConfigurationRequests.push(seasonId)
        return createConfiguration(seasonId)
      },
    )
    vi.mocked(updateRecruitingSeasonQuotas).mockResolvedValue(undefined)
  })

  it("시즌 설정을 중복 없이 순차 조회하고 저장 후 변경된 시즌만 재조회한다", async () => {
    const { result } = renderHook(
      () =>
        useRecruitingSeasonQuotas(["2", "1", "2"], {
          fresh: true,
          refetchInterval: 30_000,
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(seasonConfigurationRequests).toEqual(["1", "2"])

    const requestCountBeforeSave = seasonConfigurationRequests.length

    await act(async () => {
      await result.current.updateQuotas([
        {
          seasonId: "1",
          schoolName: "서울대학교",
          payload: { quotas: [] },
        },
      ])
    })

    await waitFor(() => {
      expect(seasonConfigurationRequests).toHaveLength(
        requestCountBeforeSave + 1,
      )
    })
    expect(seasonConfigurationRequests.at(-1)).toBe("1")
  })
})
