import { describe, expect, it } from "vitest"

import {
  findMatchingSchoolQuotaRow,
  getChangedSchoolQuotaRows,
  getConflictedSchoolQuotaRows,
  getSchoolQuotaIdentity,
  getSchoolQuotaRowsSignature,
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
