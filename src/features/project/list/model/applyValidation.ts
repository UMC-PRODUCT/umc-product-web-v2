import { z } from "zod"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

const TEXT_MAX = 500

export type UploadedFileValue = { fileId: string; fileName: string }

export type ApplyPortfolioValue =
  | { kind: "link"; url: string }
  | { kind: "file"; fileId: string; fileName: string }

const uploadedFileSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
})

const portfolioSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("link"),
    url: z
      .string()
      .url("유효한 URL을 입력해 주세요. (예: https://example.com)"),
  }),
  z.object({
    kind: z.literal("file"),
    fileId: z.string().min(1),
    fileName: z.string().min(1),
  }),
])

function fieldSchema(q: Question, enabled: boolean): z.ZodTypeAny {
  const required = q.required && enabled
  switch (q.fieldType) {
    case "text": {
      const base = z
        .string()
        .max(TEXT_MAX, `${TEXT_MAX}자 이내로 입력해 주세요.`)
      return required ? base.min(1, "필수 항목입니다.") : base
    }
    case "radio":
      return required ? z.string().min(1, "선택해 주세요.") : z.string()
    case "checkbox":
      return required
        ? z.array(z.string()).min(1, "한 개 이상 선택해 주세요.")
        : z.array(z.string())
    case "file":
      if (required) {
        return z.unknown().superRefine((val, ctx) => {
          const parsed = uploadedFileSchema.safeParse(val)
          if (!parsed.success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "파일을 첨부해 주세요.",
            })
          }
        })
      }
      return uploadedFileSchema.nullable().optional()
    case "portfolio":
      if (required) {
        return z.unknown().superRefine((val, ctx) => {
          if (val === null || val === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "포트폴리오를 제출해 주세요.",
            })
            return z.NEVER
          }
          const parsed = portfolioSchema.safeParse(val)
          if (!parsed.success) {
            for (const issue of parsed.error.issues) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: issue.message,
                path: issue.path,
              })
            }
          }
        })
      }
      return portfolioSchema.nullable().optional()
  }
}

export function buildApplyAnswersSchema(
  sections: Section[],
  sectionEnabled: Record<string, boolean>,
) {
  const shape: Record<string, z.ZodTypeAny> = {}
  sections.forEach((section) => {
    const enabled = sectionEnabled[section.id] ?? section.isEnabled
    section.questions.forEach((q) => {
      shape[q.id] = fieldSchema(q, enabled)
    })
  })
  return z.object(shape)
}

export function defaultByFieldType(q: Question): string | string[] | null {
  switch (q.fieldType) {
    case "text":
    case "radio":
      return ""
    case "checkbox":
      return []
    case "file":
    case "portfolio":
      return null
  }
}
