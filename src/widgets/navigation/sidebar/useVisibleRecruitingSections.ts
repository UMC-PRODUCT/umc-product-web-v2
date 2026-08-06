import { useMemo } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { isCentralStaff, isSuperAdmin } from "@/entities/member/model/identity"
import { RECRUITING_SIDEBAR_ITEMS } from "@/shared/config/recruitingNavigation"

import type { MemberInfoResponse } from "@/entities/member/api/me"
import type { RecruitingSideBarSection } from "@/shared/config/recruitingNavigation"

/** 평가 이력은 중앙 운영진만 조회할 수 있고 나머지는 서버가 403 을 준다. */
const CENTRAL_ONLY_SECTION_IDS = new Set(["recruiting-history"])

export function filterRecruitingSections(
  sections: readonly RecruitingSideBarSection[],
  { isCentral }: { isCentral: boolean },
): RecruitingSideBarSection[] {
  return sections.filter(
    (section) => isCentral || !CENTRAL_ONLY_SECTION_IDS.has(section.id),
  )
}

export function isCentralViewer(me: MemberInfoResponse | undefined): boolean {
  return isSuperAdmin(me) || isCentralStaff(me)
}

export function useVisibleRecruitingSections() {
  const { data: me } = useMe()
  const isCentral = isCentralViewer(me)

  return useMemo(
    () => filterRecruitingSections(RECRUITING_SIDEBAR_ITEMS, { isCentral }),
    [isCentral],
  )
}
