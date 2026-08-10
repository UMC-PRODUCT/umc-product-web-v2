import { emptyPartCounts, toPartKey } from "./applicantMapper"

import type {
  RecruitingEvaluationStatistics,
  RecruitingTrackCount,
} from "../api/types"
import type { PartBreakdown, PartKey } from "./parts"

// 서버는 INFRA_PLUS 를 빼고 4개 트랙을 항상 주지만, 늘어나도 화면이 깨지지 않게
// 매핑되지 않는 트랙은 버린다(INFRA_PLUS 는 TRACK_PART_TAG 에서 null 이다).
function reduceByTrack(
  byTrack: RecruitingTrackCount[],
  pick: (item: RecruitingTrackCount) => number,
): Record<PartKey, number> {
  const counts = emptyPartCounts()
  for (const item of byTrack) {
    const key = toPartKey(item.track)
    if (key) counts[key] += pick(item)
  }
  return counts
}

export function toApplicantCountsByPart(byTrack: RecruitingTrackCount[]) {
  return reduceByTrack(byTrack, (item) => item.applicantCount)
}

export function toEvaluatedCountsByPart(byTrack: RecruitingTrackCount[]) {
  return reduceByTrack(byTrack, (item) => item.evaluatedCount)
}

// 서버는 raw count 만 주고 비율은 클라이언트가 계산한다. 분모가 0 이면 0% 다.
export function toCompletionPercentage(
  evaluatedCount: number,
  applicantCount: number,
): number {
  if (applicantCount <= 0) return 0
  return Math.round((evaluatedCount / applicantCount) * 100)
}

export interface ChapterCompletion {
  chapterId: string
  chapterName: string
  count: number
  percentage: number
}

export function toChapterCompletions(
  statistics: RecruitingEvaluationStatistics,
): ChapterCompletion[] {
  return statistics.chapters.map((chapter) => ({
    chapterId: chapter.chapterId,
    chapterName: chapter.chapterName,
    count: chapter.evaluatedCount,
    percentage: toCompletionPercentage(
      chapter.evaluatedCount,
      chapter.applicantCount,
    ),
  }))
}

export interface ChapterEvaluationBar {
  chapterId: string
  chapterName: string
  /** 앞(컬러) 막대 = 평가 완료 수 */
  count: number
  /** 뒤(회색) 막대 = 지원자 수 */
  compareCount: number
  breakdown: PartBreakdown
}

function toBreakdown(byTrack: RecruitingTrackCount[]): PartBreakdown {
  const applied = toApplicantCountsByPart(byTrack)
  const evaluated = toEvaluatedCountsByPart(byTrack)
  return {
    pm: { applied: applied.pm, evaluated: evaluated.pm },
    design: { applied: applied.design, evaluated: evaluated.design },
    webPe: { applied: applied.webPe, evaluated: evaluated.webPe },
    mobilePe: { applied: applied.mobilePe, evaluated: evaluated.mobilePe },
  }
}

export function toChapterEvaluationBars(
  statistics: RecruitingEvaluationStatistics,
): ChapterEvaluationBar[] {
  return statistics.chapters.map((chapter) => ({
    chapterId: chapter.chapterId,
    chapterName: chapter.chapterName,
    count: chapter.evaluatedCount,
    compareCount: chapter.applicantCount,
    breakdown: toBreakdown(chapter.byTrack),
  }))
}

export interface SchoolEvaluationBar {
  chapterId: string
  chapterName: string
  schoolId: string
  name: string
  counts: Record<PartKey, number>
  applicants: Record<PartKey, number>
}

// 지부를 넘어 학교를 한 줄로 편다. 서버가 지부 가나다 > 학교 가나다로 정렬해
// 주므로 순서를 그대로 유지한다(카드는 받은 순서대로 렌더한다).
export function toSchoolEvaluationBars(
  statistics: RecruitingEvaluationStatistics,
): SchoolEvaluationBar[] {
  return statistics.chapters.flatMap((chapter) =>
    chapter.schools.map((school) => ({
      chapterId: chapter.chapterId,
      chapterName: chapter.chapterName,
      schoolId: school.schoolId,
      name: school.schoolName,
      counts: toEvaluatedCountsByPart(school.byTrack),
      applicants: toApplicantCountsByPart(school.byTrack),
    })),
  )
}
