import type { PartTag } from "@/shared/model/domain"

import type {
  RecruitingApplicationStatus,
  RecruitingApplicationSummary,
  RecruitingRound,
  RecruitingRoundGroup,
  RecruitingTrack,
} from "../api/types"
import type {
  ApplicantRow,
  EvaluationProgress,
  EvaluationResult,
  StageEvaluation,
} from "./applicantListTypes"
import type { EvaluationStage } from "./evaluationStage"

const TRACK_PART_TAG: Record<RecruitingTrack, PartTag | null> = {
  PLAN: "pm",
  DESIGN: "design",
  WEB_PRODUCT_ENGINEER: "web-pe",
  MOBILE_PRODUCT_ENGINEER: "mobile-pe",
  INFRA_PLUS: null,
}

const STAGE_STATUSES: Record<EvaluationStage, RecruitingApplicationStatus[]> = {
  document: [
    "SUBMITTED",
    "DOCUMENT_FAILED",
    "INTERVIEW_ASSIGNED",
    "INTERVIEW_SKIPPED",
    "FINAL_PASSED",
    "FINAL_FAILED",
  ],
  interview: ["INTERVIEW_ASSIGNED", "FINAL_PASSED", "FINAL_FAILED"],
  final: [
    "INTERVIEW_ASSIGNED",
    "INTERVIEW_SKIPPED",
    "FINAL_PASSED",
    "FINAL_FAILED",
  ],
}

export function getStageStatuses(stage: EvaluationStage) {
  return STAGE_STATUSES[stage]
}

export function toPartTags(
  firstChoice: RecruitingTrack,
  secondChoice: RecruitingTrack | null,
): PartTag[] {
  const tags = [firstChoice, secondChoice]
    .filter((track): track is RecruitingTrack => track != null)
    .map((track) => TRACK_PART_TAG[track])
    .filter((tag): tag is PartTag => tag != null)
  return [...new Set(tags)]
}

function isDecided(status: RecruitingApplicationStatus) {
  return status !== "SUBMITTED"
}

function documentResult(
  status: RecruitingApplicationStatus,
): EvaluationResult | null {
  if (status === "DOCUMENT_FAILED") return "fail"
  if (
    status === "INTERVIEW_ASSIGNED" ||
    status === "INTERVIEW_SKIPPED" ||
    status === "FINAL_PASSED" ||
    status === "FINAL_FAILED"
  ) {
    return "pass"
  }
  return null
}

function finalResult(
  status: RecruitingApplicationStatus,
): EvaluationResult | null {
  if (status === "FINAL_PASSED") return "pass"
  if (status === "FINAL_FAILED") return "fail"
  return null
}

function toProgress(decided: boolean): EvaluationProgress {
  return decided ? "done" : "inProgress"
}

function toMyProgress(evaluated: boolean): EvaluationProgress {
  return evaluated ? "done" : "before"
}

function buildStageEvaluation(
  summary: RecruitingApplicationSummary,
  stage: EvaluationStage,
): StageEvaluation | null {
  if (!STAGE_STATUSES[stage].includes(summary.status)) return null

  if (stage === "document") {
    return {
      progress: toProgress(isDecided(summary.status)),
      result: documentResult(summary.status),
      myProgress: toMyProgress(summary.documentEvaluatedByMe),
    }
  }

  if (stage === "interview") {
    return {
      progress: toProgress(finalResult(summary.status) != null),
      result: finalResult(summary.status),
      myProgress: toMyProgress(summary.interviewEvaluatedByMe),
    }
  }

  return {
    progress: toProgress(finalResult(summary.status) != null),
    result: finalResult(summary.status),
    myProgress: "before",
  }
}

export function toApplicantRow(
  summary: RecruitingApplicationSummary,
  group: Pick<RecruitingRoundGroup, "chapterName" | "schoolName">,
  round: Pick<RecruitingRound, "roundId" | "type" | "roundNo">,
): ApplicantRow | null {
  const document = buildStageEvaluation(summary, "document")
  if (!document) return null

  return {
    applicationId: String(summary.applicationId),
    roundId: String(round.roundId),
    appliedAt: summary.submittedAt ?? "",
    applicantName: summary.applicantName,
    chapter: group.chapterName,
    school: group.schoolName,
    recruitmentType: round.type === "ADDITIONAL" ? "additional" : "regular",
    additionalRound: round.type === "ADDITIONAL" ? round.roundNo : undefined,
    parts: toPartTags(summary.firstChoice, summary.secondChoice),
    evaluations: {
      document,
      interview: buildStageEvaluation(summary, "interview"),
      final: buildStageEvaluation(summary, "final"),
    },
  }
}
