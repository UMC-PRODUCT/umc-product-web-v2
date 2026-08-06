/* 모집 목록 관련 */
import dayjs from "dayjs"

import { isChapter } from "@/entities/organization/model/chapters"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"

import type { Chapter } from "@/entities/organization/model/chapters"

import type {
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingRoundStatus,
  RecruitingRoundType,
} from "../api/types"

// 모집 생성(013)에 필요한 seasonId는 화면에서 새로 만드는 게 아니라, 이미
// 존재하는 시즌 목록(관리자용 차수 목록 응답에 포함됨)에서 찾아 쓴다.
// schoolId가 있으면 그걸 우선 쓴다 — schoolName은 조직 서비스(학교 드롭다운)와
// 모집 서비스(시즌 목록)가 각자 따로 관리하는 문자열이라, 표기가 살짝만
// 달라도(공백·축약 등) 일치 비교가 깨져 시즌이 있는데도 못 찾는 경우 대비
export function findSeasonIdBySchool(
  groups: RecruitingRoundGroup[],
  school: string | null | undefined,
  schoolId?: string | null,
): string | undefined {
  if (schoolId) {
    const bySchoolId = groups.find((group) => group.schoolId === schoolId)
    if (bySchoolId) return bySchoolId.seasonId
  }
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
  authorLabel?: string,
): RecruitmentPost[] {
  return groups.flatMap((group) => {
    if (!isChapter(group.chapterName)) return []
    const chapter = group.chapterName
    return group.rounds
      .filter(
        (round): round is RecruitingRound & { status: RecruitingRoundStatus } =>
          round.status != null,
      )
      .map((round) => mapRoundToPost(group, chapter, round, authorLabel))
  })
}

function mapRoundToPost(
  group: RecruitingRoundGroup,
  chapter: Chapter,
  round: RecruitingRound & { status: RecruitingRoundStatus },
  authorLabel?: string,
): RecruitmentPost {
  const start = round.documentStartAt ? dayjs(round.documentStartAt) : null
  const end = round.documentEndAt ? dayjs(round.documentEndAt) : null

  return {
    postId: round.roundId,
    seasonId: group.seasonId,
    chapter,
    // SCHOOLS_BY_BRANCH(SchoolTabs 등 세그먼트가 쓰는 축약형)와 비교 가능하도록
    // 백엔드 정식 명칭("동국대학교")을 여기서 축약형("동국대")으로 통일한다.
    school: formatSchoolName(group.schoolName),
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
    authorLabel,
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
