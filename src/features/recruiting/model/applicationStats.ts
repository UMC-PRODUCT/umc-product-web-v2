import { emptyPartCounts, toPartKey } from "./applicantMapper"

import type {
  RecruitingPartSummary,
  RecruitingStatusSummary,
} from "../api/types"
import type { PartKey } from "./parts"

export interface SchoolApplicationCount {
  schoolId: string
  schoolName: string
  totalCount: number
  partCounts: Record<PartKey, number>
}

// 서버는 INFRA_PLUS 를 뺀 4개 파트를 항상 주지만, 매핑되지 않는 파트가 오면 버린다
// (INFRA_PLUS 는 모집 대상이 아니라 TRACK_PART_TAG 에서 null 이다).
export function toPartCounts(
  parts: RecruitingPartSummary[],
): Record<PartKey, number> {
  const counts = emptyPartCounts()
  for (const part of parts) {
    const key = toPartKey(part.part)
    if (key) counts[key] += part.totalCount
  }
  return counts
}

function addPartCounts(
  target: Record<PartKey, number>,
  source: Record<PartKey, number>,
) {
  for (const key of Object.keys(target) as PartKey[]) {
    target[key] += source[key]
  }
}

export interface ChapterApplicationGroup {
  chapterId: string
  chapterName: string
  totalCount: number
  // 서버는 지부 단위 집계를 주지 않는다(학교 단위까지만). 학교 파트 집계를 더한다.
  partCounts: Record<PartKey, number>
  schools: SchoolApplicationCount[]
}

// 지부명은 서버에서 중복될 수 있어(dev 의 Pegasus id 7/23) chapterId 로 묶는다.
// 대시보드 카드가 정렬을 하지 않으므로 표시 순서(지부명 > 학교명 가나다)를
// 여기서 정한다.
export function groupByChapter(
  summary: RecruitingStatusSummary,
): ChapterApplicationGroup[] {
  const byChapter = new Map<string, ChapterApplicationGroup>()

  for (const school of summary.schools) {
    const entry: SchoolApplicationCount = {
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      totalCount: school.totalCount,
      partCounts: toPartCounts(school.parts),
    }
    const group = byChapter.get(school.chapterId)
    if (group) {
      group.totalCount += school.totalCount
      addPartCounts(group.partCounts, entry.partCounts)
      group.schools.push(entry)
      continue
    }
    byChapter.set(school.chapterId, {
      chapterId: school.chapterId,
      chapterName: school.chapterName,
      totalCount: school.totalCount,
      partCounts: { ...entry.partCounts },
      schools: [entry],
    })
  }

  const groups = [...byChapter.values()].sort((a, b) =>
    a.chapterName.localeCompare(b.chapterName, "ko"),
  )
  for (const group of groups) {
    group.schools.sort((a, b) => a.schoolName.localeCompare(b.schoolName, "ko"))
  }
  return groups
}

// 같은 학교가 여러 행으로 올 수 있어 schoolId 기준으로 센다.
export function countSchools(summary: RecruitingStatusSummary): number {
  return new Set(summary.schools.map((school) => school.schoolId)).size
}
