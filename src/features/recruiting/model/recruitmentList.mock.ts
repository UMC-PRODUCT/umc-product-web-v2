import {
  RECRUITING_MY_CHAPTER_MOCK,
  RECRUITING_MY_SCHOOL_MOCK,
} from "./applicantList.mock"

import type { RecruitmentPost } from "./recruitmentList"

export { RECRUITING_MY_CHAPTER_MOCK, RECRUITING_MY_SCHOOL_MOCK }

export const RECRUITMENT_LIST_MOCK: RecruitmentPost[] = [
  {
    postId: "1",
    chapter: RECRUITING_MY_CHAPTER_MOCK,
    school: "이화여대",
    title: "이화여대 UMC 11기 정규 모집",
    status: "OPEN",
    startLabel: "2026-07-01 00:00",
    endLabel: "07-14 23:59",
  },
  {
    postId: "2",
    chapter: RECRUITING_MY_CHAPTER_MOCK,
    school: "홍익대 서울",
    title: "홍익대 서울 UMC 11기 정규 모집",
    status: "CLOSED",
    startLabel: "2026-06-01 00:00",
    endLabel: "06-14 23:59",
  },
  {
    postId: "3",
    chapter: RECRUITING_MY_CHAPTER_MOCK,
    school: RECRUITING_MY_SCHOOL_MOCK,
    title: "이화여대 UMC 11기 1차 추가 모집",
    status: "DRAFT",
    dateLabel: "2026-07-20 00:00",
    authorLabel: "이방토/이예원 · 이화여대",
  },
]
