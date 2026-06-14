import { defaultByFieldType } from "./applyValidation"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

import type { AnswerView, ApplicationDetail } from "../api/matchingProject"
import type { ApplyAnswerValue } from "./applyAnswerPayload"

function mapAnswerToValue(
  question: Question,
  answer: AnswerView | undefined,
): ApplyAnswerValue {
  if (!answer) return defaultByFieldType(question)

  switch (question.fieldType) {
    case "text":
      return answer.textValue ?? ""
    case "radio":
      return answer.selectedOptions?.[0]?.questionOptionId ?? ""
    case "checkbox":
      return answer.selectedOptions?.map((o) => o.questionOptionId) ?? []
    case "file": {
      const file = answer.files?.[0]
      return file
        ? { fileId: file.fileId, fileName: file.originalFileName }
        : null
    }
    case "portfolio": {
      const file = answer.files?.[0]
      if (file) {
        return {
          kind: "file",
          fileId: file.fileId,
          fileName: file.originalFileName,
        }
      }
      return answer.textValue ? { kind: "link", url: answer.textValue } : null
    }
  }
}

export function buildFormValuesFromDetail(
  detail: ApplicationDetail,
  sections: Section[],
): Record<string, ApplyAnswerValue> {
  const answerByQuestionId = new Map<string, AnswerView>()
  detail.formResponse.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.answer) answerByQuestionId.set(q.questionId, q.answer)
    })
  })

  const values: Record<string, ApplyAnswerValue> = {}
  sections.forEach((section) => {
    section.questions.forEach((q) => {
      values[q.id] = mapAnswerToValue(q, answerByQuestionId.get(q.id))
    })
  })
  return values
}
