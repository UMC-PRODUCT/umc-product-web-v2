import { isChapter } from "@/entities/organization/model/chapters"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"

import { PART_KEY_TO_TRACK, type PartKey, PARTS } from "./parts"
import {
  buildRecruitmentPreviewTitle,
  INITIAL_PERIOD_FORM,
  type PeriodFieldKey,
  type PeriodFieldValue,
} from "./recruitmentCreate"
import {
  makeRecruitmentQuestion,
  RECRUITMENT_DEFAULT_QUESTIONS,
  type RecruitmentQuestion,
  type RecruitmentQuestionOption,
  type RecruitmentQuestionToggleState,
} from "./recruitmentQuestion"

import type { Chapter } from "@/entities/organization/model/chapters"

import type {
  RecruitingAdminFormQuestion,
  RecruitingAdminFormSection,
  RecruitingAdminFormStructure,
  RecruitingRound,
  RecruitingRoundGroup,
} from "../api/types"
import type { RecruitmentBasicInfo } from "./useRecruitmentCreateStore"

export interface RecruitmentQuestionDraftState {
  basicSectionId?: number
  commonSectionId?: number
  removedOptionsByQuestionIndex: Record<string, string[]>
  questionToggleState: Record<string, RecruitmentQuestionToggleState>
  commonQuestionDrafts: RecruitmentQuestion[]
  partQuestionDrafts: Record<PartKey, RecruitmentQuestion[]>
  partSectionIds: Partial<Record<PartKey, number>>
  enabledParts: Record<PartKey, boolean>
}

export interface RecruitmentDraftHydration {
  roundId: string
  seasonId: string
  gisuGeneration: number | null | undefined
  chapter: Chapter | undefined
  school: string | undefined
  basicInfo: RecruitmentBasicInfo
  announcement: string
  contactText: string
  secondChoiceEnabled: boolean
  questionState: RecruitmentQuestionDraftState
}

