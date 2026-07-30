import type { RecruitingRoundGroup } from "../api/types"

export interface RecruitingScope {
  /** 화면에 올릴 후보 그룹. 권한이 있는 시즌이거나, 없으면 내 학교. */
  groups: RecruitingRoundGroup[]
  chapters: string[]
  schools: string[]
  /** 관리 권한 없이 내 학교로 좁힌 경우. 평가자가 여기에 해당한다. */
  isFallback: boolean
}

const EMPTY: RecruitingScope = {
  groups: [],
  chapters: [],
  schools: [],
  isFallback: false,
}

function summarize(
  groups: RecruitingRoundGroup[],
  isFallback: boolean,
): RecruitingScope {
  if (groups.length === 0) return EMPTY
  return {
    groups,
    chapters: [...new Set(groups.map((group) => group.chapterName))],
    schools: [...new Set(groups.map((group) => group.schoolName))],
    isFallback,
  }
}

// 관리 권한이 있는 시즌이 곧 조회 범위다. 평가자는 시즌 권한이 없어 이 조회에
// 잡히지 않으므로, 권한이 하나도 없으면 내 학교를 후보로 두고 조회를 시도한다.
// 권한이 없는 학교는 카드 단계에서 걸러진다.
export function resolveRecruitingScope(
  groups: RecruitingRoundGroup[],
  permittedSeasonIds: ReadonlySet<string>,
  viewerSchool: string | undefined,
): RecruitingScope {
  const permitted = groups.filter((group) =>
    permittedSeasonIds.has(String(group.seasonId)),
  )
  if (permitted.length > 0) return summarize(permitted, false)

  if (!viewerSchool) return EMPTY
  const mySchool = groups.filter((group) => group.schoolName === viewerSchool)
  return summarize(mySchool, true)
}

/** 지부가 여럿이면 지부 탭으로, 한 지부 안에 학교가 여럿이면 학교 탭으로 가른다. */
export function resolveScopeTabs(scope: RecruitingScope) {
  return {
    showChapterTabs: scope.chapters.length > 1,
    showSchoolTabs: scope.chapters.length === 1 && scope.schools.length > 1,
  }
}

export function applyScopeFilters(
  scope: RecruitingScope,
  chapterTab: string,
  schoolTab: string,
  chapters: string[],
): RecruitingRoundGroup[] {
  const { showChapterTabs, showSchoolTabs } = resolveScopeTabs(scope)

  if (showChapterTabs) {
    if (chapterTab !== "all") {
      return scope.groups.filter((group) => group.chapterName === chapterTab)
    }
    // 전 지부를 한 번에 조회하면 차수 수만큼 요청이 나간다. 지부를 고르게 한다.
    if (chapters.length === 0) return []
    return scope.groups.filter((group) => chapters.includes(group.chapterName))
  }

  if (showSchoolTabs && schoolTab !== "all") {
    return scope.groups.filter((group) => group.schoolName === schoolTab)
  }

  return scope.groups
}
