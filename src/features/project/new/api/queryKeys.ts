export const projectKeys = {
  all: ["project"] as const,
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
