import dayjs from "dayjs"

import type { RecruitmentNoticeItem } from "./recruitmentNotice"

const today = dayjs()

const ANNOUNCEMENT =
  "모집 공지\n본문의 최소, 최대 높이 있음. 카드 자체의 최대 높이 있음. 본문 내용이 길어질 경우, 본문 프레임의 우측에 스크롤바 허용."

export const RECRUITMENT_NOTICE_ITEMS_MOCK: RecruitmentNoticeItem[] = [
  {
    id: 1,
    title: "한양대학교 ERICA UMC 11기 정규 모집",
    schoolName: "한양대학교 ERICA",
    parts: ["pm", "design", "web-pe", "mobile-pe"],
    documentStartAt: today.subtract(3, "day").toISOString(),
    documentEndAt: today.add(10, "day").toISOString(),
    isClosed: false,
    dDay: 10,
    announcement: ANNOUNCEMENT,
  },
  {
    id: 2,
    title: "중앙대학교 UMC 11기 정규 모집",
    schoolName: "중앙대학교",
    parts: ["pm", "design", "web-pe", "mobile-pe"],
    documentStartAt: today.subtract(3, "day").toISOString(),
    documentEndAt: today.add(10, "day").toISOString(),
    isClosed: false,
    dDay: 10,
    announcement: ANNOUNCEMENT,
    appliedStatus: "submitted",
  },
  {
    id: 3,
    title: "가천대학교 UMC 11기 2차 추가 모집",
    schoolName: "가천대학교",
    parts: ["design", "web-pe"],
    documentStartAt: today.subtract(3, "day").toISOString(),
    documentEndAt: today.add(10, "day").toISOString(),
    isClosed: false,
    dDay: 10,
    announcement: ANNOUNCEMENT,
    appliedStatus: "draft",
  },
  {
    id: 4,
    title: "동국대학교 UMC 11기 2차 추가 모집 PM, Design 파트",
    schoolName: "동국대학교",
    parts: ["pm", "design"],
    documentStartAt: today.subtract(3, "day").toISOString(),
    documentEndAt: today.add(10, "day").toISOString(),
    isClosed: false,
    dDay: 10,
    announcement: ANNOUNCEMENT,
    appliedStatus: "submittedEditable",
  },
  {
    id: 5,
    title: "서울대학교 UMC 10기 정규 모집",
    schoolName: "서울대학교",
    parts: ["pm", "design", "web-pe", "mobile-pe"],
    documentStartAt: today.subtract(30, "day").toISOString(),
    documentEndAt: today.subtract(15, "day").toISOString(),
    isClosed: true,
    announcement: ANNOUNCEMENT,
  },
  {
    id: 6,
    title: "고려대학교 UMC 10기 2차 추가 모집",
    schoolName: "고려대학교",
    parts: ["web-pe", "mobile-pe"],
    documentStartAt: today.subtract(20, "day").toISOString(),
    documentEndAt: today.subtract(5, "day").toISOString(),
    isClosed: true,
    announcement: ANNOUNCEMENT,
  },
]
