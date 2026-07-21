import { RECRUITING_MY_CHAPTER_MOCK } from "./applicantList.mock"

import type { RecruitmentPost } from "./recruitmentList"

export { RECRUITING_MY_CHAPTER_MOCK }

export const RECRUITMENT_LIST_MOCK: RecruitmentPost[] = [
  {
    postId: "1",
    chapter: RECRUITING_MY_CHAPTER_MOCK,
    school: "이화여대",
    title: "이화여대 UMC 11기 정규 모집",
    status: "recruiting",
    startLabel: "2026-07-01 00:00",
    endLabel: "07-14 23:59",
  },
]
