import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCurriculum,
  createWeeklyCurriculum,
  updateCurriculum,
  updateWeeklyCurriculum,
} from "@/entities/curriculum"

import { useCurriculumEditor } from "./useCurriculumEditor"

vi.mock("@/entities/curriculum", () => ({
  getCurriculumOverview: vi.fn().mockResolvedValue(null),
  createCurriculum: vi.fn(),
  createWeeklyCurriculum: vi.fn(),
  updateCurriculum: vi.fn(),
  updateWeeklyCurriculum: vi.fn(),
  deleteCurriculum: vi.fn(),
  deleteWeeklyCurriculum: vi.fn(),
}))

vi.mock("@/shared/hooks/useActiveGisu", () => ({
  useActiveGisuId: () => ({ data: 1, isLoading: false }),
}))

describe("useCurriculumEditor - temporary ID handleBlur", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("생성 중인 임시 커리큘럼 ID에 대해 blur 발생 시 생성 완료 후 updateCurriculum을 호출한다", async () => {
    let resolveCreate: (id: number) => void = () => {}
    const createPromise = new Promise<number>((resolve) => {
      resolveCreate = resolve
    })
    vi.mocked(createCurriculum).mockReturnValue(createPromise)
    vi.mocked(createWeeklyCurriculum).mockResolvedValue(101)
    vi.mocked(updateCurriculum).mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useCurriculumEditor({ initialCurriculums: [], part: "PM" }),
    )

    // 1. 커리큘럼 생성 클릭 (서버 응답 대기 상태)
    act(() => {
      result.current.handleCreateCurriculum()
    })

    const tempCurriculumId = result.current.curriculums[0]?.id
    expect(tempCurriculumId).toMatch(/^curriculum-/)

    // 2. 임시 ID 상태에서 제목 입력 후 blur 처리
    let blurPromise: Promise<void> | undefined
    act(() => {
      blurPromise = result.current.handleBlurCurriculumTitle(
        tempCurriculumId!,
        "수정된 커리큘럼 제목",
      )
    })

    // 서버 생성 완료 처리
    await act(async () => {
      resolveCreate(99)
      await blurPromise
    })

    // 3. updateCurriculum이 생성 완료된 ID(99)로 호출되었는지 검증
    expect(updateCurriculum).toHaveBeenCalledWith(99, {
      title: "수정된 커리큘럼 제목",
    })
  })

  it("생성 중인 임시 워크북 ID에 대해 blur 발생 시 생성 완료 후 updateWeeklyCurriculum을 호출한다", async () => {
    vi.mocked(createCurriculum).mockResolvedValue(99)
    let resolveWeeklyCreate: (id: number) => void = () => {}
    const weeklyCreatePromise = new Promise<number>((resolve) => {
      resolveWeeklyCreate = resolve
    })
    vi.mocked(createWeeklyCurriculum).mockReturnValue(weeklyCreatePromise)
    vi.mocked(updateWeeklyCurriculum).mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useCurriculumEditor({ initialCurriculums: [], part: "PM" }),
    )

    // 1. 커리큘럼 생성
    act(() => {
      result.current.handleCreateCurriculum()
    })

    const tempWbId = result.current.curriculums[0]?.workbooks[0]?.id
    expect(tempWbId).toMatch(/^wb-/)

    // 2. 임시 워크북 ID 상태에서 blur 처리
    let blurPromise: Promise<void> | undefined
    act(() => {
      blurPromise = result.current.handleBlurWorkbookTitle(
        result.current.curriculums[0]!.id,
        0,
        "수정된 워크북 제목",
      )
    })

    // 워크북 서버 생성 완료 처리
    await act(async () => {
      resolveWeeklyCreate(202)
      await blurPromise
    })

    // 3. updateWeeklyCurriculum이 생성 완료된 워크북 ID(202)로 호출되었는지 검증
    expect(updateWeeklyCurriculum).toHaveBeenCalledWith(202, {
      title: "수정된 워크북 제목",
      weekNo: 1,
    })
  })
})
