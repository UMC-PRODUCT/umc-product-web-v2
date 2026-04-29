import type { Role } from "./types"

export interface FormField {
  question: string
  answer: string
}

export interface ApplicantFormData {
  applicantId: string
  chapter: string
  role: Role
  projectName: string
  challengerName: string
  fields: FormField[]
}

export const MOCK_FORM_DATA: Record<string, ApplicantFormData> = {
  "3-1": {
    applicantId: "3-1",
    chapter: "Chromium",
    role: "design",
    projectName: "UMC_Web",
    challengerName: "이방토/이예원",
    fields: [
      {
        question: "지원 동기를 작성해주세요.",
        answer:
          "디자인을 통해 사용자 경험을 개선하고 싶어 UMC에 지원하게 되었습니다. 특히 팀 프로젝트에서 실무 경험을 쌓고 싶습니다.",
      },
      {
        question: "관련 경험이 있다면 작성해주세요.",
        answer:
          "학교 동아리에서 앱 UI/UX 디자인을 담당한 경험이 있습니다. Figma를 주로 사용하며, 디자인 시스템 구축 경험도 있습니다.",
      },
      {
        question: "프로젝트에서 기대하는 바를 작성해주세요.",
        answer:
          "실제 서비스를 런칭해보는 경험을 하고 싶습니다. 개발자와의 협업을 통해 실무에 가까운 프로세스를 경험하고 싶습니다.",
      },
    ],
  },
  "3-2": {
    applicantId: "3-2",
    chapter: "Chromium",
    role: "design",
    projectName: "UMC_Web",
    challengerName: "이장토촐빈이/이제길팀",
    fields: [
      {
        question: "지원 동기를 작성해주세요.",
        answer:
          "UMC의 프로젝트 중심 활동에 매력을 느껴 지원하게 되었습니다. 디자인 역량을 키우고 포트폴리오를 만들고 싶습니다.",
      },
      {
        question: "관련 경험이 있다면 작성해주세요.",
        answer:
          "개인 프로젝트로 모바일 앱 디자인을 진행한 적이 있습니다. Adobe XD와 Figma를 활용할 수 있습니다.",
      },
      {
        question: "프로젝트에서 기대하는 바를 작성해주세요.",
        answer: "팀원들과 소통하며 함께 성장하는 경험을 하고 싶습니다.",
      },
    ],
  },
  "3-3": {
    applicantId: "3-3",
    chapter: "Chromium",
    role: "android",
    projectName: "UMC_Web",
    challengerName: "이장토촐빈이/이제길팀",
    fields: [
      {
        question: "지원 동기를 작성해주세요.",
        answer:
          "안드로이드 개발에 관심이 많아 실제 프로젝트 경험을 쌓고자 지원했습니다.",
      },
      {
        question: "관련 경험이 있다면 작성해주세요.",
        answer:
          "Kotlin으로 간단한 투두 앱을 만들어본 경험이 있습니다. Jetpack Compose에도 관심이 있습니다.",
      },
      {
        question: "프로젝트에서 기대하는 바를 작성해주세요.",
        answer: "협업 경험과 코드 리뷰 문화를 경험하고 싶습니다.",
      },
    ],
  },
}
