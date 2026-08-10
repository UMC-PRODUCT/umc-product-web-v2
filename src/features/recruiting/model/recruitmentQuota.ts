export interface SchoolQuotaRow {
  seasonId?: string
  gisuId?: string
  schoolId?: string
  schoolName: string
  pm: number
  design: number
  webPe: number
  mobilePe: number
  total: number
}

export interface SchoolQuotaEdit {
  row: SchoolQuotaRow
  originalRow?: SchoolQuotaRow
}

export type SchoolQuotaEdits = Map<string, SchoolQuotaEdit>

const QUOTA_FIELDS = ["pm", "design", "webPe", "mobilePe"] as const

export function getSchoolQuotaIdentity(row: SchoolQuotaRow): string {
  if (row.gisuId && row.schoolId) {
    return `school:${row.gisuId}:${row.schoolId}`
  }
  if (row.seasonId) return `season:${row.seasonId}`
  return `school:${row.gisuId ?? ""}:${row.schoolId ?? row.schoolName}`
}

function isSameSchoolQuotaRow(
  left: SchoolQuotaRow,
  right: SchoolQuotaRow,
): boolean {
  if (left.seasonId && right.seasonId) {
    return String(left.seasonId) === String(right.seasonId)
  }

  if (left.gisuId && left.schoolId && right.gisuId && right.schoolId) {
    return (
      String(left.gisuId) === String(right.gisuId) &&
      String(left.schoolId) === String(right.schoolId)
    )
  }

  if (left.schoolId && right.schoolId) {
    return (
      String(left.schoolId) === String(right.schoolId) &&
      left.schoolName === right.schoolName
    )
  }

  return left.schoolName === right.schoolName
}

export function findMatchingSchoolQuotaRow(
  rows: SchoolQuotaRow[],
  targetRow: SchoolQuotaRow,
): SchoolQuotaRow | undefined {
  return rows.find((row) => isSameSchoolQuotaRow(row, targetRow))
}

function hasQuotaChanged(
  originalRow: SchoolQuotaRow,
  currentRow: SchoolQuotaRow,
): boolean {
  return QUOTA_FIELDS.some((field) => currentRow[field] !== originalRow[field])
}

export function mergeSchoolQuotaRows(
  serverRows: SchoolQuotaRow[],
  edits: SchoolQuotaEdits,
): SchoolQuotaRow[] {
  const serverIdentities = new Set(
    serverRows.map((row) => getSchoolQuotaIdentity(row)),
  )
  const mergedRows = serverRows.map((serverRow) => {
    const edit =
      edits.get(getSchoolQuotaIdentity(serverRow)) ??
      [...edits.values()].find((item) =>
        isSameSchoolQuotaRow(item.row, serverRow),
      )
    return edit?.row ?? serverRow
  })

  edits.forEach((edit, identity) => {
    if (
      !serverIdentities.has(identity) &&
      !findMatchingSchoolQuotaRow(serverRows, edit.row)
    ) {
      mergedRows.push(edit.row)
    }
  })

  return mergedRows
}

export function getConflictedSchoolQuotaRows(
  serverRows: SchoolQuotaRow[],
  edits: SchoolQuotaEdits,
): SchoolQuotaRow[] {
  const serverRowsByIdentity = new Map(
    serverRows.map((row) => [getSchoolQuotaIdentity(row), row]),
  )

  return [...edits.values()]
    .filter((edit) => {
      const serverRow =
        serverRowsByIdentity.get(getSchoolQuotaIdentity(edit.row)) ??
        findMatchingSchoolQuotaRow(serverRows, edit.row)

      if (!serverRow) return Boolean(edit.originalRow)
      if (!edit.originalRow) return true

      return hasQuotaChanged(edit.originalRow, serverRow)
    })
    .map((edit) => edit.row)
}

