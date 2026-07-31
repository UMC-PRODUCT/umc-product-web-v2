import { z } from "zod"

import type {
  ApplicationQuestion,
  ApplicationSection,
} from "./applicationDetail"

export const APPLY_SHORT_TEXT_MAX = 200
export const APPLY_LONG_TEXT_MAX = 500

// fileId 는 업로드가 끝나야 생긴다. 그 전에는 uploading 만 서 있다.
export interface ApplyUploadedFile {
  name: string
  fileId?: string
  uploading?: boolean
}

export type ApplyPortfolioAnswer =
  | { kind: "link"; url: string }
  | { kind: "file"; name: string; fileId?: string; uploading?: boolean }

export type ApplyAnswerValue =
  | string
  | string[]
  | ApplyPortfolioAnswer
  | ApplyUploadedFile
  | null

export interface ApplyRecruitmentInfo {
  recruitmentId: string
  title: string
  school: string
  notice: string
  noticeUrl?: string | null
  logoUrl: string | null
}

export interface ApplyFormConfig {
  recruitment: ApplyRecruitmentInfo
  sections: ApplicationSection[]
  partQuestionIds: string[]
  partOptionSectionMap: Record<string, string>
  nameQuestionId?: string
}

export function isApplyUploadedFile(
  value: ApplyAnswerValue,
): value is ApplyUploadedFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    !("kind" in value)
  )
}

export function isApplyPortfolioValue(
  value: ApplyAnswerValue,
): value is ApplyPortfolioAnswer {
  return typeof value === "object" && value !== null && "kind" in value
}

export function defaultApplyValue(
  question: ApplicationQuestion,
): ApplyAnswerValue {
  if (question.type === "checkbox" || question.type === "schedule") return []
  if (question.type === "file" || question.type === "portfolio") return null
  return ""
}

export function buildDefaultApplyValues(sections: ApplicationSection[]) {
  const values: Record<string, ApplyAnswerValue> = {}
  sections.forEach((section) => {
    section.questions.forEach((question) => {
      values[question.questionId] = defaultApplyValue(question)
    })
  })
  return values
}

function isEmptyAnswer(value: ApplyAnswerValue): boolean {
  if (typeof value === "string") return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

// 지망을 바꾸면 새 문항이 폼에 등록되면서 값 목록에 빈 항목이 늘어난다. 값을
// 통째로 비교하면 사용자가 아무것도 안 썼는데도 "작성 중"으로 잡혀 이탈 경고가
// 뜬다. 실제로 채운 답변만 남겨 비교한다.
export function toDirtySnapshot(
  values: Record<string, ApplyAnswerValue | undefined>,
) {
  const filled = Object.entries(values)
    .filter(([, value]) => value != null && !isEmptyAnswer(value))
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(filled)
}

export function resolveEnabledSectionIds(
  config: ApplyFormConfig,
  values: Record<string, unknown>,
) {
  // 서버는 선택한 지망에 해당하는 섹션만 내려준다. 파트 문항으로 섹션을 여닫는
  // 것은 지망까지 한 폼에 담았던 목업의 방식이라, 그 설정이 없으면 받은 섹션을
  // 모두 연다. 여기서 닫으면 파트 문항이 화면에서 사라지고 검증도 빠진다.
  if (config.partQuestionIds.length === 0) {
    return new Set(config.sections.map((section) => section.sectionId))
  }

  const enabled = new Set<string>()
  config.sections.forEach((section) => {
    if (section.type === "common") enabled.add(section.sectionId)
  })
  config.partQuestionIds.forEach((questionId) => {
    const value = values[questionId]
    if (typeof value !== "string" || !value) return
    const sectionId = config.partOptionSectionMap[value]
    if (sectionId) enabled.add(sectionId)
  })
  return enabled
}

// 공백만 넣은 답변은 저장 요청에서 빠진다(model/applyPayload.ts). 검증만
// 통과시키면 서버가 제출 단계에서 '필수 문항 미응답'으로 거부하는데, 화면에는
// 칸이 채워진 듯 보여 원인을 찾을 수 없다.
function isFilled(value: string) {
  return value.trim().length > 0
}

const UPLOAD_IN_PROGRESS = "업로드가 끝난 뒤 제출할 수 있습니다."

function isUploadingValue(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "uploading" in value &&
    (value as { uploading?: boolean }).uploading === true
  )
}

// 업로드가 끝나야 fileId 가 생긴다. 스키마가 이것을 요구하므로 업로드 도중에는
// 필수 문항 검증이 통과하지 않는다.
const portfolioValueSchema = z.union([
  z.object({
    kind: z.literal("link"),
    url: z
      .string()
      .url("유효한 URL을 입력해 주세요. (예: https://example.com)"),
  }),
  z.object({
    kind: z.literal("file"),
    name: z.string().min(1),
    fileId: z.string().min(1, UPLOAD_IN_PROGRESS),
  }),
])

