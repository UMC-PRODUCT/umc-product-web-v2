import { SCHOOLS_BY_BRANCH } from "./projectFilterOptions"

import type { MatchingProject, ProjectRecruitRow } from "./matchingProject"

export type { MatchingProject, ProjectRecruitRow }

/** @deprecated Use MatchingProject */
export type MatchingProjectMock = MatchingProject
/** @deprecated Use ProjectRecruitRow */
export type MatchingProjectRecruitRow = ProjectRecruitRow

/** `SCHOOLS_BY_BRANCH` 기준 추가 목 카드 생성 */
function buildBulkMatchingMocks(
  from: number,
  to: number,
): MatchingProjectMock[] {
  const pairs = (
    Object.entries(SCHOOLS_BY_BRANCH) as [
      keyof typeof SCHOOLS_BY_BRANCH,
      readonly string[],
    ][]
  ).flatMap(([branch, schools]) =>
    schools.map((school) => ({ branch: branch as string, school })),
  )

  const recruitPresets: MatchingProjectRecruitRow[][] = [
    [
      { part: "Design", current: 1, total: 2 },
      { part: "Web", current: 1, total: 4 },
      { part: "Node.js", current: 0, total: 3 },
    ],
    [
      { part: "Design", current: 0, total: 2 },
      { part: "iOS", current: 2, total: 3 },
      { part: "Android", current: 1, total: 3 },
    ],
    [
      { part: "Web", current: 3, total: 5 },
      { part: "SpringBoot", current: 2, total: 4 },
      { part: "Node.js", current: 1, total: 2 },
    ],
    [
      { part: "Design", current: 2, total: 2, done: true },
      { part: "Web", current: 2, total: 2, done: true },
      { part: "SpringBoot", current: 2, total: 2, done: true },
    ],
    [
      { part: "Design", current: 0, total: 2 },
      { part: "Web", current: 0, total: 4 },
      { part: "SpringBoot", current: 0, total: 5 },
    ],
  ]

  const projects: MatchingProjectMock[] = []
  for (let n = from; n <= to; n++) {
    const pair = pairs[(n - from) % pairs.length]!
    const { branch, school } = pair
    projects.push({
      id: `mock-matching-${n}`,
      branch,
      school,
      title: `데모 프로젝트 ${n}`,
      description: `${school} · ${branch} 지부 연합 데모 목 데이터입니다.`,
      authorSchoolLine: `닉네임/이름 · ${school}`,
      coverImage:
        n % 3 !== 0
          ? {
              src: `https://picsum.photos/seed/umc-matching-${n}/696/368`,
              alt: "프로젝트 대표 이미지",
            }
          : null,
      recruitRows: recruitPresets[(n - from) % recruitPresets.length]!,
    })
  }
  return projects
}

