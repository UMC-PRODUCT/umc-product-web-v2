import {
  APPLICANT_LIST_MOCK,
  RECRUITING_TARGET_GISU_LABEL_MOCK,
} from "./applicantList.mock"
import {
  type ApplicantRow,
  formatRecruitmentType,
  getStageEvaluation,
} from "./applicantListTypes"

import type { PartTag } from "@/shared/model/domain"

import type {
  ApplicationDetail,
  ApplicationSection,
  OperatorEvaluation,
  StageEvaluationDetail,
} from "./applicationDetail"
import type { EvaluationStage } from "./evaluationStage"

const RECRUITING_PARTS: PartTag[] = ["pm", "design", "web-pe", "mobile-pe"]

const PART_LABEL: Partial<Record<PartTag, string>> = {
  pm: "PM",
  design: "Design",
  "web-pe": "Web Product Engineering",
  "mobile-pe": "Mobile Product Engineering",
}

const PART_STACK: Partial<Record<PartTag, string[]>> = {
  pm: ["Notion", "Slack"],
  design: ["Figma", "Illustration"],
  "web-pe": ["Figma", "Github"],
  "mobile-pe": ["Swift", "Kotlin"],
}

function partLabel(part: PartTag) {
  return PART_LABEL[part] ?? part
}

function partOptionId(part: PartTag) {
  return `opt-part-${part}`
}

function partStack(part: PartTag) {
  return PART_STACK[part] ?? []
}

const PART_OPTIONS = RECRUITING_PARTS.map((part) => ({
  optionId: partOptionId(part),
  content: partLabel(part),
}))

function buildBasicSection(row: ApplicantRow): ApplicationSection {
  const firstPart = row.parts[0]
  const secondPart = row.parts[1]
  return {
    sectionId: "sec-basic",
    type: "common",
    title: "기본 문항",
    questions: [
      {
        questionId: "q-basic-1",
        type: "radio",
        title: "신규 지원자이신가요?",
        required: true,
        options: [
          { optionId: "opt-basic-1-1", content: "네, 신규 지원입니다" },
          { optionId: "opt-basic-1-2", content: "아니요, 기존 챌린저입니다" },
        ],
        textValue: null,
        selectedOptionIds: ["opt-basic-1-2"],
        files: [],
      },
      {
        questionId: "q-basic-2",
        type: "shortText",
        title: "지원자님의 성함을 알려주세요.",
        required: true,
        options: [],
        textValue: row.applicantName,
        selectedOptionIds: [],
        files: [],
      },
      {
        questionId: "q-basic-3",
        type: "radio",
        title: "1지망 지원 파트를 알려주세요.",
        required: true,
        options: PART_OPTIONS,
        textValue: null,
        selectedOptionIds: firstPart ? [partOptionId(firstPart)] : [],
        files: [],
      },
      {
        questionId: "q-basic-4",
        type: "radio",
        title: "2지망 지원 파트를 알려주세요.",
        required: true,
        options: PART_OPTIONS,
        textValue: null,
        selectedOptionIds: secondPart ? [partOptionId(secondPart)] : [],
        files: [],
      },
      {
        questionId: "q-basic-5",
        type: "shortText",
        title: "이메일 주소를 입력해 주세요.",
        description:
          "모든 전형 안내는 입력하신 메일 주소로 발송되오니, 정확한 주소를 기재해 주시기 바랍니다.",
        required: true,
        options: [],
        textValue: `umc.${row.applicationId}@example.com`,
        selectedOptionIds: [],
        files: [],
      },
    ],
  }
}

