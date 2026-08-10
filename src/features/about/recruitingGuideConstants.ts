import { APPLY_ENTRY_PATH } from "@/shared/config/headerRecruitingWindow"

const NOTICE_PATH = "/projects/notice"

export const RECRUITING_GUIDE_HERO = {
  eyebrow: "UNIVERSITY MAKEUS CHALLENGE",
  headline: "UMC 11th",
  description: "UMC 11기 모집 안내",
  ctaLabel: "11기 지원하기",
  ctaTo: APPLY_ENTRY_PATH,
} as const

// 모집 분야 섹션은 소개 랜딩과 같은 내용을 쓴다. 목적지만 이 페이지 기준으로 바꾼다.
export const RECRUITING_GUIDE_PARTS_CTA = {
  label: "모집 안내 보러 가기 →",
  to: APPLY_ENTRY_PATH,
} as const

export const RECRUITING_GUIDE_SCHEDULE = {
  headline: "모집 일정",
  description: "자세한 일정은 각 학교별 모집 공고를 확인해 주세요",
  ctaLabel: "학교별 모집 공고 보러 가기 →",
  ctaTo: NOTICE_PATH,
  // 날짜를 넣지 않는다. 학교마다 차수 기간이 달라 한 줄로 적을 기준이 없다.
  steps: [
    { title: "지원서 접수", description: "온라인 지원서 접수" },
    { title: "서류 심사", description: "1차 서류 심사 진행" },
    {
      title: "서류 결과 발표",
      description: "서류 합격자 발표 및 면접 일정 선택",
    },
    { title: "면접 진행", description: "온·오프라인 면접 진행" },
    {
      title: "최종 합격 발표",
      description: "최종 합격자 발표 및 OT 일정 안내",
    },
    { title: "활동 시작", description: "OT를 시작으로 본격적인 UMC 활동 시작" },
  ],
} as const

// 학교 목록 자체는 소개 랜딩(ABOUT_SCHOOLS.schools)과 같은 것을 쓴다. 제목과
// 설명만 이 페이지 것이다.
export const RECRUITING_GUIDE_SCHOOLS = {
  headline: "UMC 11기와 함께하는 학교",
  descriptionLines: [
    "전국 21개의 대학이 이번 기수에 함께합니다.",
    "지금 이 순간에도 지속적으로 확장되는 거대한 IT 네트워크를 경험하세요!",
  ],
} as const

export type RecruitingGuideFaqFilterId =
  | "all"
  | "pm"
  | "design"
  | "web-pe"
  | "mobile-pe"

export interface RecruitingGuideFaqItem {
  id: string
  question: string
  answer: string
  /**
   * 이 문답이 걸리는 파트. 비어 있으면 파트를 가리지 않는 공통 문답이라
   * 어떤 필터에서도 보인다. 시안이 문답별 파트를 정해 두지 않아 전부 공통이다.
   */
  parts: readonly Exclude<RecruitingGuideFaqFilterId, "all">[]
}

export const RECRUITING_GUIDE_FAQ = {
  eyebrow: "FAQ",
  headline: "자주 묻는 질문",
  ctaLabel: "바로 지원하기 →",
  ctaTo: APPLY_ENTRY_PATH,
  emptyMessage: "해당 파트의 문답이 아직 없습니다.",
  filters: [
    { id: "all", label: "전체" },
    { id: "pm", label: "PM" },
    { id: "design", label: "Design" },
    { id: "web-pe", label: "Web PE" },
    { id: "mobile-pe", label: "Mobile PE" },
  ],
  items: [
    {
      id: "side-activity",
      question: "타 동아리 및 학업과 병행이 가능한가요?",
      answer: "본문입니다.",
      parts: [],
    },
    {
      id: "fee",
      question: "동아리 가입비나 활동비 등 별도의 비용이 발생하나요?",
      answer: "본문입니다.",
      parts: [],
    },
    {
      id: "session-format",
      question:
        "정규 세션과 프로젝트는 온/오프라인 중 어떤 방식으로 진행되나요?",
      answer: "본문입니다.",
      parts: [],
    },
  ] satisfies readonly RecruitingGuideFaqItem[],
} as const
