import TeamIcon from "@/shared/assets/icon/people/TeamIcon"

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
      { title: "공지", to: "/matching/projects/announce" },
      { title: "프로젝트 등록", to: "/matching/projects/new" },
    ],
  },
  {
    title: "팀 매칭",
    icon: TeamIcon,
    menus: [
      { title: "공지", to: "/matching" },
      { title: "프로젝트 목록", to: "/matching/projects" },
      { title: "지원 현황", to: "/matching" },
      { title: "매칭 차수 설정", to: "/matching" },
    ],
  },
]
