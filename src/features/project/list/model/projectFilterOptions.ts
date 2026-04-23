export type ProjectFilterOption = {
  value: string
  label: string
}

export const BRANCH_OPTIONS: ProjectFilterOption[] = [
  { value: "Chromium", label: "Chromium" },
  { value: "Ferrum", label: "Ferrum" },
  { value: "Neon", label: "Neon" },
  { value: "Platinum", label: "Platinum" },
  { value: "Selenium", label: "Selenium" },
  { value: "Xenon", label: "Xenon" },
]

export const SCHOOLS_BY_BRANCH = {
  Chromium: ["광운대", "동양미래대", "서울여대", "한국공학대", "한국외대"],
  Ferrum: ["동국대", "이화여대", "홍익대 서울", "홍익대 세종"],
  Neon: ["가천대", "동덕여대", "숙명여대", "인하대", "한국항공대"],
  Platinum: ["동아대", "영남대", "인제대"],
  Selenium: ["서경대", "성신여대", "숭실대", "안양대", "한양대 ERICA"],
  Xenon: ["가톨릭대", "단국대", "덕성여대", "중앙대", "한성대"],
} as const

export const PART_OPTIONS: ProjectFilterOption[] = [
  { value: "Design", label: "Design" },
  { value: "Web", label: "Web" },
  { value: "iOS", label: "iOS" },
  { value: "Android", label: "Android" },
  { value: "SpringBoot", label: "SpringBoot" },
  { value: "Node.js", label: "Node.js" },
]

export const RECRUIT_STATUS_OPTIONS: ProjectFilterOption[] = [
  { value: "recruiting", label: "모집 중" },
  { value: "completed", label: "모집 완료" },
]

export function getSchoolOptionsByBranch(
  branch?: string,
): ProjectFilterOption[] {
  if (!branch) return []
  const schools = SCHOOLS_BY_BRANCH[branch as keyof typeof SCHOOLS_BY_BRANCH]
  if (!schools) return []
  return schools.map((school) => ({ value: school, label: school }))
}
