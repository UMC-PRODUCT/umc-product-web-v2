import TeamIcon from "@/shared/assets/icon/people/TeamIcon"
import SchoolIcon from "@/shared/assets/icon/school/SchoolIcon"
import SettingIcon from "@/shared/assets/icon/setting/SettingIcon"

import type { FlatNavItem } from "@/shared/config/navigation"

/** 설정 영역은 대분류 없이 평면 3항목이다. */
export const SETTINGS_SIDEBAR_ITEMS: FlatNavItem[] = [
  {
    id: "settings-school",
    title: "학교 관리",
    to: "/manage/school",
    icon: SchoolIcon,
  },
  {
    id: "settings-chapter",
    title: "지부 관리",
    to: "/manage/chapter",
    icon: TeamIcon,
  },
  {
    id: "settings-curriculum",
    title: "커리큘럼",
    to: "/manage/curriculum",
    icon: SettingIcon,
  },
]

/** 헤더 `설정` 탭이 가리키는 곳. 설정 영역의 첫 화면이다. */
export const SETTINGS_ENTRY_PATH = "/manage/school"
