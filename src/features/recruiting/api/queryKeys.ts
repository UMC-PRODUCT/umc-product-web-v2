import type { EvaluationStage } from "../model/evaluationStage"
import type { RecruitingRoundsQuery } from "./types"

export const recruitingKeys = {
  all: ["recruiting"] as const,

  rounds: () => [...recruitingKeys.all, "rounds"] as const,

  roundList: (params: RecruitingRoundsQuery) =>
    [...recruitingKeys.rounds(), params] as const,

  applications: () => [...recruitingKeys.all, "applications"] as const,

  schoolApplications: (roundIds: string[], stage: EvaluationStage) =>
    [...recruitingKeys.applications(), [...roundIds].sort(), stage] as const,
}
