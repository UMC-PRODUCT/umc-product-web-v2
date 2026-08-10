import { PART_TAG_LABEL } from "@/shared/model/domain"

import { formatBaseTime } from "./applicantListTypes"
import { toPartTags } from "./applicantMapper"

import type {
  RecruitingApplicationAnswer,
  RecruitingApplicationSummary,
  RecruitingFormQuestion,
  RecruitingFormStructure,
  RecruitingQuestionType,
  RecruitingRound,
  RecruitingRoundGroup,
} from "../api/types"
import type { EvaluationResult } from "./applicantListTypes"
import type {
  ApplicationDetail,
  ApplicationQuestion,
  ApplicationQuestionType,
  ApplicationSection,
} from "./applicationDetail"
import type { EvaluationStage } from "./evaluationStage"

const QUESTION_TYPE: Record<RecruitingQuestionType, ApplicationQuestionType> = {
  SHORT_TEXT: "shortText",
  LONG_TEXT: "longText",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  DROPDOWN: "dropdown",
  SCHEDULE: "schedule",
  FILE: "file",
  PORTFOLIO: "portfolio",
}

function toId(value: string | number): string {
  return String(value)
}

function scheduleText(times: string[]): string | null {
  if (times.length === 0) return null
  return times.map((time) => formatBaseTime(new Date(time))).join("\n")
}

const REMOVED_OPTION_PREFIX = "removed-"

// 폼에서 지워진 선택지는 문항 구조에 없지만 답변에는 응답 시점 텍스트가 남는다.
// 그대로 버리면 지원자가 무엇을 골랐는지 평가자에게 보이지 않으므로 선택지 목록
// 끝에 되살려 붙인다.
function resolveSelection(
  question: RecruitingFormQuestion,
  answer: RecruitingApplicationAnswer | undefined,
): Pick<ApplicationQuestion, "options" | "selectedOptionIds"> {
  const options = question.options
    .slice()
    .sort((a, b) => a.orderNo - b.orderNo)
    .map((option) => ({
      optionId: toId(option.optionId),
      content: option.content,
    }))
  const knownIds = new Set(options.map((option) => option.optionId))

  if (!answer?.selectedOptions) {
    const selectedOptionIds = (answer?.selectedOptionIds ?? []).map(toId)
    return { options, selectedOptionIds }
  }

  const selectedOptionIds: string[] = []
  answer.selectedOptions.forEach((selected, index) => {
    const optionId =
      selected.questionOptionId != null ? toId(selected.questionOptionId) : null

    if (optionId != null && knownIds.has(optionId)) {
      selectedOptionIds.push(optionId)
      return
    }
    if (!selected.answeredAsContent) return

    const removedId = `${REMOVED_OPTION_PREFIX}${index}`
    options.push({ optionId: removedId, content: selected.answeredAsContent })
    selectedOptionIds.push(removedId)
  })

  return { options, selectedOptionIds }
}

function toFiles(fileIds: string[]) {
  return fileIds.map((fileId, index) => ({
    fileId: toId(fileId),
    name: `첨부파일 ${index + 1}`,
    url: null,
  }))
}

function toQuestion(
  question: RecruitingFormQuestion,
  answer: RecruitingApplicationAnswer | undefined,
): ApplicationQuestion {
  // 답변에 실려 온 타입을 우선한다. 서버가 답변 시점의 문항 타입을 따로 보관해
  // 주는데, 문항이 나중에 다른 타입으로 바뀌면 현재 타입으로 그리는 순간 답변이
  // 화면에서 사라진다(예: 서술형 답변을 체크박스로 그리면 본문이 안 보인다).
  const type = QUESTION_TYPE[answer?.type ?? question.type]
  const times = answer?.times ?? []
  const { options, selectedOptionIds } = resolveSelection(question, answer)

  return {
    questionId: toId(question.questionId),
    type,
    title: question.title,
    description: question.description ?? undefined,
    required: question.required,
    options,
    textValue:
      type === "schedule" ? scheduleText(times) : (answer?.textValue ?? null),
    selectedOptionIds,
    files: toFiles(answer?.fileIds ?? []),
  }
}

