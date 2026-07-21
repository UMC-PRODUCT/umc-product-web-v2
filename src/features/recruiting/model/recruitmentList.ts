/* 모집 목록 관련 */
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

import type { Chapter } from "@/entities/organization/model/chapters"

// RecruitingRoundStatus (백엔드 RoundResponse.status)와 동일한 값
export type RecruitmentPostStatus = "DRAFT" | "OPEN" | "CLOSED"

export interface RecruitmentPost {
  postId: string
  chapter: Chapter
  school: string
  title: string
  status: RecruitmentPostStatus
  startLabel?: string
  endLabel?: string
  dateLabel?: string
  authorLabel?: string
}

export interface ChapterPostGroup {
  chapter: Chapter
  posts: RecruitmentPost[]
}

export function groupPostsByChapter(
  posts: RecruitmentPost[],
  chapters: Chapter[],
): ChapterPostGroup[] {
  return chapters.map((chapter) => ({
    chapter,
    posts: posts.filter((post) => post.chapter === chapter),
  }))
}

export interface SchoolPostGroup {
  school: string
  posts: RecruitmentPost[]
}

export function groupPostsBySchool(
  posts: RecruitmentPost[],
  chapter: Chapter,
): SchoolPostGroup[] {
  return SCHOOLS_BY_BRANCH[chapter].map((school) => ({
    school,
    posts: posts.filter((post) => post.school === school),
  }))
}

export const RECRUITMENT_SORT_OPTIONS = [
  { value: "NEWEST", label: "최신 순" },
  { value: "REGISTERED", label: "등록 순" },
  { value: "RECRUITMENT", label: "모집 순" },
] as const

export type RecruitmentSort = (typeof RECRUITMENT_SORT_OPTIONS)[number]["value"]

// -----------------------------------------------------------------------------
// GET /api/v1/recruiting/admin/rounds
// -----------------------------------------------------------------------------

export type RecruitmentRoundType = "REGULAR" | "ADDITIONAL"

export type RecruitmentTrack =
  | "PLAN"
  | "DESIGN"
  | "WEB_PRODUCT_ENGINEER"
  | "MOBILE_PRODUCT_ENGINEER"
  | "INFRA_PLUS"

export interface RecruitmentRound {
  id: number
  title: string
  type: RecruitmentRoundType
  roundNo: number
  status: RecruitmentPostStatus
  recruitableTracks: RecruitmentTrack[]
  secondChoiceEnabled: boolean
  documentStartAt: string
  documentEndAt: string
  documentResultPublishedAt: string
  interviewRequired: boolean
  interviewStartAt: string
  interviewEndAt: string
  finalResultPublishedAt: string
  availabilityFormId: number
  announcement: string
  contactText: string
}

export interface RecruitmentSeason {
  seasonId: number
  gisuId: number
  chapterId: number
  chapterName: string
  schoolId: number
  schoolName: string
  memo: string
  rounds: RecruitmentRound[]
}
