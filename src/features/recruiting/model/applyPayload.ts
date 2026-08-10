import type { RecruitingAnswerRequest } from "../api/types"
import type {
  ApplicationQuestion,
  ApplicationSection,
} from "./applicationDetail"
import type {
  ApplyAnswerValue,
  ApplyPortfolioAnswer,
  ApplyUploadedFile,
} from "./applyForm"

// 폼이 들고 있는 값을 그대로 받는다. 별도로 선언하면 폼 쪽 타입이 바뀔 때
// 호출부의 캐스팅이 그 차이를 조용히 덮는다.
export type ApplyPayloadValue = ApplyAnswerValue

// 업로드가 끝난 값만 페이로드에 담는다. fileId 가 없으면 아직 올라가는 중이거나
// 실패한 것이다.
type UploadedFile = ApplyUploadedFile & { fileId: string }

export function isUploadedFileValue(
  value: ApplyPayloadValue,
): value is UploadedFile {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "fileId" in value &&
    typeof value.fileId === "string" &&
    value.fileId.length > 0 &&
    !("kind" in value)
  )
}

export function isPortfolioAnswerValue(
  value: ApplyPayloadValue,
): value is ApplyPortfolioAnswer {
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
      // 업로드가 끝나지 않은 포트폴리오 파일은 보낼 fileId 가 없다.
      if (!value.fileId) return []
      return [{ ...base, fileIds: [value.fileId] }]
    }
    // 일정 답변은 지원서 저장으로 보내지 않는다. 면접 가능 시간은 서류 합격 뒤
    // 정해진 기간에 한 번만 받는 값이라 전용 경로로 갈라져 있고, 그 경로가
    // 지원서의 times 까지 채운다.
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
