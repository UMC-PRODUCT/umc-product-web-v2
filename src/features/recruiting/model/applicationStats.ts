import type { RecruitingStatusSummary } from "../api/types"

export interface SchoolApplicationCount {
  schoolId: string
  schoolName: string
  totalCount: number
}

export interface ChapterApplicationGroup {
  chapterId: string
  chapterName: string
  totalCount: number
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
    }
    const group = byChapter.get(school.chapterId)
    if (group) {
      group.totalCount += school.totalCount
      group.schools.push(entry)
      continue
    }
    byChapter.set(school.chapterId, {
      chapterId: school.chapterId,
      chapterName: school.chapterName,
      totalCount: school.totalCount,
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
