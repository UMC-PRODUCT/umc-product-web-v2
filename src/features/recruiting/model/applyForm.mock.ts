import type { ApplicationSection } from "./applicationDetail"
import type { ApplyFormConfig } from "./applyForm"

export const RECRUITING_APPLY_CODE_MOCK = "A3F9K2"

const PART_OPTION_IDS = {
  pm: "opt-part-pm",
  design: "opt-part-design",
  web: "opt-part-web",
  mobile: "opt-part-mobile",
} as const

const PART_OPTIONS = [
  { optionId: PART_OPTION_IDS.pm, content: "PM" },
  { optionId: PART_OPTION_IDS.design, content: "Design" },
  { optionId: PART_OPTION_IDS.web, content: "Web Product Engineering" },
  { optionId: PART_OPTION_IDS.mobile, content: "Mobile Product Engineering" },
]

const BASIC_SECTION: ApplicationSection = {
  sectionId: "sec-basic",
  type: "common",
  title: "기본 문항",
  questions: [
    {
      questionId: "q-basic-1",
      type: "radio",
      title: "신규 지원자이신가요?",
      required: true,
      options: [
        { optionId: "opt-basic-1-1", content: "네, 신규 지원자입니다" },
        { optionId: "opt-basic-1-2", content: "아니요, 기존 챌린저입니다" },
      ],
      textValue: null,
      selectedOptionIds: [],
      files: [],
    },
    {
      questionId: "q-basic-2",
      type: "shortText",
      title: "지원자님의 성함을 알려주세요.",
      required: true,
      options: [],
      textValue: null,
      selectedOptionIds: [],
      files: [],
    },
    {
      questionId: "q-basic-3",
      type: "radio",
      title: "1지망 지원 파트를 알려주세요.",
      required: true,
      options: PART_OPTIONS,
      textValue: null,
      selectedOptionIds: [],
      files: [],
    },
    {
      questionId: "q-basic-4",
      type: "radio",
      title: "2지망 지원 파트를 알려주세요.",
      required: true,
      options: PART_OPTIONS,
      textValue: null,
      selectedOptionIds: [],
      files: [],
    },
    {
      questionId: "q-basic-5",
      type: "shortText",
      title: "이메일 주소를 입력해 주세요.",
      description:
        "모든 전형 안내는 입력하신 메일 주소로 발송되오니, 정확한 주소를 기재해 주시기 바랍니다.",
      required: true,
      options: [],
      textValue: null,
      selectedOptionIds: [],
      files: [],
    },
  ],
}

function buildPartSection(
  sectionId: string,
  title: string,
  stackOptions: string[],
): ApplicationSection {
  return {
    sectionId,
    type: "part",
    title,
    questions: [
      {
        questionId: `${sectionId}-stack`,
        type: "checkbox",
        title: "사용 가능한 기술 스택을 선택하세요.",
        required: true,
        options: stackOptions.map((content, index) => ({
          optionId: `${sectionId}-stack-${index}`,
          content,
        })),
        textValue: null,
        selectedOptionIds: [],
        files: [],
      },
      {
        questionId: `${sectionId}-portfolio`,
        type: "portfolio",
        title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        required: true,
        options: [],
        textValue: null,
        selectedOptionIds: [],
        files: [],
      },
    ],
  }
}

export const RECRUITING_APPLY_FORM_MOCK: ApplyFormConfig = {
  recruitment: {
    recruitmentId: "recruitment-1",
    title: "UMC 11기 2차 정규 모집",
    school: "한양대학교 ERICA",
    notice:
      "모집 공지 모집 공지 모집 공지 모집 공지 모집 공지\n모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지 모집 공지",
    logoUrl: null,
  },
  sections: [
    BASIC_SECTION,
    buildPartSection("sec-part-pm", "PM", ["Notion", "Slack"]),
    buildPartSection("sec-part-design", "Design", ["Figma", "illustration"]),
    buildPartSection("sec-part-web", "Web Product Engineering", [
      "Figma",
      "Github",
    ]),
    buildPartSection("sec-part-mobile", "Mobile Product Engineering", [
      "Swift",
      "Kotlin",
    ]),
  ],
  partQuestionIds: ["q-basic-3", "q-basic-4"],
  nameQuestionId: "q-basic-2",
  partOptionSectionMap: {
    [PART_OPTION_IDS.pm]: "sec-part-pm",
    [PART_OPTION_IDS.design]: "sec-part-design",
    [PART_OPTION_IDS.web]: "sec-part-web",
    [PART_OPTION_IDS.mobile]: "sec-part-mobile",
  },
}
