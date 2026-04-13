import TeamIcon from "@/assets/icon/people/TeamIcon"

import type { ComponentType, SVGProps } from "react"

interface SideBarMenu {
  title: string
  to: string
}

export interface SideBarSection {
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  menus: SideBarMenu[]
}

export const SIDEBAR_ITEMS: SideBarSection[] = [
  {
    title: "프로젝트 설정",
    icon: TeamIcon,
    menus: [
      { title: "공지", to: "/test/sidebar/project-notice" },
      { title: "프로젝트 등록", to: "/test/sidebar/project-register" },
    ],
  },
  {
    title: "팀 매칭",
    icon: TeamIcon,
    menus: [
      { title: "공지", to: "/test/sidebar/matching-notice" },
      { title: "프로젝트 목록", to: "/test/sidebar/project-list" },
      { title: "지원 현황", to: "/test/sidebar/application-status" },
      { title: "매칭 차수 설정", to: "/test/sidebar/matching-round" },
    ],
  },
]
