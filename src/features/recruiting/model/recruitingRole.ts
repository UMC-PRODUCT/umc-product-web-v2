import {
  getViewerBranch,
  isCentralStaff,
  isChapterPresident,
  isSuperAdmin,
} from "@/entities/member/model/identity"

import type { MemberInfoResponse } from "@/entities/member/api/me"

import type { RecruitingListRole } from "./recruitingListRole"

// 조회 범위는 역할 타입이 아니라 모집 관리 권한으로 정한다(model/recruitingScope.ts).
// 역할 타입으로 판정하면 서버가 허용하는 범위와 어긋난다.
export function resolveViewerChapter(me: MemberInfoResponse | undefined) {
  return getViewerBranch(me)
}

export function resolveViewerSchool(me: MemberInfoResponse | undefined) {
  return me?.schoolName
}

// 이 값은 편집 가능 여부(시즌별 EDIT 권한, useRecruitingPermissions)가 아니라
// 화면 레이아웃(전 지부 조회 vs 내 지부/학교 조회)을 결정하는 용도로만 쓴다.
export function resolveRecruitingListRole(
  me: MemberInfoResponse | undefined,
): RecruitingListRole {
  if (isSuperAdmin(me) || isCentralStaff(me)) return "central"
  if (isChapterPresident(me)) return "chapterAdmin"
  return "schoolStaff"
}

export function formatGisuLabel(generation: number | string | undefined) {
  if (generation == null) return ""
  return `UMC ${generation}기`
}
