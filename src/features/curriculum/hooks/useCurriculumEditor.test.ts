import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCurriculum,
  createWeeklyCurriculum,
  deleteCurriculum,
  deleteWeeklyCurriculum,
  updateCurriculum,
  updateWeeklyCurriculum,
} from "@/entities/curriculum"

import { useCurriculumEditor } from "./useCurriculumEditor"

vi.mock("@/entities/curriculum", () => ({
  getCurriculumOverview: vi.fn().mockRejectedValue(new Error("No overview")),
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

describe("useCurriculumEditor - deletion failure restoration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deleteCurriculum 실패 시 targetCurriculum을 복구하고 번호를 재계산한다", async () => {
    vi.mocked(deleteCurriculum).mockRejectedValue(new Error("Delete failed"))

    const initialCurriculums = [
      {
        id: "100",
        number: "01",
        title: "커리큘럼 1",
        workbookCount: 1,
        missionCount: 1,
        workbooks: [{ id: "10", number: 1, title: "Wb 1", missions: [""] }],
      },
    ]

    const { result } = renderHook(() =>
      useCurriculumEditor({ initialCurriculums, part: "PM" }),
    )

    await act(async () => {
      await result.current.handleDeleteCurriculum("100")
    })

    expect(result.current.curriculums).toHaveLength(1)
    expect(result.current.curriculums[0]?.id).toBe("100")
    expect(result.current.curriculums[0]?.number).toBe("01")
  })

  it("deleteWeeklyCurriculum 실패 시 targetWb를 복구하고 워크북 번호 및 개수를 재계산한다", async () => {
    vi.mocked(deleteWeeklyCurriculum).mockRejectedValue(
      new Error("Delete wb failed"),
    )

    const initialCurriculums = [
      {
        id: "100",
        number: "01",
        title: "커리큘럼 1",
        workbookCount: 2,
        missionCount: 2,
        workbooks: [
          { id: "10", number: 1, title: "Wb 1", missions: [""] },
          { id: "20", number: 2, title: "Wb 2", missions: [""] },
        ],
      },
    ]

    const { result } = renderHook(() =>
      useCurriculumEditor({ initialCurriculums, part: "PM" }),
    )

    await act(async () => {
      await result.current.handleDeleteWorkbook("100", 0)
    })

    const restoredWorkbooks = result.current.curriculums[0]?.workbooks
    expect(restoredWorkbooks).toHaveLength(2)
    expect(restoredWorkbooks?.[0]?.id).toBe("10")
    expect(restoredWorkbooks?.[0]?.number).toBe(1)
    expect(result.current.curriculums[0]?.workbookCount).toBe(2)
  })
})

describe("useCurriculumEditor - handleDragEnd workbook sequential update", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("워크북 드래그앤드롭 후 순차적으로 updateWeeklyCurriculum을 호출한다", async () => {
    vi.mocked(updateWeeklyCurriculum).mockResolvedValue(undefined)

    const initialCurriculums = [
      {
        id: "100",
        number: "01",
        title: "커리큘럼 1",
        workbookCount: 2,
        missionCount: 2,
        workbooks: [
          { id: "10", number: 1, title: "Wb 1", missions: [""] },
          { id: "20", number: 2, title: "Wb 2", missions: [""] },
        ],
      },
    ]

    const { result } = renderHook(() =>
      useCurriculumEditor({ initialCurriculums, part: "PM" }),
    )

    await act(async () => {
      // @ts-expect-error test event call
      result.current.handleDragEnd({
        active: { id: "10", data: { current: { type: "workbook" } } },
        over: { id: "20" },
      })
    })

    expect(updateWeeklyCurriculum).toHaveBeenCalledTimes(2)
    expect(updateWeeklyCurriculum).toHaveBeenNthCalledWith(1, 10, {
      weekNo: 1,
      title: "Wb 1",
    })
    expect(updateWeeklyCurriculum).toHaveBeenNthCalledWith(2, 20, {
      weekNo: 2,
      title: "Wb 2",
    })
  })

  it("updateWeeklyCurriculum 실패 시 순차 업데이트를 중단한다", async () => {
    vi.mocked(updateWeeklyCurriculum).mockRejectedValueOnce(
      new Error("Failed update"),
    )

    const initialCurriculums = [
      {
        id: "100",
        number: "01",
        title: "커리큘럼 1",
        workbookCount: 2,
        missionCount: 2,
        workbooks: [
          { id: "10", number: 1, title: "Wb 1", missions: [""] },
          { id: "20", number: 2, title: "Wb 2", missions: [""] },
        ],
      },
    ]

    const { result } = renderHook(() =>
      useCurriculumEditor({ initialCurriculums, part: "PM" }),
    )

    await act(async () => {
      // @ts-expect-error test event call
      result.current.handleDragEnd({
        active: { id: "10", data: { current: { type: "workbook" } } },
        over: { id: "20" },
      })
    })

    expect(updateWeeklyCurriculum).toHaveBeenCalledTimes(1)
  })
})
