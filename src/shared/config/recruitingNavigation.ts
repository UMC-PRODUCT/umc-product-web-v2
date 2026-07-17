import TeamIcon from "@/shared/assets/icon/people/TeamIcon"

import type { SideBarSection } from "@/shared/config/navigation"

export interface RecruitingSideBarSection extends SideBarSection {
  to?: string
}

export const RECRUITING_GISU_LABEL = "UMC 10th"

export const RECRUITING_SIDEBAR_ITEMS: RecruitingSideBarSection[] = [
  {
    id: "recruiting-dashboard",
    title: "대시보드",
    icon: TeamIcon,
    menus: [
      {
        id: "recruiting-dashboard-applications",
        title: "지원 현황",
        to: "/recruiting/dashboard/applications",
      },
      {
        id: "recruiting-dashboard-evaluations",
        title: "평가 현황",
        to: "/recruiting/dashboard/evaluations",
      },
    ],
  },
  {
    id: "recruiting-recruitments",
    title: "모집 관리",
    icon: TeamIcon,
    menus: [
      {
        id: "recruiting-recruitments-new",
        title: "모집 생성",
        to: "/recruiting/recruitments/new",
      },
      {
        id: "recruiting-recruitments-list",
        title: "모집 목록",
        to: "/recruiting/recruitments",
      },
      {
        id: "recruiting-recruitments-quota",
        title: "모집 인원 설정",
        to: "/recruiting/recruitments/quota",
      },
    ],
  },
  {
    id: "recruiting-evaluations",
    title: "평가 관리",
    icon: TeamIcon,
    menus: [
      {
        id: "recruiting-evaluations-assignment",
        title: "평가 담당자 배정",
        to: "/recruiting/evaluations/assignment",
      },
      {
        id: "recruiting-evaluations-document",
        title: "서류 전형",
        to: "/recruiting/evaluations/document",
      },
      {
        id: "recruiting-evaluations-interview",
        title: "면접 전형",
        to: "/recruiting/evaluations/interview",
      },
      {
        id: "recruiting-evaluations-final",
        title: "최종 평가",
        to: "/recruiting/evaluations/final",
      },
    ],
  },
  {
    id: "recruiting-history",
    title: "히스토리",
    icon: TeamIcon,
    to: "/recruiting/history",
    menus: [],
  },
]

export function resolveRecruitingSectionId(pathname: string) {
  for (const section of RECRUITING_SIDEBAR_ITEMS) {
    if (
      section.to &&
      (pathname === section.to || pathname.startsWith(`${section.to}/`))
    ) {
      return section.id
    }
    const matched = section.menus.some(
      (menu) => pathname === menu.to || pathname.startsWith(`${menu.to}/`),
    )
    if (matched) return section.id
  }
  return undefined
}