function toLocalPeriodField(
  value: string | null,
  fallback: PeriodFieldValue,
): PeriodFieldValue {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

function toPeriodForm(round: RecruitingRound) {
  const values: Record<PeriodFieldKey, PeriodFieldValue> = {
    ...INITIAL_PERIOD_FORM,
    documentStartAt: toLocalPeriodField(
      round.documentStartAt,
      INITIAL_PERIOD_FORM.documentStartAt,
    ),
    documentEndAt: toLocalPeriodField(
      round.documentEndAt,
      INITIAL_PERIOD_FORM.documentEndAt,
    ),
    documentResultPublishedAt: toLocalPeriodField(
      round.documentResultPublishedAt,
      INITIAL_PERIOD_FORM.documentResultPublishedAt,
    ),
    interviewStartAt: toLocalPeriodField(
      round.interviewStartAt,
      INITIAL_PERIOD_FORM.interviewStartAt,
    ),
    interviewEndAt: toLocalPeriodField(
      round.interviewEndAt,
      INITIAL_PERIOD_FORM.interviewEndAt,
    ),
    finalResultPublishedAt: toLocalPeriodField(
      round.finalResultPublishedAt,
      INITIAL_PERIOD_FORM.finalResultPublishedAt,
    ),
  }
  return values
}

function extractFooter(
  title: string,
  school: string | undefined,
  round: RecruitingRound,
  generation: number | null | undefined,
): string {
  const baseTitle = buildRecruitmentPreviewTitle({
    school,
    recruitmentType: round.type,
    roundNo: String(round.roundNo),
    gisuGeneration: generation,
  })
  const prefix = `${baseTitle} `
  return title.startsWith(prefix) ? title.slice(prefix.length).trim() : ""
}

function toFieldType(
  question: RecruitingAdminFormQuestion,
): RecruitmentQuestion["fieldType"] {
  switch (question.type) {
    case "RADIO":
      return "radio"
    case "CHECKBOX":
      return "checkbox"
    case "FILE":
      return "file"
    case "PORTFOLIO":
      return "portfolio"
    case "SHORT_TEXT":
    case "LONG_TEXT":
    case "DROPDOWN":
    case "SCHEDULE":
      return "text"
  }
}

function toOption(
  option: RecruitingAdminFormQuestion["options"][number],
  sectionClientKeys: ReadonlyMap<string, string>,
) {
  const optionId =
    option.optionId.trim() === "" ? Number.NaN : Number(option.optionId)
  const nextSectionKey = option.nextSectionKey
    ? (sectionClientKeys.get(option.nextSectionKey) ?? option.nextSectionKey)
    : undefined
  const result: RecruitmentQuestionOption = {
    content: option.content,
    ...(nextSectionKey ? { nextSectionKey } : {}),
    ...(Number.isFinite(optionId) ? { optionId } : {}),
  }
  return result
}

function toQuestion(
  question: RecruitingAdminFormQuestion,
  sectionClientKeys: ReadonlyMap<string, string>,
): RecruitmentQuestion {
  const questionId =
    question.questionId.trim() === "" ? Number.NaN : Number(question.questionId)
  const base = makeRecruitmentQuestion({
    title: question.title,
    caption: question.description ?? "",
    fieldType: toFieldType(question),
    required: question.required,
    options: question.options.map((option) =>
      toOption(option, sectionClientKeys),
    ),
  })

  return {
    ...base,
    ...(Number.isFinite(questionId)
      ? { id: String(questionId), questionId }
      : {}),
  }
}

function findBasicQuestion(
  section: RecruitingAdminFormSection | undefined,
  title: string,
) {
  return section?.questions.find((question) => question.title === title)
}

function buildBasicQuestionState(
  section: RecruitingAdminFormSection | undefined,
  secondChoiceEnabled = true,
  sectionClientKeys: ReadonlyMap<string, string> = new Map(),
): Pick<
  RecruitmentQuestionDraftState,
  "removedOptionsByQuestionIndex" | "questionToggleState"
> {
  if (!section) {
    return {
      removedOptionsByQuestionIndex: {},
      questionToggleState: Object.fromEntries(
        ["03", "04"].map((index) => [
          index,
          {
            enabled: index === "04" ? secondChoiceEnabled : true,
            required: true,
          },
        ]),
      ),
    }
  }

  const removedOptionsByQuestionIndex: Record<string, string[]> = {}
  const questionToggleState = Object.fromEntries(
    RECRUITMENT_DEFAULT_QUESTIONS.filter((question) =>
      ["03", "04"].includes(question.index),
    ).map((question) => {
      const savedQuestion = findBasicQuestion(section, question.title)
      const savedOptions = new Set(
        savedQuestion?.options.map((option) => option.content) ?? [],
      )
      const removedOptions = (question.options ?? []).filter(
        (option) => !savedOptions.has(option),
      )
      if (removedOptions.length > 0) {
        removedOptionsByQuestionIndex[question.index] = removedOptions
      }
      const questionId = savedQuestion?.questionId.trim()
        ? Number(savedQuestion.questionId)
        : Number.NaN
      const optionIdsByContent = Object.fromEntries(
        (savedQuestion?.options ?? [])
          .map((option) => [option.content, Number(option.optionId)])
          .filter(([, optionId]) => Number.isFinite(optionId)),
      ) as Record<string, number>
      const nextSectionKeysByContent = Object.fromEntries(
        (savedQuestion?.options ?? [])
          .filter((option) => option.nextSectionKey != null)
          .map((option) => [
            option.content,
            sectionClientKeys.get(option.nextSectionKey!) ??
              option.nextSectionKey!,
          ]),
      ) as Record<string, string>
      return [
        question.index,
        {
          enabled: savedQuestion != null,
          required: savedQuestion?.required ?? true,
          ...(Number.isFinite(questionId) ? { questionId } : {}),
          ...(Object.keys(optionIdsByContent).length > 0
            ? { optionIdsByContent }
            : {}),
          ...(Object.keys(nextSectionKeysByContent).length > 0
            ? { nextSectionKeysByContent }
            : {}),
        },
      ]
    }),
  ) as Record<string, RecruitmentQuestionToggleState>

  return { removedOptionsByQuestionIndex, questionToggleState }
}

function emptyPartQuestions(): Record<PartKey, RecruitmentQuestion[]> {
  return Object.fromEntries(
    PARTS.map((part) => [part.key, [makeRecruitmentQuestion()]]),
  ) as Record<PartKey, RecruitmentQuestion[]>
}

function emptyCommonQuestions(): RecruitmentQuestion[] {
  return [makeRecruitmentQuestion()]
}

function buildQuestionState(
  form: RecruitingAdminFormStructure,
  secondChoiceEnabled: boolean,
  recruitableTracks: RecruitingRound["recruitableTracks"],
): RecruitmentQuestionDraftState {
  const sectionClientKeys = new Map<string, string>()
  for (const section of form.sections) {
    const sectionId = section.sectionId.trim()
    if (!sectionId) continue
    const clientKey =
      section.type === "TRACK" && section.track
        ? `track-${section.track}`
        : section.title === "기본 문항"
          ? "basic"
          : section.title === "공통 문항"
            ? "common"
            : section.clientKey
    sectionClientKeys.set(`section-${sectionId}`, clientKey)
    sectionClientKeys.set(section.clientKey, clientKey)
  }
  const basicSection = form.sections.find(
    (section) =>
      section.type === "COMMON" &&
      (section.clientKey === "basic" || section.title === "기본 문항"),
  )
  const commonSection = form.sections.find(
    (section) =>
      section.type === "COMMON" &&
      section.clientKey !== "basic" &&
      section.title !== "기본 문항",
  )
  const partQuestionDrafts = emptyPartQuestions()
  const enabledParts = Object.fromEntries(
    PARTS.map((part) => [part.key, false]),
  ) as Record<PartKey, boolean>
  const partSectionIds: Partial<Record<PartKey, number>> = {}
  let hasTrackSection = false

  for (const section of form.sections) {
    if (section.type !== "TRACK" || !section.track) continue
    hasTrackSection = true
    const part = PARTS.find(
      (item) => PART_KEY_TO_TRACK[item.key] === section.track,
    )
    if (!part) continue
    enabledParts[part.key] = true
    const sectionId = Number(section.sectionId)
    if (Number.isFinite(sectionId)) partSectionIds[part.key] = sectionId
    partQuestionDrafts[part.key] = section.questions
      .slice()
      .sort((a, b) => a.orderNo - b.orderNo)
      .map((question) => toQuestion(question, sectionClientKeys))
  }

  if (!hasTrackSection) {
    for (const part of PARTS) {
      enabledParts[part.key] = recruitableTracks.includes(
        PART_KEY_TO_TRACK[part.key],
      )
    }
  }

  return {
    basicSectionId: basicSection?.sectionId
      ? Number(basicSection.sectionId)
      : undefined,
    commonSectionId: commonSection?.sectionId
      ? Number(commonSection.sectionId)
      : undefined,
    ...buildBasicQuestionState(
      basicSection,
      secondChoiceEnabled,
      sectionClientKeys,
    ),
    commonQuestionDrafts: commonSection
      ? commonSection.questions
          .slice()
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((question) => toQuestion(question, sectionClientKeys))
      : emptyCommonQuestions(),
    partQuestionDrafts,
    partSectionIds,
    enabledParts,
  }
}

export function hydrateRecruitingDraft(
  group: RecruitingRoundGroup,
  round: RecruitingRound,
  form: RecruitingAdminFormStructure,
  generation: number | null | undefined,
): RecruitmentDraftHydration {
  const school = formatSchoolName(group.schoolName)
  const questionState = buildQuestionState(
    form,
    round.secondChoiceEnabled,
    round.recruitableTracks,
  )
  const basicInfo: RecruitmentBasicInfo = {
    chapter: isChapter(group.chapterName) ? group.chapterName : undefined,
    school,
    recruitmentType: round.type,
    roundNo: String(round.roundNo),
    interviewRequired: round.interviewRequired,
    footer: extractFooter(round.title, school, round, generation),
    periodForm: toPeriodForm(round),
  }

  return {
    roundId: round.roundId,
    seasonId: group.seasonId,
    gisuGeneration: generation,
    chapter: basicInfo.chapter,
    school,
    basicInfo,
    announcement: round.announcement ?? "",
    contactText: round.contactText ?? "",
    secondChoiceEnabled: round.secondChoiceEnabled,
    questionState,
  }
}
