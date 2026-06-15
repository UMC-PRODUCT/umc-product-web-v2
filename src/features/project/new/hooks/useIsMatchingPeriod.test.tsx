import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { getMatchingRounds } from "@/features/application/api/applicationApi"
import { useMe } from "@/features/auth/hooks/useMe"

import { useIsMatchingPeriod } from "./useIsMatchingPeriod"

import type { ReactNode } from "react"

import type { MemberInfoResponse } from "@/features/auth/api/me"

vi.mock("@/features/application/api/applicationApi", () => ({
  getMatchingRounds: vi.fn(),
}))

vi.mock("@/features/auth/hooks/useMe", () => ({
  useMe: vi.fn(),
}))

const mockedGetMatchingRounds = vi.mocked(getMatchingRounds)
const mockedUseMe = vi.mocked(useMe)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function makeMe(chapterId?: string): MemberInfoResponse {
  return {
    id: "1",
    name: "테스터",
    nickname: "테스터",
    email: "tester@example.com",
    schoolId: "1",
    schoolName: "테스트대학교",
    profileImageLink: null,
    status: "ACTIVE",
    hasLocalCredential: false,
    roles: [],
    challengerRecords: chapterId
      ? [
          {
            challengerId: "1",
            gisuId: "1",
            gisu: "8",
            chapterId,
            chapterName: "Selenium",
            memberId: "1",
            part: "PLAN",
            challengerStatus: "ACTIVE",
            name: "테스터",
            nickname: "테스터",
            email: "tester@example.com",
            schoolId: "1",
            schoolName: "테스트대학교",
          },
        ]
      : [],
  }
}

describe("useIsMatchingPeriod", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("chapterId를 넘기면 사용자 지부 대신 전달된 지부로 매칭 차수를 조회한다", async () => {
    mockedUseMe.mockReturnValue({
      data: makeMe("10"),
    } as ReturnType<typeof useMe>)
    mockedGetMatchingRounds.mockResolvedValue([])

    const { result } = renderHook(
      () => useIsMatchingPeriod({ chapterId: 20 }),
      {
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => {
      expect(mockedGetMatchingRounds).toHaveBeenCalledWith(20)
    })
    expect(mockedGetMatchingRounds).not.toHaveBeenCalledWith(10)
    expect(result.current).toBe(false)
  })

  it("chapterId가 없으면 사용자 최신 챌린저 기록의 지부로 매칭 차수를 조회한다", async () => {
    mockedUseMe.mockReturnValue({
      data: makeMe("10"),
    } as ReturnType<typeof useMe>)
    mockedGetMatchingRounds.mockResolvedValue([])

    renderHook(() => useIsMatchingPeriod(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockedGetMatchingRounds).toHaveBeenCalledWith(10)
    })
  })

  it("대상 지부가 없으면 매칭 차수를 조회하지 않고 false를 반환한다", () => {
    mockedUseMe.mockReturnValue({
      data: makeMe(),
    } as ReturnType<typeof useMe>)

    const { result } = renderHook(() => useIsMatchingPeriod(), {
      wrapper: createWrapper(),
    })

    expect(mockedGetMatchingRounds).not.toHaveBeenCalled()
    expect(result.current).toBe(false)
  })
})
