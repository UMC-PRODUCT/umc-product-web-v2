import { z } from "zod"

import type { PortfolioValue } from "@/shared/ui/question-field/PortfolioField"

import type {
  ApplicationQuestion,
  ApplicationSection,
} from "./applicationDetail"

export const APPLY_SHORT_TEXT_MAX = 200
export const APPLY_LONG_TEXT_MAX = 500

export interface ApplyUploadedFile {
  name: string
}

export type ApplyAnswerValue =
  | string
  | string[]
  | PortfolioValue
  | ApplyUploadedFile
  | null

export interface ApplyRecruitmentInfo {
  recruitmentId: string
  title: string
  school: string
  notice: string
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
): value is PortfolioValue {
  return typeof value === "object" && value !== null && "kind" in value
}

export function buildDefaultApplyValues(sections: ApplicationSection[]) {
  const values: Record<string, ApplyAnswerValue> = {}
  sections.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.type === "checkbox") {
        values[question.questionId] = []
        return
      }
      if (question.type === "file" || question.type === "portfolio") {
        values[question.questionId] = null
        return
      }
      values[question.questionId] = ""
    })
  })
  return values
}

export function resolveEnabledSectionIds(
  config: ApplyFormConfig,
  values: Record<string, unknown>,
) {
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
    file: z.instanceof(File).optional(),
  }),
])

const uploadedFileValueSchema = z.object({ name: z.string().min(1) })

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
      return required ? base.min(1, "필수 항목입니다.") : base
    }
    case "longText": {
      const base = z
        .string()
        .max(
          APPLY_LONG_TEXT_MAX,
          `${APPLY_LONG_TEXT_MAX}자 이내로 입력해 주세요.`,
        )
      return required ? base.min(1, "필수 항목입니다.") : base
    }
    case "radio":
    case "dropdown":
      return required ? z.string().min(1, "선택해 주세요.") : z.string()
    case "checkbox":
      return required
        ? z.array(z.string()).min(1, "한 개 이상 선택해 주세요.")
        : z.array(z.string())
    case "file":
      if (required) {
        return z.unknown().superRefine((value, ctx) => {
          if (!uploadedFileValueSchema.safeParse(value).success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "파일을 첨부해 주세요.",
            })
          }
        })
      }
      return uploadedFileValueSchema.nullable().optional()
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
      return portfolioValueSchema.nullable().optional()
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
