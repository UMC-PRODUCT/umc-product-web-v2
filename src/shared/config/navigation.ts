import TeamIcon from "@/shared/assets/icon/people/TeamIcon"

import type { ComponentType, SVGProps } from "react"

export interface SideBarMenu {
  id: string
  title: string
  to: string
}

export interface SideBarSection {
  id: string
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  menus: SideBarMenu[]
}

export const SIDEBAR_ITEMS: SideBarSection[] = [
  {
    id: "project-settings",
    title: "프로젝트 설정",
    icon: TeamIcon,
    menus: [
      {
        id: "project-announce",
        title: "공지",
        to: "/matching/projects/announce",
      },
      {
        id: "project-register",
        title: "프로젝트 등록",
        to: "/matching/projects/new",
      },
    ],
  },
  {
    id: "team-matching",
    title: "팀 매칭",
    icon: TeamIcon,
    menus: [
      { id: "matching-announce", title: "공지", to: "/matching" },
      {
        id: "matching-projects",
        title: "프로젝트 목록",
        to: "/matching/projects",
      },
      {
        id: "matching-applications",
        title: "지원 현황",
        to: "/matching/applications",
      },
      {
        id: "matching-rounds",
        title: "매칭 차수 설정",
        to: "/matching/rounds",
      },
    ],
  },
]

export const SIDEBAR_ID = {
  section: {
    projectSettings: "project-settings",
    teamMatching: "team-matching",
  },
  item: {
    projectAnnounce: "project-announce",
    projectRegister: "project-register",
    matchingAnnounce: "matching-announce",
    matchingProjects: "matching-projects",
    matchingApplications: "matching-applications",
    matchingRounds: "matching-rounds",
  },
} as const

export type SideBarSectionId =
  (typeof SIDEBAR_ID.section)[keyof typeof SIDEBAR_ID.section]
export type SideBarMenuId =
  (typeof SIDEBAR_ID.item)[keyof typeof SIDEBAR_ID.item]

export const SIDEBAR_MENU_BY_ID = new Map<string, SideBarMenu>(
  SIDEBAR_ITEMS.flatMap((section) =>
    section.menus.map((menu) => [menu.id, menu] as const),
  ),
)

export const SIDEBAR_SECTION_BY_ID = new Map<string, SideBarSection>(
  SIDEBAR_ITEMS.map((section) => [section.id, section] as const),
)
