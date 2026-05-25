export type FieldType = "text" | "radio" | "checkbox" | "file" | "portfolio"

export interface Question {
  id: string
  title: string
  caption: string
  fieldType: FieldType
  required: boolean
  options: string[]
}

export interface Section {
  id: string
  sectionId?: number
  name: string
  isEnabled: boolean
  questions: Question[]
}

let _idCounter = 0

export function genId(): string {
  return `q-${++_idCounter}`
}

export const PORTFOLIO_FIXED_TITLE =
  "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요."

export function getFieldTypePatch(
  fieldType: FieldType,
  prevFieldType: FieldType,
): Partial<Question> {
  const base: Partial<Question> = { fieldType, options: [] }
  if (fieldType === "portfolio") {
    base.title = PORTFOLIO_FIXED_TITLE
  } else if (prevFieldType === "portfolio") {
    base.title = ""
  }
  return base
}

export interface ValidationError {
  message: string
  questionId: string
}

export function validateQuestion(
  question: Question,
  locationLabel: string,
  questionNumber: number,
): ValidationError | null {
  if (question.fieldType !== "portfolio" && question.title.trim() === "") {
    return {
      message: `${locationLabel} ${questionNumber}번 질문의 제목을 입력해 주세요!`,
      questionId: question.id,
    }
  }
  if (question.fieldType === "radio" || question.fieldType === "checkbox") {
    if (question.options.length === 0) {
      return {
        message: `${locationLabel} ${questionNumber}번 질문의 옵션을 1개 이상 추가해주세요!`,
        questionId: question.id,
      }
    }
    if (question.options.some((opt) => opt.trim() === "")) {
      return {
        message: `${locationLabel} ${questionNumber}번 질문에 비어있는 옵션이 있습니다.`,
        questionId: question.id,
      }
    }
  }
  return null
}

export function validateApplicationForm(
  commonQuestions: Question[],
  sections: Section[],
): { sectionEmptyName?: string; errors: ValidationError[] } {
  for (const section of sections) {
    if (!section.isEnabled) continue
    if (section.questions.length === 0) {
      return { sectionEmptyName: section.name, errors: [] }
    }
  }

  const errors: ValidationError[] = []
  for (const [i, q] of commonQuestions.entries()) {
    const err = validateQuestion(q, "공통 질문", i + 1)
    if (err) errors.push(err)
  }
  for (const section of sections) {
    if (!section.isEnabled) continue
    for (const [i, q] of section.questions.entries()) {
      const err = validateQuestion(q, section.name, i + 1)
      if (err) errors.push(err)
    }
  }
  return { errors }
}

export function makeQuestion(
  overrides?: Partial<Omit<Question, "id">>,
): Question {
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