const RAW_MOCK_PROJECTS: MatchingProjectMock[] = [
  {
    id: "mock-matching-1",
    branch: "Selenium",
    school: "한양대 ERICA",
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 초과 내용 ... 처리 없이 설명 전문이 표시됩니다. 본문 내용 공백 포함 200자 이내 약 4줄 표시됩니다. 프로젝트 한 줄 소개가 여기에 표시됩니다. 초과 내용 ... 처리 없이 설명 전문이 표시됩니다. 본문 내용 공백 포함 200자 이내 약 4줄 표시됩니다. 프로젝트 한줄 소개가 여기에 표시됩니다. 초과 내용 ... 처리 없이 설명 전문이 표시됩",
    authorSchoolLine: "닉네임/이름 · 한양대 ERICA",
    externalLink: "https://issac.app",
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
  // 내 지원서 확인하기용
  {
    id: "mock-matching-2",
    branch: "Selenium",
    school: "숭실대",
    isApplied: true,
    title: "프로젝트명",
    description:
      "프로젝트 한 줄 소개가 여기에 표시됩니다. 초과 내용 ... 처리 없이 설명 전문이 표시됩니다. 본문 내용 공백 포함 200자 이내 약 4줄 표시됩니다. 프로젝트 한 줄 소개가 여기에 표시됩니다. ",
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
  {
    id: "mock-matching-7",
    branch: "Chromium",
    school: "광운대",
    title: "UMC 챌린저 모임",
    description:
      "광운대 기반 크로스 플랫폼 프로젝트입니다. 디자인 시스템과 협업 워크플로를 연습합니다.",
    authorSchoolLine: "닉네임/이름 · 광운대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-7/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Design", current: 0, total: 2 },
      { part: "Web", current: 1, total: 4 },
      { part: "SpringBoot", current: 0, total: 3 },
    ],
  },
  {
    id: "mock-matching-8",
    branch: "Ferrum",
    school: "동국대",
    title: "캠퍼스 커뮤니티",
    description:
      "동국대 학생들을 위한 소모임 매칭 서비스입니다. 실시간 알림과 게시판을 제공합니다.",
    authorSchoolLine: "닉네임/이름 · 동국대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 1, total: 1, done: true },
      { part: "Android", current: 2, total: 4 },
      { part: "Node.js", current: 1, total: 2 },
    ],
  },
  {
    id: "mock-matching-9",
    branch: "Neon",
    school: "숙명여대",
    title: "헬스 체크 인",
    description:
      "숙명여대 러닝 크루와 연동된 위치 기반 체크인 앱입니다. 주간 통계 리포트를 제공합니다.",
    authorSchoolLine: "닉네임/이름 · 숙명여대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-9/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Web", current: 2, total: 3 },
      { part: "iOS", current: 1, total: 2 },
      { part: "Node.js", current: 0, total: 2 },
    ],
  },
  {
    id: "mock-matching-10",
    branch: "Platinum",
    school: "동아대",
    title: "지역 축제 가이드",
    description:
      "부산 지역 축제 일정과 부스 정보를 한곳에 모았습니다. 오프라인 QR 티켓을 지원합니다.",
    authorSchoolLine: "닉네임/이름 · 동아대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-10/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Design", current: 2, total: 2, done: true },
      { part: "Web", current: 3, total: 3, done: true },
      { part: "SpringBoot", current: 2, total: 2, done: true },
    ],
  },
  {
    id: "mock-matching-11",
    branch: "Platinum",
    school: "영남대",
    title: "스터디 룸 예약",
    description:
      "영남대 도서관 스터디룸 예약과 출입 QR을 통합했습니다. 관리자 대시보드가 포함됩니다.",
    authorSchoolLine: "닉네임/이름 · 영남대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 0, total: 1 },
      { part: "Android", current: 0, total: 3 },
      { part: "SpringBoot", current: 0, total: 4 },
    ],
  },
  {
    id: "mock-matching-12",
    branch: "Selenium",
    school: "서경대",
    title: "포트폴리오 허브",
    description:
      "서경대 연합 해커팀을 위한 포트폴리오 공유와 피드백 도구입니다. 마크다운 노트를 지원합니다.",
    authorSchoolLine: "닉네임/이름 · 서경대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-12/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Design", current: 1, total: 2 },
      { part: "Web", current: 0, total: 5 },
      { part: "Node.js", current: 0, total: 3 },
    ],
  },
  {
    id: "mock-matching-13",
    branch: "Selenium",
    school: "안양대",
    title: "실습실 키오스크",
    description:
      "안양대 공학관 실습실 장비 대여를 위한 키오스크 UI와 관리자 웹을 구축합니다.",
    authorSchoolLine: "닉네임/이름 · 안양대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 0, total: 2 },
      { part: "Web", current: 0, total: 3 },
      { part: "SpringBoot", current: 0, total: 4 },
    ],
  },
  {
    id: "mock-matching-14",
    branch: "Xenon",
    school: "한성대",
    title: "동아리 펀딩",
    description:
      "한성대 동아리 활동 보고와 소액 후원 정산을 한 플랫폼에서 처리합니다.",
    authorSchoolLine: "닉네임/이름 · 한성대",
    coverImage: {
      src: "https://picsum.photos/seed/umc-matching-14/696/368",
      alt: "프로젝트 대표 이미지",
    },
    recruitRows: [
      { part: "Design", current: 1, total: 1, done: true },
      { part: "Web", current: 2, total: 5 },
      { part: "Android", current: 1, total: 3 },
    ],
  },
  {
    id: "mock-matching-15",
    branch: "Chromium",
    school: "서울여대",
    title: "멘토링 매칭",
    description:
      "서울여대 재학생과 졸업생 멘토를 연결합니다. 분야별 채팅방과 일정 조율을 제공합니다.",
    authorSchoolLine: "닉네임/이름 · 서울여대",
    coverImage: null,
    recruitRows: [
      { part: "Design", current: 0, total: 2 },
      { part: "iOS", current: 0, total: 2 },
      { part: "Node.js", current: 0, total: 2 },
    ],
  },
  ...buildBulkMatchingMocks(16, 45),
]

/** 목록 그리드, 카드에서 동일하게 사용하는 목 데이터 리스트 */
export const MOCK_MATCHING_PROJECTS: MatchingProjectMock[] = RAW_MOCK_PROJECTS

/** 카드 단독 사용 시 기본값 */
export const DEFAULT_MATCHING_PROJECT_MOCK = MOCK_MATCHING_PROJECTS[0]! // Selenium (임시 지부로 설정)
