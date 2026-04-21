// 매칭 프로젝트 카드용 목 데이터 (임시)

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
  branch: string
  school: string
  title: string
  description: string
  authorSchoolLine: string
  coverImage?: MatchingProjectCoverImage | null
  recruitRows: MatchingProjectRecruitRow[]
}

/** 목록 그리드, 카드에서 동일하게 사용하는 목 데이터 리스트 */
export const MOCK_MATCHING_PROJECTS: MatchingProjectMock[] = [
  {
    id: "mock-matching-1",
    branch: "Selenium",
    school: "한양대 ERICA",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
    authorSchoolLine: "닉네임/이름 · 한양대 ERICA",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-1/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Design", current: 1, total: 1, done: true },
      { part: "Web", current: 0, total: 4 },
      { part: "SpringBoot", current: 0, total: 5 },
    ],
  },
  {
    id: "mock-matching-2",
    branch: "Selenium",
    school: "숭실대",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
    authorSchoolLine: "닉네임/이름 · 숭실대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 1, total: 1, done: true },
      { part: "Web", current: 0, total: 3 },
      { part: "Node.js", current: 0, total: 2 },
    ],
  },
  {
    id: "mock-matching-3",
    branch: "Chromium",
    school: "한국외대",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
    authorSchoolLine: "닉네임/이름 · 한국외대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-3/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Design", current: 1, total: 1, done: true },
      { part: "iOS", current: 1, total: 3 },
      { part: "SpringBoot", current: 2, total: 3 },
    ],
  },
  {
    id: "mock-matching-4",
    branch: "Ferrum",
    school: "이화여대",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
    authorSchoolLine: "닉네임/이름 · 이화여대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 2, total: 2, done: true },
      { part: "Android", current: 2, total: 2, done: true },
      { part: "Node.js", current: 2, total: 2, done: true },
    ],
  },
  {
    id: "mock-matching-5",
    branch: "Neon",
    school: "인하대",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
    authorSchoolLine: "닉네임/이름 · 인하대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-5/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Web", current: 1, total: 2 },
      { part: "Android", current: 0, total: 3 },
      { part: "Node.js", current: 0, total: 2 },
    ],
  },
  {
    id: "mock-matching-6",
    branch: "Xenon",
    school: "중앙대",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 프로젝트 한 줄 소개가 표시됩니다. 두 줄 이상의 내용은 ... 처리됩니다.",
    authorSchoolLine: "닉네임/이름 · 중앙대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 1, total: 1, done: true },
      { part: "iOS", current: 0, total: 2 },
      { part: "SpringBoot", current: 0, total: 2 },
    ],
  },
]

/** 카드 단독 사용 시 기본값 */
export const DEFAULT_MATCHING_PROJECT_MOCK = MOCK_MATCHING_PROJECTS[0]!
