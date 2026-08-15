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
  RecruitingSeasonConfigurationResponse,
  RecruitingTrack,
} from "../api/types"

export function findSeasonIdBySchool(
  groups: RecruitingRoundGroup[],
  school: string | null | undefined,
  schoolId?: string | null,
): string | undefined {
  if (schoolId) {
    const bySchoolId = groups.find((group) => group.schoolId === schoolId)
    if (bySchoolId) return bySchoolId.seasonId
  }
  return groups.find((group) => formatSchoolName(group.schoolName) === school)
    ?.seasonId
}

// 복제 모달(RecruitmentDuplicateModal)이 보여주는 "복제 대상 학교" 후보. 실제로는
// 학교가 아니라 그 학교의 이번 기수 시즌을 고르는 것이다(POST .../clone이 받는
// targetSeasonId가 시즌 단위라서). RecruitmentListPage가 scope.groups(=EDIT 권한이
// 있는 시즌만 남은 목록)로 만들어 넘긴다 — 시즌이 아직 없거나 EDIT 권한이 없는
// 학교는 애초에 후보에 없다.
export interface DuplicateTargetSeason {
  seasonId: string
  chapter: Chapter
  school: string
}

export function buildDuplicateTargetSeasons(
  groups: RecruitingRoundGroup[],
): DuplicateTargetSeason[] {
  return groups.flatMap((group) =>
    isChapter(group.chapterName)
      ? [
          {
            seasonId: group.seasonId,
            chapter: group.chapterName,
            school: formatSchoolName(group.schoolName),
          },
        ]
      : [],
  )
}

// 여러 학교(시즌)로 한 번에 복제할 때, 학교별로 토스트를 따로 띄우는 대신
// 하나의 집계 토스트(RecruitmentPostMoreMenu)로 보여주기 위한 결과.
export interface DuplicateOutcome {
  succeededCount: number
  failedCount: number
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
  // 마감 여부는 status 가 아니라 이 시각으로 판단한다(isRecruitmentClosed).
  documentEndAt?: string | null
  authorLabel?: string
  // "내가 쓴 글" 필터(RecruitmentDraftArchiveCard)가 useMe()의 me.id와 비교하는 값.
  authorMemberId?: string
  recruitableTracks: RecruitingTrack[]
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

// 라운드별 실제 작성자(round.author)가 있는 표시용 라벨로 조립한다.
// "닉네임/이름 · 학교명" 형태는 RecruitmentListPage가 예전에 로그인한 나로
// 채우던 형태와 동일하게 맞췄다.
function buildAuthorLabel(
  author: RecruitingRound["author"],
): string | undefined {
  if (!author) return undefined
  return `${author.nickname}/${author.name} · ${formatSchoolName(author.schoolName)}`
}

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
    documentEndAt: round.documentEndAt,
    authorLabel: buildAuthorLabel(round.author),
    authorMemberId: round.author?.memberId,
    recruitableTracks: round.recruitableTracks,
  }
}

export function isSeasonTrackCompatible(
  config: RecruitingSeasonConfigurationResponse | undefined,
  requiredTracks: readonly RecruitingTrack[],
): boolean {
  if (!config) return false
  return requiredTracks.every(
    (track) =>
      (config.quotas.find((quota) => quota.track === track)?.targetCount ?? 0) >
      0,
  )
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
  const branchMap = SCHOOLS_BY_BRANCH as Record<string, readonly string[]>
  const schools = branchMap[chapter] ?? []
  return schools.map((school: string) => ({
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
