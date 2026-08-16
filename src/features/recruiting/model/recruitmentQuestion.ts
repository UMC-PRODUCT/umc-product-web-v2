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

// 공통 문항은 파트와 달리 "사용" 토글이 없다 — 운영진이 "+"로 추가해 놓고
// 제목·옵션 어느 것도 손대지 않은 초안은 "추가 안 함"으로 본다. 그래야 쓰지도
// 않을 빈 칸 하나 때문에 저장 자체가 막히지 않는다.
// questionId가 있는(=이미 서버에 저장된) 문항은 절대 여기 해당하지 않는다 —
// 그걸 "안 씀"으로 보고 저장 요청에서 빼면, 서버가 들고 있는 섹션의 질문 ID
// 셋과 어긋나 FORM-0025("재배치 요청의 질문 ID 셋이 일치하지 않습니다")가 난다.
export function isUntouchedCommonQuestion(
  question: RecruitmentQuestion,
): boolean {
  return (
    question.questionId == null &&
    question.title.trim() === "" &&
    question.options.length === 0
  )
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
    if (isUntouchedCommonQuestion(q)) continue
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

// 고정 문항(01~05)이 서버에 이미 저장돼 있을 때, 그 questionId·optionId를
// 기억해두는 용도. buildCommonSectionUpsertRequest가 이걸 안 받으면 고정
// 문항을 매번 id 없이 보내게 되어, 이미 있는 섹션의 질문 ID 셋과 어긋나
// FORM-0025("재배치 요청의 질문 ID 셋이 일치하지 않습니다")가 난다 — 사용자가
// 아무것도 바꾸지 않고 그냥 저장만 다시 눌러도 재현된다.
export interface DefaultQuestionMeta {
  questionId?: number
  optionIdByContent?: Record<string, number>
}

// COMMON 섹션의 서버 응답 문항들에서 고정 문항(01~05)의 id를 title로 찾아 모은다.
// mapAdminFormToQuestionDraft(최초 로드)와 저장 직후 재조회(FORM-0025 방지) 양쪽에서 쓴다.
function buildDefaultQuestionMeta(
  responseQuestions: RecruitingAdminFormQuestionResponse[],
): Record<string, DefaultQuestionMeta> {
  const meta: Record<string, DefaultQuestionMeta> = {}
  for (const defaultQuestion of RECRUITMENT_DEFAULT_QUESTIONS) {
    const matched = responseQuestions.find(
      (q) => q.title === defaultQuestion.title,
    )
    if (!matched) continue
    meta[defaultQuestion.index] = {
      questionId: matched.questionId,
      optionIdByContent:
        matched.options && matched.options.length > 0
          ? Object.fromEntries(
              matched.options
                .filter((o) => o.optionId != null)
                .map((o) => [o.content, o.optionId!]),
            )
          : undefined,
    }
  }
  return meta
}

// 공통 문항(01~05 고정 문항 + 운영진이 추가한 자유 문항) 섹션을 Form Upsert 요청
// payload로 직렬화한다. 파트별(TRACK) 섹션 직렬화는 buildTrackSectionUpsertRequest가
// 별도로 담당한다.
export function buildCommonSectionUpsertRequest(
  removedOptionsByQuestionIndex: Record<string, string[]>,
  questionToggleState: Record<string, { enabled: boolean; required: boolean }>,
  additionalQuestions: RecruitmentQuestion[] = [],
  sectionId?: number,
  defaultQuestionMeta: Record<string, DefaultQuestionMeta> = {},
): UpsertRecruitingSectionRequest {
  const defaultQuestions = RECRUITMENT_DEFAULT_QUESTIONS.filter(
    (question) => questionToggleState[question.index]?.enabled ?? true,
  ).map((question) => {
    const removed = removedOptionsByQuestionIndex[question.index] ?? []
    const activeOptions = question.options?.filter(
      (option) => !removed.includes(option),
    )
    const meta = defaultQuestionMeta[question.index]
    return {
      questionId: meta?.questionId,
      type: toRecruitingQuestionType(question.type),
      title: question.title,
      description: question.caption,
      required: questionToggleState[question.index]?.required ?? true,
      options: activeOptions?.map((content) => ({
        optionId: meta?.optionIdByContent?.[content],
        content,
        other: false,
      })),
    }
  })

  const extraQuestions = additionalQuestions
    .filter((question) => !isUntouchedCommonQuestion(question))
    .map((question) => ({
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
  // 고정 문항(01~05)의 questionId·optionId. buildCommonSectionUpsertRequest가
  // FORM-0025 없이 고정 문항을 갱신하려면 반드시 필요하다.
  defaultQuestionMeta: Record<string, DefaultQuestionMeta>
}

// upsert 응답은 폼 id만 돌려주고 서버가 새로 배정한 섹션/문항 id는 알려주지
// 않는다. 저장 직후 이 함수로 구조를 다시 조회해 섹션 id·고정 문항 id를 갱신해야,
// 같은 화면에서 두 번째로 저장할 때 id 없는 섹션·문항을 "새로 만드는 것"으로
// 보내 기존 것과 어긋나는 것(FORM-0025)을 막을 수 있다.
export function extractSectionIds(
  structure: RecruitingAdminFormStructureResponse | undefined,
): {
  commonSectionId?: number
  sectionIdByPart: Partial<Record<PartKey, number>>
  defaultQuestionMeta: Record<string, DefaultQuestionMeta>
} {
  const sectionIdByPart: Partial<Record<PartKey, number>> = {}
  if (!structure) return { sectionIdByPart, defaultQuestionMeta: {} }

  const commonSection = structure.sections.find((s) => s.type === "COMMON")
  for (const section of structure.sections) {
    if (section.type !== "TRACK") continue
    const partKey = section.track && TRACK_TO_PART_KEY[section.track]
    if (!partKey || section.sectionId == null) continue
    sectionIdByPart[partKey] = section.sectionId
  }

  return {
    commonSectionId: commonSection?.sectionId,
    sectionIdByPart,
    defaultQuestionMeta: buildDefaultQuestionMeta(
      commonSection?.questions ?? [],
    ),
  }
}

// COMMON 섹션 응답 문항 중 고정 문항(01~05)에 매칭되지 않은 것만 추린다 —
// 운영진이 "+"로 추가한 자유 문항. mapAdminFormToQuestionDraft와 같은 매칭
// 규칙(제목 완전 일치)을 쓴다.
function findExtraCommonResponseQuestions(
  responseQuestions: RecruitingAdminFormQuestionResponse[],
): RecruitingAdminFormQuestionResponse[] {
  const matched = new Set<RecruitingAdminFormQuestionResponse>()
  for (const defaultQuestion of RECRUITMENT_DEFAULT_QUESTIONS) {
    const found = responseQuestions.find(
      (q) => q.title === defaultQuestion.title,
    )
    if (found) matched.add(found)
  }
  return responseQuestions.filter((q) => !matched.has(q))
}

// 저장 직후 재조회한 응답을 로컬 draft 배열과 순서로 1:1 짝지어 questionId·
// optionId만 채워 넣는다. 로컬 id(genId)는 그대로 둬서 포커스·리스트 key가
// 안 흔들리게 한다 — 방금 보낸 배열 그대로의 순서로 응답이 오는 걸 전제한다.
function syncQuestionIds(
  drafts: RecruitmentQuestion[],
  responseQuestions: RecruitingAdminFormQuestionResponse[],
): RecruitmentQuestion[] {
  return drafts.map((draft, index) => {
    const matched = responseQuestions[index]
    if (!matched) return draft
    return {
      ...draft,
      questionId: matched.questionId,
      options: draft.options.map((option, optionIndex) => ({
        ...option,
        optionId: matched.options?.[optionIndex]?.optionId ?? option.optionId,
      })),
    }
  })
}

// upsert 저장 직후 이 함수로 다시 조회한 구조에서, 서버가 새로 배정한
// questionId를 공통 자유 문항·파트 문항 draft에 되돌려 준다. 안 하면 다음
// 저장 때도 이미 만들어진 문항을 다시 "새 문항"으로 보내 FORM-0025
// ("재배치 요청의 질문 ID 셋이 일치하지 않습니다")가 난다 — extractSectionIds가
// 섹션·고정문항 id에 대해 막는 것과 같은 문제를 자유 문항·파트 문항에 대해서도 막는다.
export function syncQuestionIdsAfterSave(
  structure: RecruitingAdminFormStructureResponse | undefined,
  commonQuestionDrafts: RecruitmentQuestion[],
  partQuestionDrafts: Partial<Record<PartKey, RecruitmentQuestion[]>>,
): {
  commonQuestionDrafts: RecruitmentQuestion[]
  partQuestionDrafts: Partial<Record<PartKey, RecruitmentQuestion[]>>
} {
  if (!structure) return { commonQuestionDrafts, partQuestionDrafts }

  const commonSection = structure.sections.find((s) => s.type === "COMMON")
  const extraResponseQuestions = findExtraCommonResponseQuestions(
    commonSection?.questions ?? [],
  )

  const nextPartQuestionDrafts: Partial<
    Record<PartKey, RecruitmentQuestion[]>
  > = { ...partQuestionDrafts }
  for (const section of structure.sections) {
    if (section.type !== "TRACK") continue
    const partKey = section.track && TRACK_TO_PART_KEY[section.track]
    const existing = partKey ? partQuestionDrafts[partKey] : undefined
    if (!partKey || !existing) continue
    nextPartQuestionDrafts[partKey] = syncQuestionIds(
      existing,
      section.questions,
    )
  }

  return {
    commonQuestionDrafts: syncQuestionIds(
      commonQuestionDrafts,
      extraResponseQuestions,
    ),
    partQuestionDrafts: nextPartQuestionDrafts,
  }
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
    defaultQuestionMeta: buildDefaultQuestionMeta(responseQuestions),
  }
}
