import type { FieldType, Question, Section } from "../model/applicationQuestion"
import type {
  ApiPart,
  ApplicationQuestionItem,
  PartQuotaEntry,
  UpsertApplicationFormRequest,
} from "./types"

type UiRoleKey = "design" | "frontend" | "backend"
type UiStack = "Web" | "iOS" | "Android" | "SpringBoot" | "Node.js"

interface UiRoleState {
  count: number
  stack: UiStack | undefined
}

const STACK_TO_PART: Record<UiStack, ApiPart> = {
  Web: "WEB",
  iOS: "IOS",
  Android: "ANDROID",
  SpringBoot: "SPRINGBOOT",
  "Node.js": "NODEJS",
}

const SECTION_TO_ALLOWED_PARTS: Record<UiRoleKey, ApiPart[]> = {
  design: ["DESIGN"],
  frontend: ["WEB", "IOS", "ANDROID"],
  backend: ["SPRINGBOOT", "NODEJS"],
}

const FIELD_TYPE_TO_API: Record<FieldType, ApplicationQuestionItem["type"]> = {
  text: "LONG_TEXT",
  radio: "RADIO",
  checkbox: "CHECKBOX",
  file: "FILE",
  portfolio: "PORTFOLIO",
}

export function uiRoleToPart(
  role: UiRoleKey,
  stack: UiStack | undefined,
): ApiPart {
  if (role === "design") return "DESIGN"
  if (!stack) throw new Error(`Stack required for role "${role}"`)
  return STACK_TO_PART[stack]
}

export function buildPartQuotasEntries(
  roleStates: Record<UiRoleKey, UiRoleState>,
): PartQuotaEntry[] {
  return (Object.entries(roleStates) as [UiRoleKey, UiRoleState][])
    .filter(([, s]) => s.count > 0)
    .map(([key, s]) => ({
      part: uiRoleToPart(key, s.stack),
      quota: s.count,
    }))
}

function toApiQuestion(q: Question, idx: number): ApplicationQuestionItem {
  return {
    type: FIELD_TYPE_TO_API[q.fieldType],
    title: q.title,
    description: q.caption || undefined,
    isRequired: q.required,
    orderNo: idx,
    options: q.options.map((content, i) => ({ content, orderNo: i })),
  }
}

export function buildUpsertApplicationFormBody(
  commonQuestions: Question[],
  sections: Section[],
): UpsertApplicationFormRequest {
  const commonSection = {
    type: "COMMON" as const,
    title: "공통 질문",
    orderNo: 0,
    questions: commonQuestions.map(toApiQuestion),
  }

  const partSections = sections
    .filter((s) => s.isEnabled)
    .map((s, idx) => ({
      type: "PART" as const,
      allowedParts: SECTION_TO_ALLOWED_PARTS[s.id as UiRoleKey],
      title: s.name,
      orderNo: idx + 1,
      questions: s.questions.map(toApiQuestion),
    }))

  return { sections: [commonSection, ...partSections] }
}
