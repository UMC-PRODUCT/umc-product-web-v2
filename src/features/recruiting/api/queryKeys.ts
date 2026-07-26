import type { EvaluationStage } from "../model/evaluationStage"
import type { ApiEvaluationStage, RecruitingRoundsQuery } from "./types"

export const recruitingKeys = {
  all: ["recruiting"] as const,

  rounds: () => [...recruitingKeys.all, "rounds"] as const,

  roundList: (params: RecruitingRoundsQuery) =>
    [...recruitingKeys.rounds(), params] as const,

  publicRound: (gisuId: string, roundId: string) =>
    [...recruitingKeys.rounds(), "public", gisuId, roundId] as const,

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
}