const uploadedFileValueSchema = z.object({
  name: z.string().min(1),
  fileId: z.string().min(1, UPLOAD_IN_PROGRESS),
})

// 선택 문항의 업로드가 도중이면 검증은 통과하지만 답변이 조용히 빠진다.
// 그런 제출을 막으려고 진행 중인 업로드가 하나라도 있으면 버튼을 잠근다.
// 지금 구조에 있는 문항만 센다 — 지망을 바꿔 빠진 문항의 값은 제출되지 않으므로
// 그 업로드까지 기다리면 버튼이 영영 풀리지 않는다.
export function hasPendingUpload(
  values: Record<string, unknown>,
  sections: ApplicationSection[],
): boolean {
  const questionIds = new Set(
    sections.flatMap((section) =>
      section.questions.map((question) => question.questionId),
    ),
  )
  return Object.entries(values).some(
    ([questionId, value]) =>
      questionIds.has(questionId) && isUploadingValue(value),
  )
}

function questionSchema(
  question: ApplicationQuestion,
  enabled: boolean,
): z.ZodTypeAny {
  const required = question.required && enabled
  switch (question.type) {
    case "shortText": {
      const base = z
        .string()
        .max(
          APPLY_SHORT_TEXT_MAX,
          `${APPLY_SHORT_TEXT_MAX}자 이내로 입력해 주세요.`,
        )
      return required ? base.refine(isFilled, "필수 항목입니다.") : base
    }
    case "longText": {
      const base = z
        .string()
        .max(
          APPLY_LONG_TEXT_MAX,
          `${APPLY_LONG_TEXT_MAX}자 이내로 입력해 주세요.`,
        )
      return required ? base.refine(isFilled, "필수 항목입니다.") : base
    }
    case "radio":
    case "dropdown":
      return required ? z.string().min(1, "선택해 주세요.") : z.string()
    case "checkbox":
      return required
        ? z.array(z.string()).min(1, "한 개 이상 선택해 주세요.")
        : z.array(z.string())
    // 일정 문항을 입력할 UI 가 아직 없다. 필수로 두면 채울 방법 없이 제출이
    // 막히므로 값이 들어올 때만 문자열 배열로 받는다.
    case "schedule":
      return z.array(z.string()).optional()
    case "file":
      if (required) {
        return z.unknown().superRefine((value, ctx) => {
          if (uploadedFileValueSchema.safeParse(value).success) return
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            // 파일은 골랐는데 아직 올라가는 중이면 첨부가 없다고 하면 안 된다.
            message: isUploadingValue(value)
              ? UPLOAD_IN_PROGRESS
              : "파일을 첨부해 주세요.",
          })
        })
      }
      // 선택 문항은 업로드가 끝나지 않아도 오류를 내지 않는다. 제출 자체는
      // hasPendingUpload 가 막으므로, 여기서 막으면 아직 올라가는 중인 파일에
      // 영문 스키마 오류만 뜬다.
      return z.unknown().superRefine((value, ctx) => {
        if (value == null || isUploadingValue(value)) return
        if (uploadedFileValueSchema.safeParse(value).success) return
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "파일을 다시 첨부해 주세요.",
        })
      })
    case "portfolio":
      if (required) {
        return z.unknown().superRefine((value, ctx) => {
          if (value === null || value === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "포트폴리오를 제출해 주세요.",
            })
            return
          }
          // union 검증이 실패하면 zod 가 "Invalid input" 을 준다. 업로드 중인
          // 값은 그 경로로 새지 않게 먼저 가른다.
          if (isUploadingValue(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: UPLOAD_IN_PROGRESS,
            })
            return
          }
          const parsed = portfolioValueSchema.safeParse(value)
          if (!parsed.success) {
            const [firstIssue] = parsed.error.issues
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: firstIssue?.message ?? "포트폴리오를 확인해 주세요.",
            })
          }
        })
      }
      return z.unknown().superRefine((value, ctx) => {
        if (value == null || isUploadingValue(value)) return
        const parsed = portfolioValueSchema.safeParse(value)
        if (parsed.success) return
        const [firstIssue] = parsed.error.issues
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: firstIssue?.message ?? "포트폴리오를 확인해 주세요.",
        })
      })
  }
}

export function buildRecruitingAnswersSchema(
  sections: ApplicationSection[],
  enabledSectionIds: Set<string>,
) {
  const shape: Record<string, z.ZodTypeAny> = {}
  sections.forEach((section) => {
    const enabled = enabledSectionIds.has(section.sectionId)
    section.questions.forEach((question) => {
      shape[question.questionId] = questionSchema(question, enabled)
    })
  })
  return z.object(shape)
}
