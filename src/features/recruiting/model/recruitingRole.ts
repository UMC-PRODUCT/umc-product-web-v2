import {
  getViewerBranch,
  isCentralStaff,
  isChapterPresident,
  isSchoolStaff,
  isSuperAdmin,
} from "@/entities/member/model/identity"

import type { MemberInfoResponse } from "@/entities/member/api/me"

import type { RecruitingListRole } from "./recruitingListRole"

export function resolveRecruitingListRole(
  me: MemberInfoResponse | undefined,
): RecruitingListRole {
  if (isSuperAdmin(me) || isCentralStaff(me)) return "central"
  if (isChapterPresident(me)) return "chapterAdmin"
  if (isSchoolStaff(me)) return "schoolStaff"
  return "schoolStaff"
}

export function resolveViewerChapter(me: MemberInfoResponse | undefined) {
  return getViewerBranch(me)
}

export function resolveViewerSchool(me: MemberInfoResponse | undefined) {
  return me?.schoolName
}

export function formatGisuLabel(generation: number | string | undefined) {
  if (generation == null) return ""
  return `UMC ${generation}기`
}
