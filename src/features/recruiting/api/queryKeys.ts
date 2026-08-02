import type { EvaluationStage } from "../model/evaluationStage"
import type { ApiEvaluationStage } from "./types"

export const recruitingKeys = {
  all: ["recruiting"] as const,

  rounds: () => [...recruitingKeys.all, "rounds"] as const,

  roundList: (gisuId: string) => [...recruitingKeys.rounds(), gisuId] as const,

  adminRoundList: (gisuId: string) =>
    [...recruitingKeys.rounds(), "admin", gisuId] as const,

  round: (gisuId: string, roundId: string) =>
    [...recruitingKeys.rounds(), gisuId, roundId] as const,

  applications: () => [...recruitingKeys.all, "applications"] as const,

  schoolApplications: (roundIds: string[], stage: EvaluationStage) =>
    [...recruitingKeys.applications(), [...roundIds].sort(), stage] as const,

  applicationDetail: (roundId: string, applicationId: string) =>
    [
      ...recruitingKeys.applications(),
      "detail",
      roundId,
      applicationId,
    ] as const,

  forms: () => [...recruitingKeys.all, "forms"] as const,

  formStructure: (
    applicationFormId: string,
    firstChoice: string,
    secondChoice: string | null,
  ) =>
    [
      ...recruitingKeys.forms(),
      applicationFormId,
      firstChoice,
      secondChoice,
    ] as const,

  evaluations: () => [...recruitingKeys.all, "evaluations"] as const,

  stageEvaluations: (
    roundId: string,
    applicationId: string,
    stage: ApiEvaluationStage,
  ) =>
    [...recruitingKeys.evaluations(), roundId, applicationId, stage] as const,

  evaluators: (roundId: string) =>
    [...recruitingKeys.all, "evaluators", roundId] as const,

  evaluatorProfiles: (memberIds: string[]) =>
    [...recruitingKeys.all, "evaluator-profiles", memberIds] as const,

  schoolStaff: (schoolId: string) =>
    [...recruitingKeys.all, "school-staff", schoolId] as const,

  interviewQuestions: () =>
    [...recruitingKeys.all, "interview-questions"] as const,

  roundInterviewQuestions: (roundId: string) =>
    [...recruitingKeys.interviewQuestions(), "round", roundId] as const,

  applicationInterviewQuestions: (applicationId: string) =>
    [
      ...recruitingKeys.interviewQuestions(),
      "application",
      applicationId,
    ] as const,
}
