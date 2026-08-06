import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
import { useRecruitingSeasonQuotas } from "../hooks/useRecruitingSeasonQuotas"
import { RecruitmentQuotaPage } from "./RecruitmentQuotaPage"

vi.mock("../hooks/useAdminRecruitingRounds")
vi.mock("../hooks/useRecruitingSeasonQuotas")
vi.mock("../hooks/useRecruitingPermissions", () => ({
  useRecruitingPermissions: () => ({
    permittedSeasonIds: new Set(["unconfigured-season-123"]),
    isLoading: false,
  }),
}))
vi.mock("@/shared/ui/toast/useToastStore", () => ({
  useToastStore: () => vi.fn(),
}))

vi.mock("./ChapterQuotaTableCard", () => ({
  ChapterQuotaTableCard: vi.fn(({ onSchoolsDataChange, onDirtyChange }) => (
    <div>
      <button
        type="button"
        data-testid="edit-school-btn"
        onClick={() => {
          onDirtyChange()
          onSchoolsDataChange([
            {
              seasonId: undefined,
              gisuId: "15",
              schoolId: "10",
              schoolName: "서울대학교",
              pm: 2,
              design: 2,
              webPe: 5,
              mobilePe: 5,
              total: 14,
            },
          ])
        }}
      >
        Trigger Edit
      </button>
    </div>
  )),
}))

describe("RecruitmentQuotaPage 저장 경로 분류", () => {
  it("시즌 설정이 없는 행(seasonId가 없는 행)을 저장하면 updateQuotas 대신 createSeason(POST)을 호출한다", async () => {
    const mockCreateSeason = vi.fn().mockResolvedValue("new-season-999")
    const mockUpdateQuotas = vi.fn().mockResolvedValue({
      successfulVariables: [],
      failedVariables: [],
      fulfilledCount: 0,
      failedCount: 0,
    })

    vi.mocked(useAdminRecruitingRounds).mockReturnValue({
      groups: [
        {
          seasonId: "unconfigured-season-123",
          gisuId: "15",
          chapterId: "1",
          chapterName: "Chromium",
          schoolId: "10",
          schoolName: "서울대학교",
          rounds: [],
        },
      ],
      generation: 15,
      isLoading: false,
      isError: false,
      isForbidden: false,
    } as unknown as ReturnType<typeof useAdminRecruitingRounds>)

    // seasonConfigsMap에 unconfigured-season-123 설정이 없음
    vi.mocked(useRecruitingSeasonQuotas).mockReturnValue({
      seasonConfigsMap: new Map(),
      updateQuotas: mockUpdateQuotas,
      createSeason: mockCreateSeason,
      updateSeason: vi.fn(),
      isSaving: false,
      isLoading: false,
      isError: false,
    })

    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <RecruitmentQuotaPage />
      </QueryClientProvider>,
    )

    // 수정 트리거 발생
    const editBtn = screen.getAllByTestId("edit-school-btn")[0]
    expect(editBtn).toBeDefined()
    if (editBtn) {
      fireEvent.click(editBtn)
    }

    const saveButton = screen.getByRole("button", { name: "저장" })
    expect(saveButton).not.toBeDisabled()

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockCreateSeason).toHaveBeenCalledWith({
        gisuId: "15",
        schoolId: "10",
        quotas: [
          { track: "PLAN", targetCount: 2 },
          { track: "DESIGN", targetCount: 2 },
          { track: "WEB_PRODUCT_ENGINEER", targetCount: 5 },
          { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 5 },
        ],
      })
      expect(mockUpdateQuotas).not.toHaveBeenCalled()
    })
  })
})
