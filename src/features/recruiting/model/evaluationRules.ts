import type {
  FinalDecisionBody,
  RecruitingApplicationStatus,
  RecruitingApplicationSummary,
  RecruitingTrack,
} from "../api/types"
import type { EvaluationStage } from "./evaluationStage"

export type EvaluationBlockReason =
  | "stageHasNoEvaluation"
  | "permissionUnknown"
  | "notEvaluator"
  | "stageClosed"

export interface EvaluationEligibility {
  canSubmit: boolean
  reason: EvaluationBlockReason | null
}

// 평가자인지 확정하지 못하는 구간이 있다. 평가자 명단 조회가 일시적으로 실패하면
// 권한이 없는 것인지 서버가 잠깐 죽은 것인지 구분할 수 없다. 그 상태를 '아님'으로
// 접으면 권한 있는 사람에게 잘못된 안내가 나가므로 따로 둔다.
export type EvaluatorState = "yes" | "no" | "unknown"

export interface ManagePermission {
  isGranted: boolean | undefined
  isResolved: boolean
}

// 권한 조회 실패는 '권한 없음'이 아니다. 둘을 한 값으로 접으면 관리 권한자의
// 합불 버튼이 사유 없이 잠긴다. 실패는 '판정 불가'로 두고, 아직 조회 중인
// 구간과도 구분해 기다릴지 말지를 호출부가 가릴 수 있게 한다.
export function resolveManagePermission({
  seasonId,
  permittedSeasonIds,
  isLoading,
  isUnresolved,
}: {
  seasonId: string | null
  permittedSeasonIds: ReadonlySet<string>
  isLoading: boolean
  isUnresolved: boolean
}): ManagePermission {
  if (seasonId == null || isLoading) {
    return { isGranted: undefined, isResolved: false }
  }
  if (isUnresolved) {
    return { isGranted: undefined, isResolved: true }
  }
  return { isGranted: permittedSeasonIds.has(seasonId), isResolved: true }
}

// 서버는 전형이 열려 있는 동안에만 평가 등록을 받는다. 서류는 판정 전(SUBMITTED),
// 면접은 면접 대상으로 확정된 뒤(INTERVIEW_ASSIGNED)만 열린다.
const OPEN_STATUS: Partial<
  Record<EvaluationStage, RecruitingApplicationStatus>
> = {
  document: "SUBMITTED",
  interview: "INTERVIEW_ASSIGNED",
}

export function resolveEvaluationEligibility(
  stage: EvaluationStage,
  status: RecruitingApplicationStatus | undefined,
  evaluator: EvaluatorState,
): EvaluationEligibility {
  const openStatus = OPEN_STATUS[stage]
  if (!openStatus) {
    return { canSubmit: false, reason: "stageHasNoEvaluation" }
  }
  if (evaluator === "unknown") {
    return { canSubmit: false, reason: "permissionUnknown" }
  }
  if (evaluator === "no") {
    return { canSubmit: false, reason: "notEvaluator" }
  }
  if (status !== openStatus) {
    return { canSubmit: false, reason: "stageClosed" }
  }
  return { canSubmit: true, reason: null }
}

// 최종 판정은 면접 대상이거나 면접을 건너뛴 지원서에서만 가능하다. 이미 최종
// 결과가 나온 지원서를 다시 판정하면 서버가 전이를 거부하므로 화면에서 막는다.
const FINAL_DECIDABLE_STATUS: RecruitingApplicationStatus[] = [
  "INTERVIEW_ASSIGNED",
  "INTERVIEW_SKIPPED",
]

export function canDecideFinal(
  status: RecruitingApplicationStatus | undefined,
  hasManagePermission: boolean,
): boolean {
  if (!hasManagePermission || !status) return false
  return FINAL_DECIDABLE_STATUS.includes(status)
}

export function toAcceptableTracks(
  application: Pick<
    RecruitingApplicationSummary,
    "firstChoice" | "secondChoice"
  >,
): RecruitingTrack[] {
  const tracks = [application.firstChoice, application.secondChoice].filter(
    (track): track is RecruitingTrack => track != null,
  )
  return [...new Set(tracks)]
}

// 합격에는 확정 트랙이 필수이고, 불합격에 트랙을 담으면 서버가 거부한다.
export function buildFinalDecisionBody(
  decision: "PASS" | "FAIL",
  acceptedTrack: RecruitingTrack | null,
): FinalDecisionBody | null {
  if (decision === "FAIL") {
    return { decision: "FAIL" }
  }
  if (!acceptedTrack) return null
  return { decision: "PASS", acceptedTrack }
}
