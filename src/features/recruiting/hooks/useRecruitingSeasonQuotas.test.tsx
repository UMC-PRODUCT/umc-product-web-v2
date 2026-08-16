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
    chapterTotalTargetCount: null,
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
          payload: { chapterTotalTargetCount: 0, quotas: [] },
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

describe("저장 실패가 같은 지부로 번지지 않는지", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const variables = (seasonId: string, chapterKey: string) => ({
    seasonId,
    schoolName: `학교${seasonId}`,
    chapterKey,
    payload: { chapterTotalTargetCount: 0, quotas: [] },
  })

  // 지부 합계는 앞선 요청이 반영된 결과를 전제로 계산돼 있다. 하나가 실패하면
  // 그 뒤 요청은 어차피 합계 불일치로 튕기므로 보내지 않는다.
  it("같은 지부에서 하나가 실패하면 뒤 요청을 보내지 않는다", async () => {
    vi.mocked(getRecruitingSeasonConfiguration).mockResolvedValue(
      createConfiguration("1"),
    )
    vi.mocked(updateRecruitingSeasonQuotas)
      .mockRejectedValueOnce(new Error("400"))
      .mockResolvedValue(undefined)

    const { result } = renderHook(() => useRecruitingSeasonQuotas(["1"]), {
      wrapper: createWrapper(),
    })

    let outcome: Awaited<ReturnType<typeof result.current.updateQuotas>>
    await act(async () => {
      outcome = await result.current.updateQuotas([
        variables("1", "Neon"),
        variables("2", "Neon"),
      ])
    })

    expect(vi.mocked(updateRecruitingSeasonQuotas)).toHaveBeenCalledTimes(1)
    expect(outcome!.failedCount).toBe(2)
    expect(outcome!.fulfilledCount).toBe(0)
  })

  it("다른 지부의 요청은 그대로 보낸다", async () => {
    vi.mocked(getRecruitingSeasonConfiguration).mockResolvedValue(
      createConfiguration("1"),
    )
    vi.mocked(updateRecruitingSeasonQuotas)
      .mockRejectedValueOnce(new Error("400"))
      .mockResolvedValue(undefined)

    const { result } = renderHook(() => useRecruitingSeasonQuotas(["1"]), {
      wrapper: createWrapper(),
    })

    let outcome: Awaited<ReturnType<typeof result.current.updateQuotas>>
    await act(async () => {
      outcome = await result.current.updateQuotas([
        variables("1", "Neon"),
        variables("2", "Xenon"),
      ])
    })

    expect(vi.mocked(updateRecruitingSeasonQuotas)).toHaveBeenCalledTimes(2)
    expect(outcome!.fulfilledCount).toBe(1)
    expect(outcome!.failedCount).toBe(1)
  })
})
