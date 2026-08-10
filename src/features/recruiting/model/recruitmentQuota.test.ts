import { describe, expect, it } from "vitest"

import {
  buildChapterTotalSteps,
  findMatchingSchoolQuotaRow,
  getChangedSchoolQuotaRows,
  getChapterStoredTotals,
  getConflictedSchoolQuotaRows,
  getSchoolQuotaIdentity,
  getSchoolQuotaRowsSignature,
  getSchoolQuotaRowTotal,
  mergeSchoolQuotaRows,
  type SchoolQuotaEdits,
  type SchoolQuotaRow,
} from "./recruitmentQuota"

const createRow = (
  overrides: Partial<SchoolQuotaRow> = {},
): SchoolQuotaRow => ({
  seasonId: "1",
  gisuId: "5",
  schoolId: "10",
  schoolName: "서울대학교",
  pm: 1,
  design: 2,
  webPe: 3,
  mobilePe: 4,
  total: 10,
  ...overrides,
})

describe("getSchoolQuotaRowsSignature", () => {
  // 상위가 목록을 다시 만들기만 해도 새 배열이 된다. 그때마다 편집 중이던
  // 값을 버리면 방금 친 숫자가 지워진다.
  it("내용이 같으면 배열이 달라도 같은 지문을 낸다", () => {
    const rows = [createRow(), createRow({ seasonId: "2", schoolId: "20" })]
    const rebuilt = rows.map((row) => ({ ...row }))

    expect(rows).not.toBe(rebuilt)
    expect(getSchoolQuotaRowsSignature(rebuilt)).toBe(
      getSchoolQuotaRowsSignature(rows),
    )
  })

  it("인원이 바뀌면 지문이 달라진다", () => {
    const rows = [createRow()]
    const changed = [createRow({ pm: 9 })]

    expect(getSchoolQuotaRowsSignature(changed)).not.toBe(
      getSchoolQuotaRowsSignature(rows),
    )
  })

  it("학교가 늘면 지문이 달라진다", () => {
    const rows = [createRow()]
    const added = [...rows, createRow({ seasonId: "2", schoolId: "20" })]

    expect(getSchoolQuotaRowsSignature(added)).not.toBe(
      getSchoolQuotaRowsSignature(rows),
    )
  })

  // 설정이 뒤늦게 도착해 시즌이 붙는 것은 실제 변화다. 다시 맞춰야 한다.
  it("시즌이 새로 붙으면 지문이 달라진다", () => {
    const before = [createRow({ seasonId: undefined })]
    const after = [createRow({ seasonId: "1" })]

    expect(getSchoolQuotaRowsSignature(after)).not.toBe(
      getSchoolQuotaRowsSignature(before),
    )
  })
})

describe("getChangedSchoolQuotaRows", () => {
  it("변경된 학교 row만 반환한다", () => {
    const originalRows = [
      createRow(),
      createRow({
        seasonId: "2",
        schoolId: "11",
        schoolName: "연세대학교",
        pm: 5,
        total: 14,
      }),
    ]
    const currentRows = [createRow({ pm: 4, total: 13 }), originalRows[1]!]

    expect(getChangedSchoolQuotaRows(originalRows, currentRows)).toEqual([
      currentRows[0],
    ])
  })

  it("시즌이 없는 새 학교 row의 quota 변경을 반환한다", () => {
    const originalRows = [
      createRow({ seasonId: undefined, schoolId: "10", pm: 0, total: 0 }),
    ]
    const currentRows = [
      createRow({ seasonId: undefined, schoolId: "10", pm: 2, total: 2 }),
    ]

    expect(getChangedSchoolQuotaRows(originalRows, currentRows)).toEqual(
      currentRows,
    )
  })
})

