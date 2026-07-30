import {
  getViewerBranch,
  isCentralStaff,
  isChapterPresident,
  isSuperAdmin,
} from "@/entities/member/model/identity"

import type { MemberInfoResponse } from "@/entities/member/api/me"

import type { RecruitingListRole } from "./recruitingListRole"

// 목록 조회 범위는 역할 타입이 아니라 모집 관리 권한으로 정한다(model/recruitingScope.ts).
// 이 함수는 그 조회 범위용이 아니라, 모집 생성 폼에서 로그인한 사용자의 역할에 따라
// 지부·학교 입력을 자유선택/고정으로 나누는 용도로 쓴다.
export function resolveRecruitingListRole(
  me: MemberInfoResponse | undefined,
): RecruitingListRole {
  if (isSuperAdmin(me) || isCentralStaff(me)) return "central"
  if (isChapterPresident(me)) return "chapterAdmin"
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
