import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

import type { ApplicationAnswerItem } from "../api/matchingProject"
import type { ApplyPortfolioValue, UploadedFileValue } from "./applyValidation"

export type ApplyAnswerValue =
  | string
  | string[]
  | UploadedFileValue
  | ApplyPortfolioValue
  | null

export function isUploadedFileValue(
  v: ApplyAnswerValue,
): v is UploadedFileValue {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    "fileId" in v &&
    !("kind" in v)
  )
}

export function isApplyPortfolioValue(
  v: ApplyAnswerValue,
): v is ApplyPortfolioValue {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    "kind" in v &&
    (v.kind === "link" || v.kind === "file")
  )
}

export function getOptionValue(
  question: Question,
  optionIndex: number,
): string {
  const optionId = question.options[optionIndex]?.optionId
  return optionId != null
    ? String(optionId)
    : (question.options[optionIndex]?.content ?? "")
}

function parseOptionId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const optionId = Number(value)
  return Number.isSafeInteger(optionId) ? optionId : null
}

function getValidOptionId(question: Question, value: string): number | null {
  const optionId = parseOptionId(value)
  if (optionId === null) return null
  return question.options.some((option) => option.optionId === optionId)
    ? optionId
    : null
}

export function buildAnswerPayload(
  formValues: Record<string, ApplyAnswerValue>,
  sections: Section[],
  sectionEnabled: Record<string, boolean> = {},
): ApplicationAnswerItem[] {
  const questionMap = new Map<string, Question>()
  sections.forEach((s) => {
    const enabled = sectionEnabled[s.id] ?? s.isEnabled
    if (!enabled) return
    s.questions.forEach((q) => questionMap.set(q.id, q))
  })

  return Object.entries(formValues).flatMap(([questionId, value]) => {
    const question = questionMap.get(questionId)
    if (!question) return []

    const base = { questionId: Number(questionId) }

    if (question.fieldType === "text") {
      const text = typeof value === "string" ? value : ""
      if (text.trim() === "") return []
      return [{ ...base, textValue: text }]
    }

    if (question.fieldType === "radio") {
      if (typeof value !== "string" || !value) return []
      const optionId = getValidOptionId(question, value)
      if (optionId === null) return []
      return [{ ...base, selectedOptionIds: [optionId] }]
    }

    if (question.fieldType === "checkbox") {
      if (!Array.isArray(value) || value.length === 0) return []
      const selectedIds = value.flatMap((optionValue) => {
        const optionId = getValidOptionId(question, optionValue)
        return optionId === null ? [] : [optionId]
      })
      if (selectedIds.length === 0) return []
      return [{ ...base, selectedOptionIds: selectedIds }]
    }

    if (question.fieldType === "file") {
      if (!isUploadedFileValue(value)) return []
      return [{ ...base, fileIds: [value.fileId] }]
    }

    if (question.fieldType === "portfolio") {
      if (!isApplyPortfolioValue(value)) return []
      if (value.kind === "link") return [{ ...base, textValue: value.url }]
      return [{ ...base, fileIds: [value.fileId] }]
    }

    return []
  })
}
