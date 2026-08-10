import { useMemo } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import {
  isCentralStaff,
  isRecruitingEditor,
  isSuperAdmin,
} from "@/entities/member/model/identity"
import { RECRUITING_SIDEBAR_ITEMS } from "@/shared/config/recruitingNavigation"

import type { MemberInfoResponse } from "@/entities/member/api/me"
import type { RecruitingSideBarSection } from "@/shared/config/recruitingNavigation"

/** 평가 이력은 중앙 운영진만 조회할 수 있고 나머지는 서버가 403 을 준다. */
const CENTRAL_ONLY_SECTION_IDS = new Set(["recruiting-history"])

/**
 * 고칠 수 있는 사람만 볼 메뉴.
 *
 * 학교 파트장·기타 운영진은 모집을 읽을 수는 있어도 만들거나 평가 운영은 못
 * 한다(서버가 403). 열어 두면 눌러서 빈 화면이나 에러를 만난다.
 */
const EDITOR_ONLY_SECTION_IDS = new Set(["recruiting-evaluations"])
const EDITOR_ONLY_MENU_IDS = new Set(["recruiting-recruitments-new"])

export function filterRecruitingSections(
  sections: readonly RecruitingSideBarSection[],
  { isCentral, canEdit }: { isCentral: boolean; canEdit: boolean },
): RecruitingSideBarSection[] {
  return sections
    .filter((section) => isCentral || !CENTRAL_ONLY_SECTION_IDS.has(section.id))
    .filter((section) => canEdit || !EDITOR_ONLY_SECTION_IDS.has(section.id))
    .map((section) => {
      if (canEdit) return section
      const menus = section.menus.filter(
        (menu) => !EDITOR_ONLY_MENU_IDS.has(menu.id),
      )
      return menus.length === section.menus.length
        ? section
        : { ...section, menus }
    })
    .filter((section) => section.menus.length > 0)
}

export function isCentralViewer(me: MemberInfoResponse | undefined): boolean {
  return isSuperAdmin(me) || isCentralStaff(me)
}

export function useVisibleRecruitingSections() {
  const { data: me } = useMe()
  const isCentral = isCentralViewer(me)
  const canEdit = isRecruitingEditor(me)

  return useMemo(
    () =>
      filterRecruitingSections(RECRUITING_SIDEBAR_ITEMS, {
        isCentral,
        canEdit,
      }),
    [isCentral, canEdit],
  )
}
