import type { RatingScore } from "@/shared/assets/icon/emoji"

export type { RatingScore }

export type ChoiceValue = "positive" | "negative"

interface BaseQuestion {
  id: string
  text: string
  optional?: boolean
}

export interface ScaleQuestion extends BaseQuestion {
  kind: "emoji-scale"
  scores: RatingScore[]
  labels: string[]
}

export interface ScaleWithTextQuestion extends BaseQuestion {
  kind: "emoji-scale-with-text"
  scores: RatingScore[]
  labels: string[]
  textPlaceholder: string
}

export interface ChoiceQuestion extends BaseQuestion {
  kind: "emoji-choice"
  positiveLabel: string
  negativeLabel: string
}

export interface TextQuestion extends BaseQuestion {
  kind: "text"
  placeholder: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface SingleSelectQuestion extends BaseQuestion {
  kind: "single-select"
  options: SelectOption[]
}

export type SurveyQuestion =
  | ScaleQuestion
  | ScaleWithTextQuestion
  | ChoiceQuestion
  | TextQuestion
  | SingleSelectQuestion

export interface SurveyDivider {
  kind: "divider"
  id: string
  label?: string
}

export type SurveyItem = SurveyQuestion | SurveyDivider

export type SurveyFooter = "submit-only" | "next-only" | "back-submit"

export type SurveyRevealMode = "optional-group"

export interface SurveyStep {
  title: string
  items: SurveyItem[]
  footer: SurveyFooter
  reveal?: SurveyRevealMode
}

export interface SurveyVariantConfig {
  steps: [SurveyStep, ...SurveyStep[]]
  preventClose?: boolean
}

export type SurveyAnswerValue = RatingScore | ChoiceValue | string | null
export type SurveyAnswers = Record<string, SurveyAnswerValue>

export const getScaleTextKey = (id: string) => `${id}__text`

export function isItemAnswered(
  item: SurveyItem,
  answers: SurveyAnswers,
): boolean {
  if (item.kind === "divider") return true
  if (item.optional) return true
  const value = answers[item.id]
  return value !== undefined && value !== null && value !== ""
}
