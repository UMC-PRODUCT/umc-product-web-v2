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
      id: "what-is-umc",
      question: "UMC는 어떤 동아리이고, 어떤 활동을 하나요?",
      answer:
        "UMC는 기획, 디자인, 개발 분야의 대학생들이 함께 공부하고 실제 서비스를 만들어보는 전국 단위 IT 연합 동아리예요.\n\n스터디 → 프로젝트 → 데모데이 순서로 약 6개월 동안 활동해요.\n스터디로 기본기를 쌓은 뒤 프로젝트 팀을 구성해 하나의 서비스를 기획하고, 디자인하고, 개발하며 완성해요. 완성한 프로젝트는 데모데이를 통해 다른 팀과 공유하고, 함께 돌아보는 시간을 가져요.",
      parts: [],
    },
    {
      id: "non-major-eligible",
      question: "전공자가 아니어도 지원할 수 있나요?",
      answer:
        "네, 전공과 관계없이 지원할 수 있어요.\n해당 분야에 관심이 있고, 배우고 직접 만들어보고 싶은 마음이 있다면 누구나 도전할 수 있어요.",
      parts: [],
    },
    {
      id: "school-without-umc",
      question: "학교에 UMC가 없어도 지원할 수 있나요?",
      answer:
        "현재 UMC가 운영되고 있는 학교의 학생만 챌린저로 지원할 수 있어요.\n학교에 UMC가 없다면 회장단으로 지원해 해당 학교에 UMC를 새롭게 만들 수 있어요.",
      parts: [],
    },
    {
      id: "side-activity",
      question: "다른 동아리나 학업과 함께할 수 있나요?",
      answer:
        "네, 가능해요. 다만 UMC는 스터디와 프로젝트에 꾸준히 참여해야 하는 활동이에요.\n지원하기 전에 본인의 학업과 다른 활동 일정을 고려해 끝까지 함께할 수 있는지 확인해 주세요.",
      parts: [],
    },
    {
      id: "activity-period-and-fee",
      question: "활동 기간과 진행 방식, 비용은 어떻게 되나요?",
      answer:
        "스터디와 프로젝트를 포함해 약 6개월 동안 활동해요.\n스터디는 대면으로 진행하고, 프로젝트는 팀원들과 협업하며 실제 서비스를 만들어가요. 구체적인 일정과 방식은 기수와 팀에 따라 달라질 수 있어요.\n기본 회비는 35,000원이며, 일부 지역 학교는 25,000원으로 조정될 수 있어요. 프로젝트 참가비는 30,000원이고, 프로젝트를 완수하면 5,000원을 환급해요.",
      parts: [],
    },
    {
      id: "completion-benefits",
      question: "수료하면 어떤 것을 얻을 수 있나요?",
      answer:
        "수료증과 프로젝트 참여 확인서 등 활동을 증명할 수 있는 자료를 받을 수 있어요.\n무엇보다 직접 기획하고, 디자인하고, 개발한 실제 프로젝트 결과물을 포트폴리오로 활용할 수 있어요.",
      parts: [],
    },
    {
      id: "pm-without-experience",
      question: "PM 경험이 없어도 지원할 수 있나요?",
      answer:
        "네, 가능해요.\n관련 경험이 없어도 서비스를 직접 기획하고 팀과 함께 만들어가는 과정에 관심이 있다면 지원할 수 있어요. 스터디부터 프로젝트까지 기획과 프로젝트 매니징을 단계적으로 경험해요.",
      parts: ["pm"],
    },
    {
      id: "pm-role",
      question: "PM은 프로젝트에서 어떤 일을 하나요?",
      answer:
        "PM은 서비스의 문제와 방향을 정의하고, 아이디어를 구체화해 실제 제품으로 이어질 수 있도록 이끌어요.\n프로젝트의 목표를 정하고 기획을 구체화하는 것부터 팀원들과 일정을 조율하고 프로젝트를 완성하는 과정까지 함께해요.",
      parts: ["pm"],
    },
    {
      id: "pm-project-idea",
      question: "PM이 직접 프로젝트 아이디어를 정하나요?",
      answer:
        "네. PM이 직접 프로젝트 아이디어를 제안하고 서비스의 방향과 기획을 구체화해요.\n이후 프로젝트에 필요한 파트를 고려해 디자이너와 개발자와 함께 팀을 구성하고 하나의 서비스를 만들어가요.",
      parts: ["pm"],
    },
    {
      id: "design-without-experience",
      question: "UI/UX 디자인 경험이 없어도 지원할 수 있나요?",
      answer:
        "네, 가능해요.\n실무 경험이 없어도 UI/UX 디자인에 관심이 있고, 실제 서비스의 화면과 사용자 경험을 직접 설계해보고 싶다면 지원할 수 있어요.",
      parts: ["design"],
    },
    {
      id: "design-role",
      question: "Design은 프로젝트에서 어떤 일을 하나요?",
      answer:
        "디자인은 사용자가 서비스를 만나면서 겪는 경험을 고민하고, 이를 직관적인 UX와 완성도 높은 UI로 만들어가요.\nPM이 정의한 서비스의 방향을 바탕으로 사용자가 더 쉽게 이해하고 사용할 수 있는 화면과 인터랙션을 설계해요.",
      parts: ["design"],
    },
    {
      id: "design-portfolio",
      question: "디자인 포트폴리오가 꼭 필요한가요?",
      answer:
        "지원 과정에서 포트폴리오 제출이 필요한지는 해당 기수의 모집 공지를 확인해 주세요.\n화려한 작업물만을 기준으로 판단하기보다, 어떤 고민을 했고 그 고민을 어떻게 디자인으로 풀어냈는지 함께 살펴봐요.",
      parts: ["design"],
    },
    {
      id: "web-without-experience",
      question: "웹 개발 경험이 없어도 지원할 수 있나요?",
      answer:
        "네, 가능해요.\n웹 개발에 관심이 있고 직접 서비스를 만들어보고 싶은 분이라면 지원할 수 있어요. 스터디를 통해 기본기를 쌓고, 배운 내용을 프로젝트에 적용하며 실제 웹 서비스를 완성해요.",
      parts: ["web-pe"],
    },
    {
      id: "web-role",
      question: "Web Product Engineer는 어떤 일을 하나요?",
      answer:
        "웹 서비스의 기능을 실제로 동작하는 제품으로 만들어가요.\n화면 구현부터 API, 데이터 처리, 인증, 배포까지 경험하며 웹 제품이 만들어지는 전체 과정을 배워요.",
      parts: ["web-pe"],
    },
    {
      id: "web-technologies",
      question: "어떤 기술을 배우고 프로젝트에 적용하나요?",
      answer:
        "UMC에서 제공하는 워크북과 커리큘럼을 통해 프로젝트에 필요한 기술을 단계적으로 학습해요.\n스터디에서 배운 내용을 프로젝트에 직접 적용하며 실제 서비스를 만들어가요.",
      parts: ["web-pe"],
    },
    {
      id: "mobile-without-experience",
      question: "앱 개발 경험이 없어도 지원할 수 있나요?",
      answer:
        "네, 가능해요.\n앱 개발에 관심이 있고 직접 사용할 수 있는 서비스를 만들어보고 싶은 분이라면 지원할 수 있어요. 기본적인 개발 지식부터 실제 앱을 완성하는 과정까지 단계적으로 경험해요.",
      parts: ["mobile-pe"],
    },
    {
      id: "mobile-role",
      question: "Mobile Product Engineer는 어떤 일을 하나요?",
      answer:
        "사용자가 직접 사용하는 모바일 앱을 실제 제품으로 만들어가요.\n화면 구현부터 기능 개발, 서버 연동, 데이터 처리, 배포까지 모바일 제품이 만들어지는 과정을 경험해요.",
      parts: ["mobile-pe"],
    },
    {
      id: "mobile-platform",
      question: "iOS와 Android 중 하나를 미리 선택해야 하나요?",
      answer:
        "아니요. 지원할 때 특정 플랫폼을 미리 선택할 필요는 없어요.\nUMC의 워크북과 커리큘럼을 따라 앱 개발의 기본기를 쌓은 뒤, 이를 바탕으로 프로젝트를 진행해요.",
      parts: ["mobile-pe"],
    },
  ] satisfies readonly RecruitingGuideFaqItem[],
} as const
