import { getScaleTextKey } from "./types"

import type {
  FeedbackContext,
  FeedbackForm,
  FeedbackOption,
  FeedbackQuestion,
  FeedbackTargetType,
  UserFeedbackAnswerItem,
} from "../api/types"
import type { SurveyAnswers, SurveyVariantConfig } from "./types"
import type { SurveyVariantKey } from "./variants"

export function resolveVariantKey(
  context: FeedbackContext,
  targetType: FeedbackTargetType,
): SurveyVariantKey | null {
  switch (context) {
    case "APPLICATION_SUBMITTED":
      if (targetType === "NEW_CHALLENGER") return "new-gisu-general-apply"
      if (targetType === "EXPERIENCED_CHALLENGER")
        return "prev-gisu-general-apply"
      return null
    case "MATCHING_COMPLETED":
      if (targetType === "NEW_CHALLENGER") return "new-gisu-general-matching"
      if (targetType === "EXPERIENCED_CHALLENGER")
        return "prev-gisu-general-matching"
      return null
    case "APPLICATION_MONITORING":
      if (targetType === "ADMIN") return "admin-matching"
      return null
    default:
      return null
  }
}

type Slot =
  | { kind: "scale"; id: string; scores: number[] }
  | { kind: "choice"; id: string }
  | { kind: "select"; id: string; optionValues: string[] }
  | { kind: "text"; id: string }

function flattenSlots(config: SurveyVariantConfig): Slot[] {
  const slots: Slot[] = []
  for (const step of config.steps) {
    for (const item of step.items) {
      switch (item.kind) {
        case "divider":
          break
        case "emoji-scale":
          slots.push({ kind: "scale", id: item.id, scores: item.scores })
          break
        case "emoji-scale-with-text":
          slots.push({ kind: "scale", id: item.id, scores: item.scores })
          slots.push({ kind: "text", id: getScaleTextKey(item.id) })
          break
        case "emoji-choice":
          slots.push({ kind: "choice", id: item.id })
          break
        case "text":
          slots.push({ kind: "text", id: item.id })
          break
        case "single-select":
          slots.push({
            kind: "select",
            id: item.id,
            optionValues: item.options.map((option) => option.value),
          })
          break
      }
    }
  }
  return slots
}

const byOrderNo = (a: { orderNo?: number }, b: { orderNo?: number }): number =>
  Number(a.orderNo ?? 0) - Number(b.orderNo ?? 0)

function flattenQuestions(form: FeedbackForm): FeedbackQuestion[] {
  return [...(form.sections ?? [])]
    .sort(byOrderNo)
    .flatMap((section) => [...(section.questions ?? [])].sort(byOrderNo))
}

function sortedOptions(question: FeedbackQuestion): FeedbackOption[] {
  return [...(question.options ?? [])].sort(byOrderNo)
}

export function toAnswerItems(
  config: SurveyVariantConfig,
  form: FeedbackForm,
  answers: SurveyAnswers,
): UserFeedbackAnswerItem[] {
  const slots = flattenSlots(config)
  const questions = flattenQuestions(form)

  if (slots.length !== questions.length) {
    throw new Error(
      `[usability-survey] 슬롯/질문 개수 불일치 (${slots.length} vs ${questions.length})`,
    )
  }

  const items: UserFeedbackAnswerItem[] = []

  slots.forEach((slot, index) => {
    const question = questions[index]
    const questionId = Number(question.questionId)
    const options = sortedOptions(question)
    const raw = answers[slot.id]

    switch (slot.kind) {
      case "scale": {
        if (typeof raw !== "number") break
        const option = options[slot.scores.indexOf(raw)]
        if (option)
          items.push({
            questionId,
            selectedOptionIds: [Number(option.optionId)],
          })
        break
      }
      case "choice": {
        if (raw !== "positive" && raw !== "negative") break
        const option = options[raw === "positive" ? 0 : 1]
        if (option)
          items.push({
            questionId,
            selectedOptionIds: [Number(option.optionId)],
          })
        break
      }
      case "select": {
        if (typeof raw !== "string" || raw === "") break
        const option = options[slot.optionValues.indexOf(raw)]
        if (option)
          items.push({
            questionId,
            selectedOptionIds: [Number(option.optionId)],
          })
        break
      }
      case "text": {
        if (typeof raw !== "string" || raw.trim() === "") break
        items.push({ questionId, textValue: raw })
        break
      }
    }
  })

  return items
}
