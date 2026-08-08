import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useMe } from "@/entities/member/hooks/useMe"

import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
import { useRecruitingSeasonQuotas } from "../hooks/useRecruitingSeasonQuotas"
import { RecruitmentQuotaPage } from "./RecruitmentQuotaPage"

import type { MemberInfoResponse } from "@/entities/member/api/me"

import type { RecruitingSeasonConfigurationResponse } from "../api/types"

vi.mock("../hooks/useAdminRecruitingRounds")
vi.mock("../hooks/useRecruitingSeasonQuotas")
vi.mock("@/entities/member/hooks/useMe", () => ({ useMe: vi.fn() }))
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
  ChapterQuotaTableCard: vi.fn(
    ({ data, onSchoolDataChange, onDirtyChange, conflictedSchoolNames }) => (
      <div>
        <div data-testid="quota-schools">
          {data.schools
            .map(
              (school: { schoolName: string; total: number }) =>
                `${school.schoolName} ${school.total}명`,
            )
            .join(",")}
        </div>
        <div data-testid="conflict-names">
          {[...(conflictedSchoolNames ?? [])].join(",")}
        </div>
        <button
          type="button"
          data-testid="edit-school-btn"
          onClick={() => {
            onDirtyChange()
            onSchoolDataChange?.({
              seasonId: undefined,
              gisuId: "15",
              schoolId: "10",
              schoolName: "서울대학교",
              pm: 2,
              design: 2,
              webPe: 5,
              mobilePe: 5,
              total: 14,
            })
          }}
        >
          Trigger Edit
        </button>
      </div>
    ),
  ),
}))
vi.mock("./ChapterTabs", () => ({
  ChapterTabs: () => <div data-testid="chapter-tabs" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useMe).mockReturnValue({
    data: undefined,
    isLoading: false,
  } as unknown as ReturnType<typeof useMe>)
})

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

  it("편집 중인 row는 서버 갱신으로 덮어쓰지 않고 충돌을 표시한다", async () => {
    const seasonConfigsMap = new Map<
      string,
      RecruitingSeasonConfigurationResponse
    >([
      [
        "unconfigured-season-123",
        {
          id: "unconfigured-season-123",
          gisuId: "15",
          schoolId: "10",
          memo: null,
          quotas: [
            { track: "PLAN", targetCount: 1 },
            { track: "DESIGN", targetCount: 1 },
            { track: "WEB_PRODUCT_ENGINEER", targetCount: 1 },
            { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 1 },
          ],
          rounds: [],
        },
      ],
    ])

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

    vi.mocked(useRecruitingSeasonQuotas).mockReturnValue({
      seasonConfigsMap,
      updateQuotas: vi.fn(),
      createSeason: vi.fn(),
      updateSeason: vi.fn(),
      isSaving: false,
      isLoading: false,
      isError: false,
    })

    const queryClient = new QueryClient()
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <RecruitmentQuotaPage />
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getAllByTestId("edit-school-btn")[0]!)

    seasonConfigsMap.set("unconfigured-season-123", {
      id: "unconfigured-season-123",
      gisuId: "15",
      schoolId: "10",
      memo: null,
      quotas: [
        { track: "PLAN", targetCount: 3 },
        { track: "DESIGN", targetCount: 1 },
        { track: "WEB_PRODUCT_ENGINEER", targetCount: 1 },
        { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 1 },
      ],
      rounds: [],
    })
    vi.mocked(useRecruitingSeasonQuotas).mockReturnValue({
      seasonConfigsMap: new Map(seasonConfigsMap),
      updateQuotas: vi.fn(),
      createSeason: vi.fn(),
      updateSeason: vi.fn(),
      isSaving: false,
      isLoading: false,
      isError: false,
    })

    rerender(
      <QueryClientProvider client={queryClient}>
        <RecruitmentQuotaPage />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getAllByTestId("conflict-names")[0]).toHaveTextContent(
        "서울대학교",
      )
    })
    expect(screen.getByRole("alert")).toHaveTextContent(
      "현재 입력값은 유지하고 있습니다",
    )
  })

  it("학교 회장단은 본인 지부만 조회하고 지부 세그먼트를 숨긴다", () => {
    const schoolPresident: MemberInfoResponse = {
      id: "member-1",
      name: "가천대 회장",
      nickname: "가천대 회장",
      email: "gacheon_10_schoolpresident@umc.dev",
      schoolId: "10",
      schoolName: "가천대학교",
      profileImageLink: null,
      status: "ACTIVE",
      hasLocalCredential: true,
      roles: [
        {
          challengerRoleId: "role-1",
          challengerId: "challenger-1",
          roleType: "SCHOOL_PRESIDENT",
          organizationType: "SCHOOL",
          organizationId: "10",
          gisuId: "15",
          gisu: "10",
        },
      ],
      currentGisuMemberInfo: {
        gisuId: "15",
        generation: "10",
        challenger: {
          challengerId: "challenger-1",
          part: "PLAN",
          challengerStatus: "ACTIVE",
        },
        isAdmin: true,
        roleTypes: ["SCHOOL_PRESIDENT"],
      },
      challengerRecords: [
        {
          challengerId: "challenger-1",
          memberId: "member-1",
          gisuId: "15",
          gisu: "10",
          chapterId: "29",
          chapterName: "Chromium",
          part: "PLAN",
          challengerStatus: "ACTIVE",
          name: "가천대 회장",
          nickname: "가천대 회장",
          email: "gacheon_10_schoolpresident@umc.dev",
          schoolId: "10",
          schoolName: "가천대학교",
        },
      ],
    }

    vi.mocked(useMe).mockReturnValue({
      data: schoolPresident,
      isLoading: false,
    } as unknown as ReturnType<typeof useMe>)
    vi.mocked(useAdminRecruitingRounds).mockReturnValue({
      groups: [
        {
          seasonId: "chromium-season",
          gisuId: "15",
          chapterId: "29",
          chapterName: "Chromium",
          schoolId: "10",
          schoolName: "가천대학교",
          rounds: [],
        },
        {
          seasonId: "chromium-dongguk-season",
          gisuId: "15",
          chapterId: "29",
          chapterName: "Chromium",
          schoolId: "20",
          schoolName: "동국대학교",
          rounds: [],
        },
        {
          seasonId: "ferrum-season",
          gisuId: "15",
          chapterId: "30",
          chapterName: "Ferrum",
          schoolId: "11",
          schoolName: "연세대학교",
          rounds: [],
        },
      ],
      generation: 10,
      isLoading: false,
      isError: false,
      isForbidden: false,
    } as unknown as ReturnType<typeof useAdminRecruitingRounds>)
    vi.mocked(useRecruitingSeasonQuotas).mockReturnValue({
      seasonConfigsMap: new Map([
        [
          "chromium-season",
          {
            id: "chromium-season",
            gisuId: "15",
            schoolId: "10",
            memo: null,
            quotas: [
              { track: "PLAN", targetCount: 1 },
              { track: "DESIGN", targetCount: 1 },
              { track: "WEB_PRODUCT_ENGINEER", targetCount: 5 },
              { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 5 },
            ],
            rounds: [],
          },
        ],
        [
          "chromium-dongguk-season",
          {
            id: "chromium-dongguk-season",
            gisuId: "15",
            schoolId: "20",
            memo: null,
            quotas: [
              { track: "PLAN", targetCount: 2 },
              { track: "DESIGN", targetCount: 2 },
              { track: "WEB_PRODUCT_ENGINEER", targetCount: 4 },
              { track: "MOBILE_PRODUCT_ENGINEER", targetCount: 4 },
            ],
            rounds: [],
          },
        ],
      ]),
      updateQuotas: vi.fn(),
      createSeason: vi.fn(),
      updateSeason: vi.fn(),
      isSaving: false,
      isLoading: false,
      isError: false,
    })

    render(
      <QueryClientProvider client={new QueryClient()}>
        <RecruitmentQuotaPage />
      </QueryClientProvider>,
    )

    expect(useAdminRecruitingRounds).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ chapterId: "29", enabled: true }),
    )
    expect(screen.queryByTestId("chapter-tabs")).not.toBeInTheDocument()
    expect(screen.getByText("Chromium")).toBeInTheDocument()
    expect(screen.getByTestId("quota-schools")).toHaveTextContent(
      "가천대학교 12명,동국대학교 12명",
    )
    expect(screen.queryByText("Ferrum")).not.toBeInTheDocument()
  })
})
