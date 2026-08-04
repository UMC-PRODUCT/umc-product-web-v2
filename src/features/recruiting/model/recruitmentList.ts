/* 모집 목록 관련 */
import dayjs from "dayjs"

import { isChapter } from "@/entities/organization/model/chapters"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

import type { Chapter } from "@/entities/organization/model/chapters"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingRoundStatus,
  RecruitingRoundType,
} from "../api/types"

// 모집 생성(013)에 필요한 seasonId는 화면에서 새로 만드는 게 아니라, 이미
// 존재하는 시즌 목록(공개 차수 목록 응답에 포함됨)에서 학교명으로 찾아 쓴다.
export function findSeasonIdBySchool(
  groups: RecruitingRoundGroup[],
  school: string | null | undefined,
): string | undefined {
  return groups.find((group) => group.schoolName === school)?.seasonId
}

export type RecruitmentPostStatus = RecruitingRoundStatus

export interface RecruitmentPost {
  postId: string
  // 편집 권한은 게시글이 아니라 시즌(학교×기수) 단위로 판정된다(canEditRecruitmentPost).
  seasonId: string
  chapter: Chapter
  school: string
  title: string
  status: RecruitmentPostStatus
  // 복제(cloneRecruitingRound) 요청에 필요하다.
  type: RecruitingRoundType
  roundNo: number
  startLabel?: string
  endLabel?: string
  dateLabel?: string
  // 백엔드 응답에 작성자 정보가 없어 mock에서만 채워진다.
  authorLabel?: string
}

// GET /admin/rounds(RecruitingRoundGroup[])는 OPEN/CLOSED/DRAFT가 한 배열에
// 섞여서 온다. DRAFT만 걸러주는 별도 API가 없어, 공개 목록(모집 공고 카드)과
// 임시 보관함(DRAFT)의 구분은 이 변환 결과를 status로 나눠 쓰는 화면
// (RecruitmentPostListCard/RecruitmentDraftArchiveCard) 쪽 책임이다.
// 주의: /admin/rounds는 학교 회장단 이상만 조회 가능해, 그 미만(SCHOOL_STAFF 등)은
// 이 목록 자체를 받지 못한다(useAdminRecruitingRounds의 isForbidden 참고).
export function mapRoundGroupsToPosts(
  groups: RecruitingRoundGroup[],
): RecruitmentPost[] {
  return groups.flatMap((group) => {
    if (!isChapter(group.chapterName)) return []
    const chapter = group.chapterName
    return group.rounds
      .filter(
        (round): round is RecruitingRound & { status: RecruitingRoundStatus } =>
          round.status != null,
      )
      .map((round) => mapRoundToPost(group, chapter, round))
  })
}

// 백엔드 응답에 작성자 정보가 없어 authorLabel은 항상 비어 있다.
function mapRoundToPost(
  group: RecruitingRoundGroup,
  chapter: Chapter,
  round: RecruitingRound & { status: RecruitingRoundStatus },
): RecruitmentPost {
  const start = round.documentStartAt ? dayjs(round.documentStartAt) : null
  const end = round.documentEndAt ? dayjs(round.documentEndAt) : null

  return {
    postId: round.roundId,
    seasonId: group.seasonId,
    chapter,
    school: group.schoolName,
    title: round.title,
    status: round.status,
    type: round.type,
    roundNo: round.roundNo,
    startLabel: start?.format("YYYY-MM-DD HH:mm"),
    endLabel: end
      ? end.format(
          start && start.isSame(end, "year")
            ? "MM-DD HH:mm"
            : "YYYY-MM-DD HH:mm",
        )
      : undefined,
    dateLabel: start?.format("YYYY.MM.DD"),
  }
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

// 편집 권한은 역할 타입이 아니라 시즌 단위 EDIT 권한(useRecruitingPermissions)으로 정한다.
// 역할 타입으로 판정하면 서버가 허용하는 범위와 어긋난다(recruitingRole.ts 참고).
export function canEditRecruitmentPost(
  post: RecruitmentPost,
  permittedSeasonIds: ReadonlySet<string>,
): boolean {
  return permittedSeasonIds.has(post.seasonId)
}

export const RECRUITMENT_SORT_OPTIONS = [
  { value: "NEWEST", label: "최신 순" },
  { value: "REGISTERED", label: "등록 순" },
  { value: "RECRUITMENT", label: "모집 순" },
] as const

export type RecruitmentSort = (typeof RECRUITMENT_SORT_OPTIONS)[number]["value"]

// 모집 생성 폼(Step1)이 쓰는 타입. api/types.ts의 RecruitingRoundType과 값이
// 같지만 이 파일이 먼저 있었고 폼 스토어 여러 곳이 이미 이 이름을 참조하고 있어
// 그대로 둔다(리네이밍은 별도 리팩터로 분리).
export type RecruitmentRoundType = "REGULAR" | "ADDITIONAL"
