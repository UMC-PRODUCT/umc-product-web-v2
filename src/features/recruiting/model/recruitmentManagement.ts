// TODO: 모집 인원 설정(quota) 페이지 작업 시 "quota" 추가
export const RECRUITMENT_MANAGEMENT_PAGES = ["new", "list"] as const

export type RecruitmentManagementPage =
  (typeof RECRUITMENT_MANAGEMENT_PAGES)[number]

export const RECRUITMENT_MANAGEMENT_PAGE_LABEL: Record<
  RecruitmentManagementPage,
  string
> = {
  new: "모집 생성",
  list: "모집 목록",
}
