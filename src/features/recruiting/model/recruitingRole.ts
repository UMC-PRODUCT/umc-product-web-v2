import {
  getViewerBranch,
  isCentralStaff,
  isChapterPresident,
  isSuperAdmin,
} from "@/entities/member/model/identity"

import type { MemberInfoResponse } from "@/entities/member/api/me"

import type { RecruitingListRole } from "./recruitingListRole"

// 지원자 목록의 조회 범위는 역할 타입이 아니라 모집 관리 권한으로 정한다
// (model/recruitingScope.ts). 역할 타입으로 판정하면 서버가 허용하는 범위와
// 어긋나기 때문이다.
//
// 다만 모집 생성 화면은 "조회 범위"가 아니라 지부·학교 선택지를 어디까지 열지에
// 이 값을 쓰고 있어 아직 필요하다. #660 에서 이 함수를 지웠는데 같은 시점에 머지된
// #661 이 사용을 추가해 develop 빌드가 깨져 되살렸다. 모집 생성 화면도 권한 조회로
// 옮기면 그때 함께 제거한다.
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
