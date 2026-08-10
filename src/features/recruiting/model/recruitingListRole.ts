export const RECRUITING_LIST_ROLES = [
  "central",
  "chapterAdmin",
  "schoolStaff",
] as const

export type RecruitingListRole = (typeof RECRUITING_LIST_ROLES)[number]

export function isRecruitingListRole(
  value: unknown,
): value is RecruitingListRole {
  return (
    typeof value === "string" &&
    (RECRUITING_LIST_ROLES as readonly string[]).includes(value)
  )
}
