import { genId } from "./applicationQuestion"
import { useProjectRegisterStore } from "./useProjectRegisterStore"

import type {
  ApplicationFormSection,
  ApplicationQuestionItem,
  GetApplicationFormResponse,
} from "../api/types"
import type { FieldType, Question, Section } from "./applicationQuestion"

const API_TYPE_TO_FIELD: Record<ApplicationQuestionItem["type"], FieldType> = {
  LONG_TEXT: "text",
  SHORT_TEXT: "text",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  FILE: "file",
  PORTFOLIO: "portfolio",
  DROPDOWN: "radio",
  SCHEDULE: "text",
}

const ALLOWED_PARTS_TO_SECTION_ID: Record<string, string> = {
  DESIGN: "design",
  "WEB,IOS,ANDROID": "frontend",
  WEB: "frontend",
  IOS: "frontend",
  ANDROID: "frontend",
  "SPRINGBOOT,NODEJS": "backend",
  SPRINGBOOT: "backend",
  NODEJS: "backend",
}

function toQuestion(apiQ: ApplicationQuestionItem): Question {
  return {
    id: genId(),
    title: apiQ.title,
    caption: apiQ.description ?? "",
    fieldType: API_TYPE_TO_FIELD[apiQ.type] ?? "text",
    required: apiQ.isRequired ?? false,
    options: apiQ.options.map((o) => o.content),
  }
}

function resolvePartSectionId(apiSection: ApplicationFormSection): string {
  const parts = (apiSection.allowedParts ?? []).slice().sort().join(",")
  return ALLOWED_PARTS_TO_SECTION_ID[parts] ?? apiSection.title.toLowerCase()
}

export function hydrateApplicationFormIntoStore(
  response: GetApplicationFormResponse,
): void {
  if (!response.sections || response.sections.length === 0) return

  const sorted = [...response.sections].sort(
    (a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0),
  )

  const commonApiSection = sorted.find((s) => s.type === "COMMON")
  const partApiSections = sorted.filter((s) => s.type === "PART")

  const commonQuestions: Question[] = (commonApiSection?.questions ?? []).map(
    toQuestion,
  )

  const DEFAULT_SECTIONS: Section[] = [
    { id: "design", name: "Design", isEnabled: false, questions: [] },
    { id: "frontend", name: "Frontend", isEnabled: false, questions: [] },
    { id: "backend", name: "Backend", isEnabled: false, questions: [] },
  ]

  const sections: Section[] = DEFAULT_SECTIONS.map((defaultSec) => {
    const apiSec = partApiSections.find(
      (s) => resolvePartSectionId(s) === defaultSec.id,
    )
    if (!apiSec) return defaultSec
    return {
      ...defaultSec,
      isEnabled: true,
      questions: apiSec.questions.map(toQuestion),
    }
  })

  useProjectRegisterStore
    .getState()
    .setApplication({ commonQuestions, sections })
}
