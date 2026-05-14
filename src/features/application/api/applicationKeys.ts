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
}
