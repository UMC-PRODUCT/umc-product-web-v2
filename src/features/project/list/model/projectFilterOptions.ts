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

export { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

export const PART_OPTIONS: ProjectFilterOption[] = [
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
