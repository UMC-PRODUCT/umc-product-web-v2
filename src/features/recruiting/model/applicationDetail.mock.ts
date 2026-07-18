import type {
  ApplicationDetail,
  ApplicationSection,
  OperatorEvaluation,
} from "./applicationDetail"

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
        { optionId: "opt-basic-1-1", content: "네, 신규 지원입니다" },
        { optionId: "opt-basic-1-2", content: "아니요, 기존 챌린저입니다" },
      ],
      textValue: null,
      selectedOptionIds: ["opt-basic-1-2"],
      files: [],
    },
    {
      questionId: "q-basic-2",
      type: "shortText",
      title: "지원자님의 성함을 알려주세요.",
      required: true,
      options: [],
      textValue: "이예원",
      selectedOptionIds: [],
      files: [],
    },
    {
      questionId: "q-basic-3",
      type: "radio",
      title: "1지망 지원 파트를 알려주세요.",
      required: true,
      options: [
        { optionId: "opt-basic-3-1", content: "PM" },
        { optionId: "opt-basic-3-2", content: "Design" },
        { optionId: "opt-basic-3-3", content: "Web Product Engineering" },
        { optionId: "opt-basic-3-4", content: "Mobile Product Engineering" },
      ],
      textValue: null,
      selectedOptionIds: ["opt-basic-3-2"],
      files: [],
    },
    {
      questionId: "q-basic-4",
      type: "radio",
      title: "2지망 지원 파트를 알려주세요.",
      required: true,
      options: [
        { optionId: "opt-basic-4-1", content: "PM" },
        { optionId: "opt-basic-4-2", content: "Design" },
        { optionId: "opt-basic-4-3", content: "Web Product Engineering" },
        { optionId: "opt-basic-4-4", content: "Mobile Product Engineering" },
      ],
      textValue: null,
      selectedOptionIds: ["opt-basic-4-3"],
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
      textValue: "2eeyone@hanyang.ac.kr",
      selectedOptionIds: [],
      files: [],
    },
  ],
}

const DESIGN_SECTION: ApplicationSection = {
  sectionId: "sec-design",
  type: "part",
  title: "Design",
  questions: [
    {
      questionId: "q-design-1",
      type: "checkbox",
      title: "사용 가능한 기술 스택을 선택하세요.",
      required: true,
      options: [
        { optionId: "opt-design-1-1", content: "Figma" },
        { optionId: "opt-design-1-2", content: "Illustration" },
      ],
      textValue: null,
      selectedOptionIds: ["opt-design-1-1"],
      files: [],
    },
    {
      questionId: "q-design-2",
      type: "portfolio",
      title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
      required: true,
      options: [],
      textValue: null,
      selectedOptionIds: [],
      files: [
        {
          fileId: "file-design-1",
          name: "2026_UXUI 포트폴리오_이방토",
          url: "https://example.com/portfolio-uxui.pdf",
        },
      ],
    },
    {
      questionId: "q-design-3",
      type: "shortText",
      title: "지원자님의 성함을 알려주세요.",
      required: true,
      options: [],
      textValue: "이예원",
      selectedOptionIds: [],
      files: [],
    },
  ],
}

const WEB_SECTION: ApplicationSection = {
  sectionId: "sec-web",
  type: "part",
  title: "Web Product Engineering",
  questions: [
    {
      questionId: "q-web-1",
      type: "checkbox",
      title: "사용 가능한 기술 스택을 선택하세요.",
      required: true,
      options: [
        { optionId: "opt-web-1-1", content: "Figma" },
        { optionId: "opt-web-1-2", content: "Github" },
      ],
      textValue: null,
      selectedOptionIds: ["opt-web-1-2"],
      files: [],
    },
    {
      questionId: "q-web-2",
      type: "portfolio",
      title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
      required: true,
      options: [],
      textValue: null,
      selectedOptionIds: [],
      files: [
        {
          fileId: "file-web-1",
          name: "2026_Web 포트폴리오_이방토",
          url: "https://example.com/portfolio-web.pdf",
        },
      ],
    },
    {
      questionId: "q-web-3",
      type: "shortText",
      title: "지원자님의 성함을 알려주세요.",
      required: true,
      options: [],
      textValue: "이예원",
      selectedOptionIds: [],
      files: [],
    },
    {
      questionId: "q-web-4",
      type: "shortText",
      title: "지원자님의 성함을 알려주세요.",
      required: true,
      options: [],
      textValue: "이예원",
      selectedOptionIds: [],
      files: [],
    },
  ],
}

const DOCUMENT_OPERATORS: OperatorEvaluation[] = [
  {
    evaluatorId: "op-bella",
    evaluatorName: "벨라/황지원",
    stage: "document",
    progress: "done",
    result: "pass",
    comment:
      "포트폴리오의 내용이 탄탄하고 좋다. 특히 UX적으로 역량있는 디자이너인듯하다. 걸리는 것은 4학년 이라는 점이다.",
  },
  {
    evaluatorId: "op-park",
    evaluatorName: "박방토/박예원",
    stage: "document",
    progress: "done",
    result: "fail",
    comment: null,
  },
  {
    evaluatorId: "op-me",
    evaluatorName: "이방토/이예원",
    stage: "document",
    progress: "before",
    result: null,
    comment: null,
  },
  {
    evaluatorId: "op-4",
    evaluatorName: "제옹/정의찬",
    stage: "document",
    progress: "before",
    result: null,
    comment: null,
  },
  {
    evaluatorId: "op-5",
    evaluatorName: "삼이/이희원",
    stage: "document",
    progress: "before",
    result: null,
    comment: null,
  },
]

export const RECRUITING_APPLICATION_DETAIL_MOCK: ApplicationDetail = {
  applicationId: "app-101",
  applicantName: "이예원",
  chapter: "Chromium",
  school: "한양대 ERICA",
  recruitmentLabel: "한양대 ERICA UMC 11기 2차 정규 모집",
  parts: ["design", "web-pe"],
  reachedStages: ["document", "interview"],
  finalResult: null,
  sections: [BASIC_SECTION, DESIGN_SECTION, WEB_SECTION],
  evaluations: {
    document: {
      stage: "document",
      myEvaluatorId: "op-me",
      locked: false,
      operators: DOCUMENT_OPERATORS,
    },
    interview: null,
    final: null,
  },
}

export function getApplicationDetailMock(
  applicationId: string,
): ApplicationDetail {
  return { ...RECRUITING_APPLICATION_DETAIL_MOCK, applicationId }
}
