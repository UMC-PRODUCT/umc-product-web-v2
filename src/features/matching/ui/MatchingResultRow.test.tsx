import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { addProjectMember } from "@/features/application/api/applicationApi"
import { searchMembers } from "@/features/challenger/api/member"

import { MatchingResultRow } from "./MatchingResultRow"

vi.mock("@/features/application/api/applicationApi", () => ({
  addProjectMember: vi.fn(),
  removeProjectMember: vi.fn(),
}))

vi.mock("@/features/challenger/api/member", () => ({
  searchMembers: vi.fn(),
}))

vi.mock("@/components/tooltip/Tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock("@/features/project/list/ui/ProjectDetailCard", () => ({
  ProjectDetailCard: () => null,
}))

function renderMatchingResultRow() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MatchingResultRow
        projectId="100"
        projectName="iOS 프로젝트"
        challengerName="포비"
        challengerUniversity="테스트대학교"
        backendPart="springboot"
        roleRows={[
          {
            role: "Frontend",
            blocks: [{ type: "none", part: "IOS" }],
            colsPerRow: 5,
          },
        ]}
        status="recruiting"
        currentCount={0}
        totalCount={1}
        isEditable
        gisuId={10}
        chapterId={27}
      />
    </QueryClientProvider>,
  )
}

describe("MatchingResultRow manual assignment", () => {
  it("iOS 빈 슬롯 배정 검색과 요청에 IOS part를 사용한다", async () => {
    vi.mocked(searchMembers).mockResolvedValue({
      totalCount: 1,
      page: {
        content: [
          {
            memberId: "1",
            name: "김아이",
            nickname: "아이",
            email: "ios@example.com",
            schoolId: "101",
            schoolName: "테스트대학교",
            part: "IOS",
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    })
    vi.mocked(addProjectMember).mockResolvedValue(undefined)

    renderMatchingResultRow()

    fireEvent.click(screen.getByRole("button", { name: "수동 배정하기" }))
    fireEvent.change(
      screen.getByPlaceholderText("닉네임 또는 이름으로 검색하세요"),
      {
        target: { value: "아이" },
      },
    )

    await waitFor(() => {
      expect(searchMembers).toHaveBeenCalledWith(
        expect.objectContaining({ part: "IOS" }),
      )
    })

    fireEvent.click(await screen.findByRole("button", { name: /아이\/김아이/ }))
    fireEvent.click(
      screen.getByRole("button", { name: "해당 프로젝트에 배정" }),
    )

    await waitFor(() => {
      expect(addProjectMember).toHaveBeenCalledWith(100, {
        memberId: 1,
        part: "IOS",
      })
    })
  })
})
