import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { searchMembers } from "@/features/challenger/api/member"

import { AssignmentModal } from "./AssignmentModal"

vi.mock("@/features/challenger/api/member", () => ({
  searchMembers: vi.fn(),
}))

vi.mock("@/components/tooltip/Tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}))

function renderAssignmentModal() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AssignmentModal
        open
        onOpenChange={vi.fn()}
        projectName="iOS 프로젝트"
        challengerName="포비"
        challengerUniversity="테스트대학교"
        role="Frontend"
        part="IOS"
        gisuId={10}
        chapterId={27}
        assignedMemberIds={new Set(["2"])}
        onAssign={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

describe("AssignmentModal", () => {
  it("iOS 슬롯에서 검색하면 IOS part로 멤버를 조회한다", async () => {
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

    renderAssignmentModal()

    fireEvent.change(
      screen.getByPlaceholderText("닉네임 또는 이름으로 검색하세요"),
      {
        target: { value: "아이" },
      },
    )

    await waitFor(() => {
      expect(searchMembers).toHaveBeenCalledWith({
        keyword: "아이",
        part: "IOS",
        gisuId: "10",
        chapterId: "27",
        page: 0,
        size: 20,
      })
    })
  })
})
