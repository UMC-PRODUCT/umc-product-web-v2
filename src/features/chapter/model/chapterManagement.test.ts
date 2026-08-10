import { describe, expect, it } from "vitest"

import {
  ASSIGNED_CHIP_PREFIX,
  assignSchoolToChapter,
  type ChapterData,
  clearAllChapterSchools,
  clearChapterSchools,
  detachSchool,
  isDuplicateChapterName,
  isSchool,
  PANEL_ASSIGNED_CHIP_PREFIX,
  resolveDropTargetId,
  type School,
  UNASSIGNED_PANEL_ID,
  WAITING_CHIP_PREFIX,
  withSchoolsAppended,
} from "./chapterManagement"

const seoul: School = { id: "s1", name: "서울대학교" }
const yonsei: School = { id: "s2", name: "연세대학교" }

function buildChapters(): ChapterData[] {
  return [
    { id: "c1", name: "Chromium", assignedSchools: [seoul] },
    { id: "c2", name: "Ferrum", assignedSchools: [] },
  ]
}

describe("isSchool", () => {
  it("id와 name을 가진 객체만 학교로 인정한다", () => {
    expect(isSchool(seoul)).toBe(true)
    expect(isSchool({ id: "s1" })).toBe(false)
    expect(isSchool(null)).toBe(false)
    expect(isSchool("s1")).toBe(false)
  })
})

describe("withSchoolsAppended", () => {
  it("이미 있는 학교는 중복해서 넣지 않는다", () => {
    expect(withSchoolsAppended([seoul], [seoul, yonsei])).toEqual([
      seoul,
      yonsei,
    ])
  })
})

describe("detachSchool", () => {
  it("모든 지부에서 해당 학교를 제거한다", () => {
    const result = detachSchool(buildChapters(), seoul.id)

    expect(result[0]?.assignedSchools).toEqual([])
  })
})

describe("assignSchoolToChapter", () => {
  it("대상 지부에 추가하면서 다른 지부에서는 제거한다", () => {
    const result = assignSchoolToChapter(buildChapters(), "c2", seoul)

    expect(result[0]?.assignedSchools).toEqual([])
    expect(result[1]?.assignedSchools).toEqual([seoul])
  })

  it("이미 배정된 지부에 다시 넣어도 중복되지 않는다", () => {
    const result = assignSchoolToChapter(buildChapters(), "c1", seoul)

    expect(result[0]?.assignedSchools).toEqual([seoul])
  })
})

describe("clearChapterSchools", () => {
  it("지정한 지부만 비운다", () => {
    const chapters = assignSchoolToChapter(buildChapters(), "c2", yonsei)
    const result = clearChapterSchools(chapters, "c2")

    expect(result[0]?.assignedSchools).toEqual([seoul])
    expect(result[1]?.assignedSchools).toEqual([])
  })

  it("전체 비우기는 모든 지부를 비운다", () => {
    const result = clearAllChapterSchools(buildChapters())

    expect(result.every((ch) => ch.assignedSchools.length === 0)).toBe(true)
  })
})

describe("isDuplicateChapterName", () => {
  it("다른 지부와 이름이 겹치면 중복으로 본다", () => {
    expect(isDuplicateChapterName(buildChapters(), "c2", "Chromium")).toBe(true)
  })

  it("자기 자신의 이름은 중복이 아니다", () => {
    expect(isDuplicateChapterName(buildChapters(), "c1", "Chromium")).toBe(
      false,
    )
  })

  it("빈 이름은 중복 검사 대상이 아니다", () => {
    expect(isDuplicateChapterName(buildChapters(), "c2", "   ")).toBe(false)
  })
})

describe("resolveDropTargetId", () => {
  it("지부 위에 놓으면 해당 지부를 반환한다", () => {
    expect(resolveDropTargetId(buildChapters(), [], "c2")).toBe("c2")
  })

  it("배정된 칩 위에 놓으면 그 칩이 속한 지부를 반환한다", () => {
    expect(
      resolveDropTargetId(
        buildChapters(),
        [],
        `${ASSIGNED_CHIP_PREFIX}${seoul.id}`,
      ),
    ).toBe("c1")
  })

  it("미배정 패널과 대기 칩은 패널로 귀속시킨다", () => {
    expect(
      resolveDropTargetId(buildChapters(), [yonsei], UNASSIGNED_PANEL_ID),
    ).toBe(UNASSIGNED_PANEL_ID)
    expect(resolveDropTargetId(buildChapters(), [yonsei], yonsei.id)).toBe(
      UNASSIGNED_PANEL_ID,
    )
  })

  it("대기 칩과 패널 배정 칩 프리픽스도 패널로 귀속시킨다", () => {
    expect(
      resolveDropTargetId(buildChapters(), [], `${WAITING_CHIP_PREFIX}s99`),
    ).toBe(UNASSIGNED_PANEL_ID)
    expect(
      resolveDropTargetId(
        buildChapters(),
        [],
        `${PANEL_ASSIGNED_CHIP_PREFIX}s99`,
      ),
    ).toBe(UNASSIGNED_PANEL_ID)
  })

  it("알 수 없는 대상은 null을 반환한다", () => {
    expect(resolveDropTargetId(buildChapters(), [], "unknown")).toBeNull()
  })
})
