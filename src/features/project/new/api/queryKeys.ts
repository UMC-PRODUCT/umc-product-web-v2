type ProjectListQueryParams = {
  gisuId: number | undefined
  page: number
  keyword: string
  chapterId: string | undefined
  schoolId: string | undefined
  parts: readonly string[]
  partQuotaStatus: string | undefined
}

export const projectKeys = {
  all: ["project"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: ProjectListQueryParams) =>
    [...projectKeys.lists(), params] as const,
  managed: () => [...projectKeys.all, "managed"] as const,
  managedMe: (gisuId: number | undefined) =>
    [...projectKeys.managed(), "me", gisuId] as const,
  managedCheck: (gisuId: number | undefined) =>
    [...projectKeys.managedMe(gisuId), "check"] as const,
  draft: (gisuId: number) =>
    [...projectKeys.all, "draft", "me", gisuId] as const,
  detail: (projectId: number) =>
    [...projectKeys.all, "detail", projectId] as const,
  applicationForm: (projectId: number) =>
    [...projectKeys.all, "application-form", projectId] as const,
  partQuotas: (projectId: number) =>
    [...projectKeys.all, "part-quotas", projectId] as const,
  members: (projectId: number) =>
    [...projectKeys.all, "members", projectId] as const,
} as const

export const gisuKeys = {
  active: ["gisu", "active"] as const,
} as const

export const memberKeys = {
  search: (keyword: string) => ["member", "search", keyword] as const,
} as const
