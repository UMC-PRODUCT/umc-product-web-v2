import type { RecruitingAnswerRequest } from "../api/types"
import type {
  ApplicationQuestion,
  ApplicationSection,
} from "./applicationDetail"

export interface ApplyUploadedFileValue {
  fileId: string
  name: string
}

export type ApplyPortfolioAnswerValue =
  | { kind: "link"; url: string }
  | { kind: "file"; fileId: string; name: string }

export type ApplyPayloadValue =
  | string
  | string[]
  | ApplyUploadedFileValue
  | ApplyPortfolioAnswerValue
  | null

export function isUploadedFileValue(
  value: ApplyPayloadValue,
): value is ApplyUploadedFileValue {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "fileId" in value &&
    !("kind" in value)
  )
}

export function isPortfolioAnswerValue(
  value: ApplyPayloadValue,
): value is ApplyPortfolioAnswerValue {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "kind" in value &&
    (value.kind === "link" || value.kind === "file")
  )
}

function toOptionId(
  question: ApplicationQuestion,
  value: string,
): number | null {
  if (!/^\d+$/.test(value)) return null
  const optionId = Number(value)
  if (!Number.isSafeInteger(optionId)) return null
  return question.options.some((option) => Number(option.optionId) === optionId)
    ? optionId
    : null
}

function toAnswer(
  question: ApplicationQuestion,
  value: ApplyPayloadValue,
): RecruitingAnswerRequest[] {
  const base = { questionId: Number(question.questionId) }
  if (!Number.isSafeInteger(base.questionId)) return []

  switch (question.type) {
    case "shortText":
    case "longText": {
      const text = typeof value === "string" ? value.trim() : ""
      return text === "" ? [] : [{ ...base, textValue: text }]
    }
    case "radio":
    case "dropdown": {
      if (typeof value !== "string" || !value) return []
      const optionId = toOptionId(question, value)
      return optionId === null
        ? []
        : [{ ...base, selectedOptionIds: [optionId] }]
    }
    case "checkbox": {
      if (!Array.isArray(value)) return []
      const selected = value.flatMap((entry) => {
        const optionId = toOptionId(question, entry)
        return optionId === null ? [] : [optionId]
      })
      return selected.length === 0
        ? []
        : [{ ...base, selectedOptionIds: selected }]
    }
    case "file": {
      if (!isUploadedFileValue(value)) return []
      return [{ ...base, fileIds: [value.fileId] }]
    }
    case "portfolio": {
      if (!isPortfolioAnswerValue(value)) return []
      if (value.kind === "link") {
        const url = value.url.trim()
        return url === "" ? [] : [{ ...base, textValue: url }]
      }
      return [{ ...base, fileIds: [value.fileId] }]
    }
    // 일정 답변을 담을 필드가 저장 요청에 없다. 서버가 times 를 받게 되면
    // 여기만 열면 된다.
    case "schedule":
      return []
  }
}

// 서버는 선택한 지망에 해당하는 섹션의 문항만 허용한다(allowedQuestionIds).
// 파트를 바꾸면 이전 파트의 답변이 폼 상태에 남아 있으므로, 현재 구조에 있는
// 문항만 추려 보낸다. 남은 값을 지우지는 않는다 — 지망을 되돌리면 되살아난다.
export function buildApplyAnswerPayload(
  values: Record<string, ApplyPayloadValue>,
  sections: ApplicationSection[],
): RecruitingAnswerRequest[] {
  const questionById = new Map<string, ApplicationQuestion>()
  sections.forEach((section) => {
    section.questions.forEach((question) => {
      questionById.set(question.questionId, question)
    })
  })

  return Object.entries(values).flatMap(([questionId, value]) => {
    const question = questionById.get(questionId)
    if (!question) return []
    return toAnswer(question, value)
  })
}
