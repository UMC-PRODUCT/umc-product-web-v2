import { type PartKey, PARTS } from "./parts"

export type RecruitmentFieldType =
  | "text"
  | "radio"
  | "checkbox"
  | "file"
  | "portfolio"

export interface RecruitmentQuestionOption {
  content: string
  optionId?: number
}

export interface RecruitmentQuestion {
  id: string
  questionId?: number
  title: string
  caption: string
  fieldType: RecruitmentFieldType
  required: boolean
  options: RecruitmentQuestionOption[]
  draftTitle?: string
  draftOptions?: RecruitmentQuestionOption[]
}

export interface RecruitmentPartSection {
  id: PartKey
  name: string
  isEnabled: boolean
  questions: RecruitmentQuestion[]
}

export function genId(): string {
  return crypto.randomUUID()
}

export const PORTFOLIO_FIXED_TITLE =
  "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요."

export function makeRecruitmentQuestion(
  overrides?: Partial<Omit<RecruitmentQuestion, "id">>,
): RecruitmentQuestion {
  return {
    id: genId(),
    title: "",
    caption: "",
    fieldType: "text",
    required: false,
    options: [],
    ...overrides,
  }
}

export function makeDefaultPartSections(): RecruitmentPartSection[] {
  return PARTS.map(({ key, label }) => ({
    id: key,
    name: label,
    isEnabled: false,
    questions: [],
  }))
}

export function getRecruitmentFieldTypePatch(
  fieldType: RecruitmentFieldType,
  question: RecruitmentQuestion,
): Partial<RecruitmentQuestion> {
  const prevFieldType = question.fieldType
  const prevOptions = question.options
  const prevDraftOptions = question.draftOptions
  const isPrevOptionField =
    prevFieldType === "radio" || prevFieldType === "checkbox"
  const isNextOptionField = fieldType === "radio" || fieldType === "checkbox"
  const base: Partial<RecruitmentQuestion> = { fieldType }

  if (isPrevOptionField && !isNextOptionField) {
    base.options = []
    base.draftOptions = prevOptions
  } else if (isNextOptionField) {
    base.options = isPrevOptionField ? prevOptions : (prevDraftOptions ?? [])
  } else {
    base.options = []
  }

  if (fieldType === "portfolio") {
    if (prevFieldType !== "portfolio") {
      base.draftTitle = question.title
    }
    base.title = PORTFOLIO_FIXED_TITLE
  } else if (prevFieldType === "portfolio") {
    base.title = question.draftTitle ?? ""
  }
  return base
}

export interface RecruitmentQuestionValidationError {
  message: string
  questionId: string
}

export function validateRecruitmentQuestion(
  question: RecruitmentQuestion,
): RecruitmentQuestionValidationError | null {
  if (question.fieldType !== "portfolio" && question.title.trim() === "") {
    return {
      message: "사용 중인 섹션의 항목을 모두 입력해 주세요.",
      questionId: question.id,
    }
  }
  if (question.fieldType === "radio" || question.fieldType === "checkbox") {
    if (question.options.length === 0) {
      return {
        message: "사용 중인 섹션의 항목을 모두 입력해 주세요.",
        questionId: question.id,
      }
    }
    if (question.options.some((opt) => opt.content.trim() === "")) {
      return {
        message: "사용 중인 섹션의 항목을 모두 입력해 주세요.",
        questionId: question.id,
      }
    }
  }
  return null
}

export function validateRecruitmentQuestionForm(
  commonQuestions: RecruitmentQuestion[],
  sections: RecruitmentPartSection[],
): RecruitmentQuestionValidationError[] {
  const errors: RecruitmentQuestionValidationError[] = []
  for (const q of commonQuestions) {
    const err = validateRecruitmentQuestion(q)
    if (err) errors.push(err)
  }
  for (const section of sections) {
    if (!section.isEnabled) continue
    for (const q of section.questions) {
      const err = validateRecruitmentQuestion(q)
      if (err) errors.push(err)
    }
  }
  return errors
}

// 기본 문항: 모든 모집 공고에 공통으로 포함되는 고정 질문(수정 불가)
export interface RecruitmentDefaultQuestion {
  index: string
  title: string
  caption?: string
  type: "radio" | "text"
  options?: string[]
}

export const RECRUITMENT_DEFAULT_QUESTIONS: RecruitmentDefaultQuestion[] = [
  {
    index: "01",
    title: "신규 지원자이신가요?",
    type: "radio",
    options: ["네, 신규 지원자입니다", "아니요, 기존 챌린저입니다"],
  },
  {
    index: "02",
    title: "지원자님의 성함을 알려주세요.",
    type: "text",
  },
  {
    index: "03",
    title: "1지망 지원 파트를 알려주세요.",
    type: "radio",
    options: PARTS.map((part) => part.label),
  },
  {
    index: "04",
    title: "2지망 지원 파트를 알려주세요.",
    type: "radio",
    options: PARTS.map((part) => part.label),
  },
  {
    index: "05",
    title: "이메일 주소를 입력해 주세요.",
    caption:
      "모든 전형 안내는 입력하신 메일 주소로 발송되오니, 정확한 주소를 기재해 주시기 바랍니다.",
    type: "text",
  },
]
