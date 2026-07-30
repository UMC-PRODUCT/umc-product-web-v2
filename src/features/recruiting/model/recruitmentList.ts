/* 모집 목록 관련 */
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingRoundGroup, RecruitingRoundStatus } from "../api/types"
import type { RecruitingListRole } from "./recruitingListRole"

// 모집 생성(013)에 필요한 seasonId는 화면에서 새로 만드는 게 아니라, 이미
// 존재하는 시즌 목록(공개 차수 목록 응답에 포함됨)에서 학교명으로 찾아 쓴다.
export function findSeasonIdBySchool(
  groups: RecruitingRoundGroup[],
  school: string | null | undefined,
): string | undefined {
  return groups.find((group) => group.schoolName === school)?.seasonId
}

export type RecruitmentPostStatus = RecruitingRoundStatus

// TODO: 백엔드 명세 확인
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

// TODO: API 연동 시 클라이언트 필터링 대신 searchRounds의 chapterId/schoolId 쿼리 파라미터로 대체
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

// TODO: API 연동 시 mock 상수 대신 실제 로그인 사용자의 소속 지부/학교로 채우기
export interface RecruitmentEditScope {
  myChapter?: Chapter
  mySchool?: string
}

// central(SUPER_ADMIN/HQ_LEAD/HQ_ADMIN)은 전체 편집 가능,
// chapterAdmin(CHAPTER_ADMIN)은 본인 지부만, schoolStaff(SCHOOL_ADMIN/SCHOOL_STAFF)는 본인 학교만 편집 가능
export function canEditRecruitmentPost(
  role: RecruitingListRole,
  post: RecruitmentPost,
  scope: RecruitmentEditScope,
): boolean {
  if (role === "central") return true
  if (role === "chapterAdmin") return post.chapter === scope.myChapter
  return post.school === scope.mySchool
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
