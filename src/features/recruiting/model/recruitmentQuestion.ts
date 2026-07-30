import { type PartKey, PARTS } from "./parts"

import type { RecruitingTrack } from "../api/types"

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

// Form Upsert 요청 전용 타입만 여기서 참조(entity 레이어 의존 방지를 위해 api 타입은 호출부에서 조립).
// 공통 문항의 radio/text만 다루므로 폭넓은 RecruitingQuestionType
function toRecruitingQuestionType(
  type: RecruitmentDefaultQuestion["type"],
): "RADIO" | "SHORT_TEXT" {
  return type === "radio" ? "RADIO" : "SHORT_TEXT"
}

// 공통 문항(01~05) 섹션을 Form Upsert 요청 payload로 직렬화한다.
// 파트별(TRACK) 섹션은 아직 실제 편집 상태가 없는 정적 placeholder라 여기서 다루지 않는다.
export function buildCommonSectionUpsertRequest(
  removedOptionsByQuestionIndex: Record<string, string[]>,
  questionToggleState: Record<string, { enabled: boolean; required: boolean }>,
): {
  clientKey: string
  title: string
  type: "COMMON"
  questions: {
    type: "RADIO" | "SHORT_TEXT"
    title: string
    description?: string
    required: boolean
    options?: { content: string; other: boolean }[]
  }[]
} {
  const questions = RECRUITMENT_DEFAULT_QUESTIONS.filter(
    (question) => questionToggleState[question.index]?.enabled ?? true,
  ).map((question) => {
    const removed = removedOptionsByQuestionIndex[question.index] ?? []
    const activeOptions = question.options?.filter(
      (option) => !removed.includes(option),
    )
    return {
      type: toRecruitingQuestionType(question.type),
      title: question.title,
      description: question.caption,
      required: questionToggleState[question.index]?.required ?? true,
      options: activeOptions?.map((content) => ({ content, other: false })),
    }
  })

  return {
    clientKey: "common",
    title: "기본 문항",
    type: "COMMON",
    questions,
  }
}

function toRecruitingQuestionTypeFromField(
  fieldType: RecruitmentFieldType,
): "SHORT_TEXT" | "RADIO" | "CHECKBOX" | "FILE" | "PORTFOLIO" {
  switch (fieldType) {
    case "text":
      return "SHORT_TEXT"
    case "radio":
      return "RADIO"
    case "checkbox":
      return "CHECKBOX"
    case "file":
      return "FILE"
    case "portfolio":
      return "PORTFOLIO"
  }
}

// 파트(TRACK) 섹션을 Form Upsert 요청 payload로 직렬화한다.
// "파트 사용" 토글이 켜진 파트마다 하나씩 만들어 sections 배열에 얹는다.
export function buildTrackSectionUpsertRequest(
  partLabel: string,
  track: RecruitingTrack,
  questions: RecruitmentQuestion[],
): {
  clientKey: string
  title: string
  type: "TRACK"
  track: RecruitingTrack
  questions: {
    type: "SHORT_TEXT" | "RADIO" | "CHECKBOX" | "FILE" | "PORTFOLIO"
    title: string
    description?: string
    required: boolean
    options?: { content: string; other: boolean }[]
  }[]
} {
  return {
    clientKey: `track-${track}`,
    title: partLabel,
    type: "TRACK",
    track,
    questions: questions.map((question) => ({
      type: toRecruitingQuestionTypeFromField(question.fieldType),
      title: question.title,
      description: question.caption || undefined,
      required: question.required,
      options:
        question.fieldType === "radio" || question.fieldType === "checkbox"
          ? question.options.map((option) => ({
              content: option.content,
              other: false,
            }))
          : undefined,
    })),
  }
}