// PUBLIC-002 는 공통 섹션과 트랙 섹션을 구분해 주지 않는다. 지원 트랙의 파트
// 라벨이 섹션 제목에 들어있으면 트랙 섹션으로 본다. 판정이 빗나가도 섹션 헤더
// 색상만 달라진다.
function isPartSection(title: string, partLabels: string[]): boolean {
  const normalized = title.toLowerCase()
  return partLabels.some((label) => normalized.includes(label.toLowerCase()))
}

export function toApplicationSections(
  structure: RecruitingFormStructure,
  answers: RecruitingApplicationAnswer[],
  choices: Pick<RecruitingApplicationSummary, "firstChoice" | "secondChoice">,
): ApplicationSection[] {
  const answerByQuestionId = new Map(
    answers.map((answer) => [toId(answer.questionId), answer]),
  )
  const partLabels = toPartTags(choices.firstChoice, choices.secondChoice).map(
    (tag) => PART_TAG_LABEL[tag],
  )

  return structure.sections
    .slice()
    .sort((a, b) => a.orderNo - b.orderNo)
    .map((section) => ({
      sectionId: toId(section.sectionId),
      type: isPartSection(section.title, partLabels)
        ? ("part" as const)
        : ("common" as const),
      title: section.title,
      questions: section.questions
        .slice()
        .sort((a, b) => a.orderNo - b.orderNo)
        .map((question) =>
          toQuestion(
            question,
            answerByQuestionId.get(toId(question.questionId)),
          ),
        ),
    }))
}

const STAGE_ORDER: EvaluationStage[] = ["document", "interview", "final"]

export function toReachedStages(
  summary: RecruitingApplicationSummary,
  interviewRequired: boolean,
): EvaluationStage[] {
  const { status } = summary
  if (status === "SUBMITTED" || status === "DOCUMENT_FAILED") {
    return ["document"]
  }
  if (status === "INTERVIEW_ASSIGNED") {
    return interviewRequired ? ["document", "interview"] : ["document"]
  }
  // 면접을 건너뛴 지원자는 면접 평가가 존재하지 않는다. 모집 차수가 면접을
  // 요구하더라도 단계를 노출하지 않는다.
  if (status === "INTERVIEW_SKIPPED") {
    return ["document", "final"]
  }
  if (status === "FINAL_PASSED" || status === "FINAL_FAILED") {
    return interviewRequired ? STAGE_ORDER : ["document", "final"]
  }
  return ["document"]
}

function toFinalResult(
  summary: RecruitingApplicationSummary,
): EvaluationResult | null {
  if (summary.status === "FINAL_PASSED") return "pass"
  if (summary.status === "FINAL_FAILED") return "fail"
  return null
}

export function toRecruitmentLabel(
  round: Pick<RecruitingRound, "type" | "roundNo">,
): string {
  return round.type === "ADDITIONAL"
    ? `${round.roundNo}차 추가 모집`
    : "본 모집"
}

export function toApplicationDetail(
  summary: RecruitingApplicationSummary,
  sections: ApplicationSection[],
  group: Pick<RecruitingRoundGroup, "chapterName" | "schoolName">,
  round: Pick<RecruitingRound, "type" | "roundNo" | "interviewRequired">,
): Omit<ApplicationDetail, "interview" | "evaluations"> {
  return {
    applicationId: toId(summary.applicationId),
    applicantName: summary.applicantName,
    chapter: group.chapterName,
    school: group.schoolName,
    recruitmentLabel: toRecruitmentLabel(round),
    parts: toPartTags(summary.firstChoice, summary.secondChoice),
    reachedStages: toReachedStages(summary, round.interviewRequired),
    finalResult: toFinalResult(summary),
    sections,
  }
}