describe("편집 중인 모집 인원 동기화", () => {
  it("식별자 표현이 달라도 같은 시즌 row로 매칭한다", () => {
    const serverRow = createRow({ gisuId: "5", schoolId: "10" })
    const editedRow = {
      ...serverRow,
      gisuId: undefined,
      pm: 4,
      total: 13,
    }

    expect(findMatchingSchoolQuotaRow([serverRow], editedRow)).toEqual(
      serverRow,
    )
    expect(getChangedSchoolQuotaRows([serverRow], [editedRow])).toEqual([
      editedRow,
    ])
  })

  it("편집한 row만 유지하고 편집하지 않은 row는 최신 서버값을 반영한다", () => {
    const originalRows = [
      createRow(),
      createRow({
        seasonId: "2",
        schoolId: "11",
        schoolName: "연세대학교",
        pm: 5,
      }),
    ]
    const originalRow = originalRows[0]!
    const secondOriginalRow = originalRows[1]!
    const editedRow = { ...originalRow, pm: 4, total: 13 }
    const edits: SchoolQuotaEdits = new Map([
      [getSchoolQuotaIdentity(originalRow), { row: editedRow, originalRow }],
    ])
    const latestServerRows = [
      originalRow,
      { ...secondOriginalRow, pm: 7, total: 16 },
    ]

    expect(mergeSchoolQuotaRows(latestServerRows, edits)).toEqual([
      editedRow,
      latestServerRows[1],
    ])
  })

  it("최초 입력 이후 서버값이 바뀐 row를 충돌로 반환한다", () => {
    const originalRow = createRow()
    const editedRow = { ...originalRow, pm: 4, total: 13 }
    const edits: SchoolQuotaEdits = new Map([
      [getSchoolQuotaIdentity(editedRow), { row: editedRow, originalRow }],
    ])

    expect(
      getConflictedSchoolQuotaRows(
        [{ ...originalRow, pm: 3, total: 12 }],
        edits,
      ),
    ).toEqual([editedRow])
  })

  it("서버값이 편집 시작 시점과 같으면 충돌로 표시하지 않는다", () => {
    const originalRow = createRow()
    const editedRow = { ...originalRow, pm: 4, total: 13 }
    const edits: SchoolQuotaEdits = new Map([
      [getSchoolQuotaIdentity(editedRow), { row: editedRow, originalRow }],
    ])

    expect(getConflictedSchoolQuotaRows([originalRow], edits)).toEqual([])
  })
})

describe("getChapterStoredTotals", () => {
  it("시즌이 있는 학교만 담는다", () => {
    const withSeason = createRow({ seasonId: "1", schoolId: "10" })
    const withoutSeason = createRow({
      seasonId: undefined,
      schoolId: "11",
      schoolName: "연세대학교",
    })

    const totals = getChapterStoredTotals([withSeason, withoutSeason])

    expect([...totals.keys()]).toEqual(["1"])
    expect(totals.get("1")).toBe(10)
  })

  it("합은 total 필드가 아니라 파트 값에서 다시 센다", () => {
    // total 이 낡은 값으로 남아 있어도 파트 합이 정답이다
    const row = createRow({
      seasonId: "1",
      pm: 2,
      design: 0,
      webPe: 0,
      mobilePe: 0,
      total: 999,
    })

    expect(getChapterStoredTotals([row]).get("1")).toBe(2)
    expect(getSchoolQuotaRowTotal(row)).toBe(2)
  })
})

describe("buildChapterTotalSteps", () => {
  it("한 학교만 고치면 그 학교 변화분만 반영한다", () => {
    const stored = new Map([
      ["1", 10],
      ["2", 5],
    ])

    expect(
      buildChapterTotalSteps(stored, [{ seasonId: "1", nextTotal: 13 }]),
    ).toEqual([{ seasonId: "1", chapterTotalTargetCount: 18 }])
  })

  // 서버가 요청 시점의 저장값으로 검산하므로 두 요청의 값이 달라야 한다
  it("같은 지부 두 학교를 고치면 요청마다 합계가 다르다", () => {
    const stored = new Map([
      ["1", 10],
      ["2", 5],
    ])

    expect(
      buildChapterTotalSteps(stored, [
        { seasonId: "1", nextTotal: 13 },
        { seasonId: "2", nextTotal: 7 },
      ]),
    ).toEqual([
      { seasonId: "1", chapterTotalTargetCount: 18 },
      { seasonId: "2", chapterTotalTargetCount: 20 },
    ])
  })

  it("마지막 값은 모든 변경이 반영된 지부 합계다", () => {
    const stored = new Map([
      ["1", 10],
      ["2", 5],
      ["3", 1],
    ])

    const steps = buildChapterTotalSteps(stored, [
      { seasonId: "1", nextTotal: 0 },
      { seasonId: "2", nextTotal: 0 },
    ])

    expect(steps.at(-1)?.chapterTotalTargetCount).toBe(1)
  })

  it("저장된 적 없는 시즌은 0 에서 더한다", () => {
    const stored = new Map([["1", 10]])

    expect(
      buildChapterTotalSteps(stored, [{ seasonId: "9", nextTotal: 4 }]),
    ).toEqual([{ seasonId: "9", chapterTotalTargetCount: 14 }])
  })

  it("넘겨받은 Map 을 건드리지 않는다", () => {
    const stored = new Map([["1", 10]])

    buildChapterTotalSteps(stored, [{ seasonId: "1", nextTotal: 99 }])

    expect(stored.get("1")).toBe(10)
  })

  it("고칠 학교가 없으면 빈 배열이다", () => {
    expect(buildChapterTotalSteps(new Map([["1", 10]]), [])).toEqual([])
  })
})
