export interface Workbook {
  id: string
  number: number
  title: string
  missions: string[]
}

export interface CurriculumItem {
  id: string
  number: string
  title: string
  workbookCount: number
  missionCount: number
  workbooks: Workbook[]
}

const DEFAULT_WORKBOOKS: Workbook[] = [
  {
    id: "wb-1",
    number: 1,
    title: "Hug, Fill, Fixed 개념 익히기",
    missions: [
      "Frame 개념 알기",
      "활용 예시 및 주의사항 알기",
      "원리 복습 및 단축키 알기",
    ],
  },
  {
    id: "wb-2",
    number: 2,
    title: "그룹핑 개념 익히기",
    missions: [
      "Frame 개념 알기",
      "활용 예시 및 주의사항 알기",
      "원리 복습 및 단축키 알기",
    ],
  },
  {
    id: "wb-3",
    number: 3,
    title: "오토레이아웃을 활용한 페이지 클론 디자인",
    missions: [
      "Frame 개념 알기",
      "활용 예시 및 주의사항 알기",
      "원리 복습 및 단축키 알기",
    ],
  },
]

export const INITIAL_CURRICULUM_DATA: Record<string, CurriculumItem[]> = {
  Design: [
    {
      id: "design-1",
      number: "01",
      title: "오토레이아웃 익히기",
      workbookCount: 3,
      missionCount: 9,
      workbooks: DEFAULT_WORKBOOKS,
    },
    {
      id: "design-2",
      number: "02",
      title: "클론 디자인 및 플로우 파악 & 문제 정의",
      workbookCount: 4,
      missionCount: 21,
      workbooks: DEFAULT_WORKBOOKS,
    },
    {
      id: "design-3",
      number: "03",
      title: "UX Research & Serive · UX 향후 전략 도출",
      workbookCount: 4,
      missionCount: 21,
      workbooks: DEFAULT_WORKBOOKS,
    },
    {
      id: "design-4",
      number: "04",
      title: "디자인 시스템 설계 및 서비스 기획",
      workbookCount: 4,
      missionCount: 21,
      workbooks: DEFAULT_WORKBOOKS,
    },
  ],
  PM: [
    {
      id: "pm-1",
      number: "01",
      title: "서비스 기획 기초 및 문제 정의",
      workbookCount: 3,
      missionCount: 9,
      workbooks: DEFAULT_WORKBOOKS,
    },
  ],
  "Web PE": [
    {
      id: "web-1",
      number: "01",
      title: "웹 개발 환경 구축 및 기초 컴포넌트",
      workbookCount: 3,
      missionCount: 9,
      workbooks: DEFAULT_WORKBOOKS,
    },
  ],
  "Mobile PE": [
    {
      id: "mobile-1",
      number: "01",
      title: "모바일 앱 아키텍처 및 화면 구성",
      workbookCount: 3,
      missionCount: 9,
      workbooks: DEFAULT_WORKBOOKS,
    },
  ],
  "Infra Plus": [
    {
      id: "infra-1",
      number: "01",
      title: "클라우드 인프라 파이프라인 구축",
      workbookCount: 3,
      missionCount: 9,
      workbooks: DEFAULT_WORKBOOKS,
    },
  ],
}