/**
 * 서버에서 온 행 목록의 내용 지문.
 *
 * 표는 서버 데이터가 바뀌면 편집 중이던 값을 버리고 다시 맞춘다. 그 판단을
 * 배열 동일성으로 하면 안 된다. 상위에서 목록을 다시 만들기만 해도 내용이
 * 그대로인데 새 배열이 되어, 방금 친 값이 지워진다.
 */
export function getSchoolQuotaRowsSignature(
  rows: readonly SchoolQuotaRow[],
): string {
  return rows
    .map((row) =>
      [
        getSchoolQuotaIdentity(row),
        // 시즌이 새로 생기면 편집 가능 여부가 달라진다. 실제 변화다.
        row.seasonId ?? "",
        row.schoolName,
        row.pm,
        row.design,
        row.webPe,
        row.mobilePe,
      ].join(":"),
    )
    .join("|")
}

export function getChangedSchoolQuotaRows(
  originalRows: SchoolQuotaRow[],
  currentRows: SchoolQuotaRow[],
): SchoolQuotaRow[] {
  return currentRows.filter((currentRow) => {
    const originalRow = findMatchingSchoolQuotaRow(originalRows, currentRow)
    if (!originalRow) return true

    return hasQuotaChanged(originalRow, currentRow)
  })
}

export function getSchoolQuotaRowTotal(row: SchoolQuotaRow): number {
  return QUOTA_FIELDS.reduce((sum, field) => sum + (row[field] || 0), 0)
}

/**
 * 지부에 시즌이 있는 학교들의 현재 목표 인원 합.
 *
 * 시즌이 없는 학교는 뺀다. 서버도 시즌이 있는 학교만 세기 때문에, 여기서 0 이라도
 * 더해 놓으면 학교 수와 무관하게 값은 같지만 시즌이 생기는 순간 기준이 어긋난다.
 */
export function getChapterStoredTotals(
  rows: SchoolQuotaRow[],
): Map<string, number> {
  const totals = new Map<string, number>()
  rows.forEach((row) => {
    if (!row.seasonId) return
    totals.set(String(row.seasonId), getSchoolQuotaRowTotal(row))
  })
  return totals
}

export interface ChapterTotalStep {
  seasonId: string
  /** 이 요청과 함께 보낼 지부 전체 목표 인원 */
  chapterTotalTargetCount: number
}

/**
 * 학교를 하나씩 저장할 때 요청마다 실어 보낼 지부 합계를 미리 계산한다.
 *
 * 서버는 매 요청을 "이번 요청의 트랙 합 + 같은 지부 다른 학교들의 **그 시점 저장값**"
 * 과 대조한다. 그래서 마지막 합계를 모든 요청에 똑같이 보내면 첫 요청부터 어긋난다.
 * 앞선 요청이 반영된 결과를 누적해 가며 요청마다 다른 값을 만든다.
 *
 * 이 규칙 때문에 한 지부 안에서는 요청을 순서대로 보내야 한다. 병렬로 던지면
 * 서버가 어떤 순서로 처리하느냐에 따라 통과 여부가 갈린다.
 */
export function buildChapterTotalSteps(
  storedTotals: ReadonlyMap<string, number>,
  updates: readonly { seasonId: string; nextTotal: number }[],
): ChapterTotalStep[] {
  const current = new Map(storedTotals)
  let runningTotal = [...current.values()].reduce((sum, n) => sum + n, 0)

  return updates.map(({ seasonId, nextTotal }) => {
    const key = String(seasonId)
    runningTotal = runningTotal - (current.get(key) ?? 0) + nextTotal
    current.set(key, nextTotal)
    return { seasonId: key, chapterTotalTargetCount: runningTotal }
  })
}

export interface PartCounts {
  pm: number
  design: number
  webPe: number
  mobilePe: number
}

export interface ChapterQuotaData {
  chapter: string
  schoolCount: number
  updatedDate?: string
  updatedTime?: string
  schools: SchoolQuotaRow[]
  totals: PartCounts & { total: number }
}
