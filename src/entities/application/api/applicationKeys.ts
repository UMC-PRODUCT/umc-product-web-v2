export const applicationKeys = {
  all: ["applications"] as const,

  managedProjects: (gisuId: number) =>
    [...applicationKeys.all, "managed", gisuId] as const,

  allProjects: (gisuId: number, chapterId?: number) =>
    [...applicationKeys.all, "all-projects", gisuId, chapterId] as const,

  applicants: (projectId: number) =>
    [...applicationKeys.all, "applicants", projectId] as const,

  applicantDetail: (projectId: number, applicationId: number) =>
    [...applicationKeys.all, "detail", projectId, applicationId] as const,

  matchingRounds: (chapterId?: number) =>
    [...applicationKeys.all, "rounds", chapterId] as const,

  chapters: () => [...applicationKeys.all, "chapters"] as const,

  // 매칭 현황 페이지 전용
  matchingParts: (gisuId: number, chapterId?: number) =>
    [...applicationKeys.all, "matching-parts", gisuId, chapterId] as const,

  matchingApplicants: (
    gisuId: number,
    chapterId?: number,
    projectIds?: string[],
  ) =>
    [
      ...applicationKeys.all,
      "matching-applicants",
      gisuId,
      chapterId,
      projectIds,
    ] as const,

  matchingMembers: (
    gisuId: number,
    chapterId?: number,
    projectIds?: string[],
  ) =>
    [
      ...applicationKeys.all,
      "matching-members",
      gisuId,
      chapterId,
      projectIds,
    ] as const,

  // 통계 API
  chapterStatistics: (chapterId: number) =>
    [...applicationKeys.all, "statistics", "chapter", chapterId] as const,

  // 매칭 현황 집계 (PROJECT-STAT-003) - 응답 shape이 달라 chapterStatistics와 분리
  matchingMatchings: (chapterId: number) =>
    [...applicationKeys.all, "statistics", "matchings", chapterId] as const,

  // 프로젝트 단위 capability (PROJECT-PERMISSIONS-001)
  projectsPermissions: (ids: string[]) =>
    [...applicationKeys.all, "projects-permissions", [...ids].sort()] as const,
}
