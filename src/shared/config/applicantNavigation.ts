import TeamIcon from "@/shared/assets/icon/people/TeamIcon"

import type { FlatNavItem } from "@/shared/config/navigation"

/**
 * 지원자(게스트 포함)가 쓰는 평면 3항목.
 *
 * 아이콘 셋이 같은 것은 시안을 따른 결과다. 뜻이 다른 메뉴가 같은 그림을 쓰고
 * 있어 디자이너에게 확인을 요청해 둔 상태다.
 */
export const APPLICANT_SIDEBAR_ITEMS: FlatNavItem[] = [
  {
    id: "applicant-guide",
    title: "지원 방법",
    to: "/projects/apply-guide",
    // 지원 폼은 안내를 읽고 들어가는 다음 걸음이라 같은 항목이 켜진 채로 둔다.
    matchPaths: ["/projects/apply"],
    icon: TeamIcon,
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
    icon: TeamIcon,
  },
]

const APPLICANT_FLOW_BASE_PATHS = [
  "/projects/apply-guide",
  "/projects/notice",
  "/projects/apply",
  "/projects/application",
] as const

/**
 * 지원자 사이드바를 붙일 경로. 프로젝트 목록에는 사이드바가 없다.
 *
 * 세그먼트 경계까지 봐야 한다. 접두사만 보면 `/projects/applications` 처럼
 * 이름이 겹치는 다른 화면이 생기는 순간 지원 흐름으로 딸려 들어온다.
 */
export function isApplicantFlowPath(pathname: string): boolean {
  return APPLICANT_FLOW_BASE_PATHS.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  )
}
