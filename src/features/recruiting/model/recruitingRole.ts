import { getViewerBranch } from "@/entities/member/model/identity"

import type { MemberInfoResponse } from "@/entities/member/api/me"

// 조회 범위는 역할 타입이 아니라 모집 관리 권한으로 정한다(model/recruitingScope.ts).
// 역할 타입으로 판정하면 서버가 허용하는 범위와 어긋난다.
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
