import DocumentIcon from "@/shared/assets/icon/document/DocumentIcon"
import EditIcon from "@/shared/assets/icon/edit/EditIcon"
import TeamIcon from "@/shared/assets/icon/people/TeamIcon"

import type { FlatNavItem } from "@/shared/config/navigation"

/**
 * 지원자(게스트 포함)가 쓰는 평면 3항목.
 *
 * `지원 방법` 은 아직 단독 라우트가 없다. 지원 폼(`/projects/apply/{roundId}`)
 * 에서 활성으로 표시되어야 하므로 매칭 경로만 두고 이동은 막아 둔다.
 * 안내 페이지가 정해지면 disabled 를 떼고 to 를 그 경로로 바꾼다.
 */
export const APPLICANT_SIDEBAR_ITEMS: FlatNavItem[] = [
  {
    id: "applicant-guide",
    title: "지원 방법",
    to: "/projects/apply",
    icon: EditIcon,
    disabled: true,
  },
  {
    id: "applicant-notice",
    title: "모집 공고",
    to: "/projects/notice",
    icon: TeamIcon,
  },
  {
    id: "applicant-application",
    title: "내 지원서",
    to: "/projects/application",
    icon: DocumentIcon,
  },
]

/** 지원자 사이드바를 붙일 경로. 프로젝트 목록에는 사이드바가 없다. */
export function isApplicantFlowPath(pathname: string): boolean {
  return (
    pathname === "/projects/notice" ||
    pathname.startsWith("/projects/notice/") ||
    pathname.startsWith("/projects/apply") ||
    pathname.startsWith("/projects/application")
  )
}
