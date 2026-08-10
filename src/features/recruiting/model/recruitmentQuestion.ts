import { PART_KEY_TO_TRACK, type PartKey, PARTS } from "./parts"

import type {
  RecruitingAdminFormQuestionResponse,
  RecruitingAdminFormStructureResponse,
  RecruitingQuestionType,
  RecruitingTrack,
  UpsertRecruitingSectionRequest,
} from "../api/types"

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

// 공통 문항은 radio/text만 다루므로 RecruitingQuestionType 전체가 아니라 이 두 값으로만 좁혀 반환한다.
function toRecruitingQuestionType(
  type: RecruitmentDefaultQuestion["type"],
): "RADIO" | "SHORT_TEXT" {
  return type === "radio" ? "RADIO" : "SHORT_TEXT"
}

// 공통 문항(01~05 고정 문항 + 운영진이 추가한 자유 문항) 섹션을 Form Upsert 요청
// payload로 직렬화한다. 파트별(TRACK) 섹션 직렬화는 buildTrackSectionUpsertRequest가
// 별도로 담당한다.
export function buildCommonSectionUpsertRequest(
  removedOptionsByQuestionIndex: Record<string, string[]>,
  questionToggleState: Record<string, { enabled: boolean; required: boolean }>,
  additionalQuestions: RecruitmentQuestion[] = [],
  sectionId?: number,
): UpsertRecruitingSectionRequest {
  const defaultQuestions = RECRUITMENT_DEFAULT_QUESTIONS.filter(
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

  const extraQuestions = additionalQuestions.map((question) => ({
    questionId: question.questionId,
    type: toRecruitingQuestionTypeFromField(question.fieldType),
    title: question.title,
    description: question.caption || undefined,
    required: question.required,
    options:
      question.fieldType === "radio" || question.fieldType === "checkbox"
        ? question.options.map((option) => ({
            optionId: option.optionId,
            content: option.content,
            other: false,
          }))
        : undefined,
  }))

  return {
    sectionId,
    clientKey: "common",
    title: "기본 문항",
    type: "COMMON",
    questions: [...defaultQuestions, ...extraQuestions],
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
  sectionId?: number,
): UpsertRecruitingSectionRequest {
  return {
    sectionId,
    clientKey: `track-${track}`,
    title: partLabel,
    type: "TRACK",
    track,
    questions: questions.map((question) => ({
      questionId: question.questionId,
      type: toRecruitingQuestionTypeFromField(question.fieldType),
      title: question.title,
      description: question.caption || undefined,
      required: question.required,
      options:
        question.fieldType === "radio" || question.fieldType === "checkbox"
          ? question.options.map((option) => ({
              optionId: option.optionId,
              content: option.content,
              other: false,
            }))
          : undefined,
    })),
  }
}

const TRACK_TO_PART_KEY: Record<RecruitingTrack, PartKey | undefined> =
  Object.fromEntries(
    Object.entries(PART_KEY_TO_TRACK).map(([partKey, track]) => [
      track,
      partKey as PartKey,
    ]),
  ) as Record<RecruitingTrack, PartKey | undefined>

// 생성 마법사가 다루는 문항 유형(text/radio/checkbox/file/portfolio) 밖의
// 응답 타입(LONG_TEXT/DROPDOWN/SCHEDULE 등)은 아직 편집 UI가 없어 "text"로
// 안전하게 내려서 최소한 값이 사라지진 않게 한다.
function toRecruitmentFieldType(
  type: RecruitingQuestionType,
): RecruitmentFieldType {
  switch (type) {
    case "RADIO":
      return "radio"
    case "CHECKBOX":
      return "checkbox"
    case "FILE":
      return "file"
    case "PORTFOLIO":
      return "portfolio"
    default:
      return "text"
  }
}

function mapAdminQuestionResponseToRecruitmentQuestion(
  question: RecruitingAdminFormQuestionResponse,
): RecruitmentQuestion {
  const fieldType = toRecruitmentFieldType(question.type)
  return makeRecruitmentQuestion({
    questionId: question.questionId,
    title: fieldType === "portfolio" ? "" : question.title,
    caption: question.description ?? "",
    fieldType,
    required: question.required,
    options: (question.options ?? []).map((option) => ({
      optionId: option.optionId,
      content: option.content,
    })),
  })
}

export interface RecruitmentQuestionDraftState {
  questionToggleState: Record<string, { enabled: boolean; required: boolean }>
  removedOptionsByQuestionIndex: Record<string, string[]>
  commonQuestionDrafts: RecruitmentQuestion[]
  partQuestionDrafts: Partial<Record<PartKey, RecruitmentQuestion[]>>
  enabledParts: Partial<Record<PartKey, boolean>>
  secondChoiceEnabled: boolean
  // 저장 시 기존 섹션을 새 섹션처럼 보내 백엔드가 지우고 다시 만들지 않도록,
  // GET 응답의 sectionId를 그대로 들고 있다가 Upsert 요청에 되돌려 보낸다.
  commonSectionId?: number
  sectionIdByPart: Partial<Record<PartKey, number>>
}

// GET .../rounds/{roundId}/form(RecruitingAdminFormStructureResponse) 응답을
// 생성 마법사 Step2(RecruitmentQuestionForm)가 쓰는 내부 draft 모델로 되돌린다.
// 고정 문항(01~05)은 제목을 못 바꾸므로 title로 매칭하고, 나머지 COMMON 문항은
// 운영진이 추가한 자유 문항으로 취급한다. Form이 아직 없으면(exists: false)
// undefined를 반환해 호출부가 생성 모드와 동일한 빈 draft로 폴백하게 한다.
export function mapAdminFormToQuestionDraft(
  structure: RecruitingAdminFormStructureResponse | undefined,
): RecruitmentQuestionDraftState | undefined {
  if (!structure || !structure.exists) return undefined

  const commonSection = structure.sections.find((s) => s.type === "COMMON")
  const trackSections = structure.sections.filter((s) => s.type === "TRACK")

  const questionToggleState: Record<
    string,
    { enabled: boolean; required: boolean }
  > = {}
  const removedOptionsByQuestionIndex: Record<string, string[]> = {}
  const commonQuestionDrafts: RecruitmentQuestion[] = []

  const responseQuestions = commonSection?.questions ?? []
  const matchedResponseQuestions =
    new Set<RecruitingAdminFormQuestionResponse>()

  for (const defaultQuestion of RECRUITMENT_DEFAULT_QUESTIONS) {
    const matched = responseQuestions.find(
      (q) => q.title === defaultQuestion.title,
    )
    if (["03", "04"].includes(defaultQuestion.index)) {
      if (matched) {
        const responseOptionContents = new Set(
          (matched.options ?? []).map((o) => o.content),
        )
        const removed = (defaultQuestion.options ?? []).filter(
          (option) => !responseOptionContents.has(option),
        )
        questionToggleState[defaultQuestion.index] = {
          enabled: true,
          required: matched.required,
        }
        if (removed.length > 0) {
          removedOptionsByQuestionIndex[defaultQuestion.index] = removed
        }
      } else {
        // 2지망(04)만 통째로 끌 수 있다. 1지망(03)이 응답에 없는 건
        // 비정상 상태라 기본값(활성)으로 둔다.
        questionToggleState[defaultQuestion.index] = {
          enabled: defaultQuestion.index !== "04",
          required: true,
        }
      }
    }
    if (matched) matchedResponseQuestions.add(matched)
  }

  for (const question of responseQuestions) {
    if (matchedResponseQuestions.has(question)) continue
    commonQuestionDrafts.push(
      mapAdminQuestionResponseToRecruitmentQuestion(question),
    )
  }

  const partQuestionDrafts: Partial<Record<PartKey, RecruitmentQuestion[]>> = {}
  const enabledParts: Partial<Record<PartKey, boolean>> = {}
  const sectionIdByPart: Partial<Record<PartKey, number>> = {}

  for (const section of trackSections) {
    const partKey = section.track && TRACK_TO_PART_KEY[section.track]
    if (!partKey) continue
    enabledParts[partKey] = true
    partQuestionDrafts[partKey] = section.questions.map((question) =>
      mapAdminQuestionResponseToRecruitmentQuestion(question),
    )
    if (section.sectionId != null) sectionIdByPart[partKey] = section.sectionId
  }

  return {
    questionToggleState,
    removedOptionsByQuestionIndex,
    commonQuestionDrafts:
      commonQuestionDrafts.length > 0
        ? commonQuestionDrafts
        : [makeRecruitmentQuestion()],
    partQuestionDrafts,
    enabledParts,
    secondChoiceEnabled: questionToggleState["04"]?.enabled ?? true,
    commonSectionId: commonSection?.sectionId,
    sectionIdByPart,
  }
}