function buildPartSection(
  row: ApplicantRow,
  part: PartTag,
): ApplicationSection {
  return {
    sectionId: `sec-part-${part}`,
    type: "part",
    title: partLabel(part),
    questions: [
      {
        questionId: `q-${part}-1`,
        type: "checkbox",
        title: "사용 가능한 기술 스택을 선택하세요.",
        required: true,
        options: partStack(part).map((content, index) => ({
          optionId: `opt-${part}-${index}`,
          content,
        })),
        textValue: null,
        selectedOptionIds: [`opt-${part}-0`],
        files: [],
      },
      {
        questionId: `q-${part}-2`,
        type: "portfolio",
        title: "포트폴리오를 링크 혹은 PDF 파일의 형태로 제출하세요.",
        required: true,
        options: [],
        textValue: null,
        selectedOptionIds: [],
        files: [
          {
            fileId: `file-${part}`,
            name: `2026_${partLabel(part)} 포트폴리오_${row.applicantName}`,
            url: "https://example.com/portfolio.pdf",
          },
        ],
      },
      {
        questionId: `q-${part}-3`,
        type: "shortText",
        title: "지원 동기를 알려주세요.",
        required: true,
        options: [],
        textValue: `${partLabel(part)} 파트로 성장하고 싶어 지원했습니다.`,
        selectedOptionIds: [],
        files: [],
      },
    ],
  }
}

const OPERATOR_NAME_POOL = [
  "벨라/황지원",
  "박방토/박예원",
  "제옹/정의찬",
  "삼이/이희원",
  "시안/우자영",
  "원/김동민",
]

const OPERATOR_COMMENT =
  "포트폴리오의 방향성과 경험이 인상적입니다. 다음 전형에서 더 확인하면 좋겠습니다."

function buildStageDetail(
  row: ApplicantRow,
  stage: EvaluationStage,
): StageEvaluationDetail | null {
  const stageEvaluation = getStageEvaluation(row, stage)
  if (!stageEvaluation) return null

  const myDone = stageEvaluation.myProgress === "done"
  const othersDone = Math.max(
    0,
    myDone ? stageEvaluation.doneCount - 1 : stageEvaluation.doneCount,
  )

  const me: OperatorEvaluation = {
    evaluatorId: "op-me",
    evaluatorName: "이방토/이예원",
    stage,
    progress: stageEvaluation.myProgress,
    result: myDone ? stageEvaluation.result : null,
    comment: myDone ? "" : null,
  }

  const others: OperatorEvaluation[] = Array.from(
    { length: Math.max(0, stageEvaluation.totalCount - 1) },
    (_, index): OperatorEvaluation => {
      const done = index < othersDone
      return {
        evaluatorId: `op-${stage}-${index + 1}`,
        evaluatorName:
          OPERATOR_NAME_POOL[index % OPERATOR_NAME_POOL.length] ?? "운영진",
        stage,
        progress: done ? "done" : "before",
        result: done ? (stageEvaluation.result ?? "pass") : null,
        comment: done && index === 0 ? OPERATOR_COMMENT : null,
      }
    },
  )

  return {
    stage,
    myEvaluatorId: "op-me",
    locked: false,
    operators: [me, ...others],
  }
}

const STAGES: EvaluationStage[] = ["document", "interview", "final"]

function buildDetailFromRow(row: ApplicantRow): ApplicationDetail {
  return {
    applicationId: row.applicationId,
    applicantName: row.applicantName,
    chapter: row.chapter,
    school: row.school,
    recruitmentLabel: `${row.school} ${RECRUITING_TARGET_GISU_LABEL_MOCK} ${formatRecruitmentType(row)} 모집`,
    parts: row.parts,
    reachedStages: STAGES.filter((stage) => getStageEvaluation(row, stage)),
    finalResult: getStageEvaluation(row, "final")?.result ?? null,
    sections: [
      buildBasicSection(row),
      ...row.parts.map((part) => buildPartSection(row, part)),
    ],
    evaluations: {
      document: buildStageDetail(row, "document"),
      interview: buildStageDetail(row, "interview"),
      final: buildStageDetail(row, "final"),
    },
  }
}

export function getApplicationDetailMock(
  applicationId: string,
): ApplicationDetail {
  const row =
    APPLICANT_LIST_MOCK.find((item) => item.applicationId === applicationId) ??
    APPLICANT_LIST_MOCK[0]
  if (!row) {
    throw new Error("APPLICANT_LIST_MOCK must not be empty")
  }
  return buildDetailFromRow({ ...row, applicationId })
}
