import type { EvaluationStage } from "../model/evaluationStage"
import type { ApiEvaluationStage } from "./types"

export const recruitingKeys = {
  all: ["recruiting"] as const,

  rounds: () => [...recruitingKeys.all, "rounds"] as const,

  roundList: (gisuId: string) => [...recruitingKeys.rounds(), gisuId] as const,

  // roundList 는 OPEN + PAST 를 합친 목록이라 캐시를 공유할 수 없다. phase 를
  // 키에 넣어 분리한다.
  openRoundList: (gisuId: string) =>
    [...recruitingKeys.rounds(), gisuId, "OPEN"] as const,
  adminRoundList: (gisuId: string, sort?: string) =>
    [...recruitingKeys.rounds(), "admin", gisuId, sort ?? "NEWEST"] as const,

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

  // schoolIds 는 순서만 다른 같은 조회가 캐시를 나눠 쓰지 않도록 정렬해서 넣는다.
  statusSummary: (gisuId: string, schoolIds?: string[]) =>
    [
      ...recruitingKeys.all,
      "status-summary",
      gisuId,
      schoolIds ? [...schoolIds].sort() : null,
    ] as const,

  evaluationStatistics: (gisuId: string) =>
    [...recruitingKeys.all, "evaluation-statistics", gisuId] as const,

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

  decisionHistories: (gisuId: string) =>
    [...recruitingKeys.all, "decision-histories", gisuId] as const,

  anonymousApplication: (email: string, applicationKey: string) =>
    [...recruitingKeys.all, "anonymous", email, applicationKey] as const,
}
