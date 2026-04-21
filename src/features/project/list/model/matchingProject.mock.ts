/** 매칭 프로젝트 카드용 목 데이터 (임시) */

export type MatchingProjectRecruitRow = {
  part: string
  current: number
  total: number
  done?: boolean
}

export type MatchingProjectCoverImage = {
  src: string
  alt?: string
}

export type MatchingProjectMock = {
  id: string
  title: string
  description: string
  authorSchoolLine: string
  coverImage?: MatchingProjectCoverImage | null
  recruitRows: MatchingProjectRecruitRow[]
}

const SHARED_CARD: Omit<MatchingProjectMock, "id" | "coverImage"> = {
  title: "프로젝트명",
  description:
    "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
  authorSchoolLine: "닉네임/이름 · 00대학교",
  recruitRows: [
    { part: "Design", current: 1, total: 1, done: true },
    { part: "Web", current: 0, total: 4 },
    { part: "SpringBoot", current: 0, total: 5 },
  ],
}

/** 목록 그리드, 카드에서 동일하게 사용하는 목 데이터 리스트 */
export const MOCK_MATCHING_PROJECTS: MatchingProjectMock[] = Array.from(
  { length: 6 },
  (_, i) => ({
    id: `mock-matching-${i + 1}`,
    ...SHARED_CARD,
    // 짝수 카드만 샘플 이미지 (임시 방편)
    coverImage:
      i % 2 === 0
        ? {
            src: `https://picsum.photos/seed/umc-matching-${i + 1}/696/368`,
            alt: "프로젝트 대표 이미지",
          }
        : null,
  }),
)

/** 카드 단독 사용 시 기본값 */
export const DEFAULT_MATCHING_PROJECT_MOCK = MOCK_MATCHING_PROJECTS[0]!
