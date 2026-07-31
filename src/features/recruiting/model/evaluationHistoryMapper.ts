import { toRoleTag } from "@/shared/lib/roleTagMapper"
import { ROLE_TAG_LABEL } from "@/shared/model/domain"

import { TRACK_PART_TAG } from "./applicantMapper"

import type { RecruitingDecisionHistory } from "../api/types"
import type { EvaluationResult } from "./applicantListTypes"
import type { EvaluationHistoryEntry } from "./evaluationHistory"

// 서버는 판정 결과를 PASSED/FAILED 로, 화면은 pass/fail 로 쓴다.
const RESULT: Record<string, EvaluationResult> = {
  PASSED: "pass",
  FAILED: "fail",
}

// 담당자 직위는 판정 시점 roleType 스냅샷이다. 기존 역할 라벨 매퍼를 그대로 써서
// 다른 화면과 표기를 맞춘다(예: SCHOOL_PRESIDENT -> "교내 회장").
function toPositionLabel(
  roleType: RecruitingDecisionHistory["decider"]["roleType"],
) {
  return ROLE_TAG_LABEL[toRoleTag(roleType)]
}

export function toEvaluationHistoryEntry(
  history: RecruitingDecisionHistory,
): EvaluationHistoryEntry {
  const { applicant, decider } = history
  return {
    id: history.decisionHistoryId,
    processedAt: history.decidedAt,
    applicant: {
      chapterId: applicant.chapterId,
      schoolId: applicant.schoolId,
      chapter: applicant.chapterName,
      school: applicant.schoolName,
      name: applicant.name,
      // 파트 필터는 1지망 기준이다. INFRA_PLUS 는 모집 단위에 없어 null 이 되는데,
      // 그 경우 필터에서 제외되도록 빈 문자열 대신 plan 으로 접지 않고 그대로 둔다.
      part: TRACK_PART_TAG[applicant.firstChoice] ?? "plan",
      result: RESULT[history.result] ?? "fail",
    },
    evaluator: {
      id: decider.memberId,
      // 중앙 직위·SUPER_ADMIN 은 지부·학교가 null 이다. 표에서 빈 칸으로 보이게 둔다.
      chapter: decider.chapterName ?? "",
      school: decider.schoolName ?? "",
      position: toPositionLabel(decider.roleType),
      nickname: decider.nickname,
      name: decider.name,
    },
  }
}

export function toEvaluationHistoryEntries(
  histories: RecruitingDecisionHistory[],
): EvaluationHistoryEntry[] {
  return histories.map(toEvaluationHistoryEntry)
}

// 서버 진행 상태를 화면 뱃지 값으로 옮긴다.
const PROGRESS = {
  BEFORE_EVALUATION: "before",
  IN_PROGRESS: "inProgress",
  COMPLETED: "done",
} as const

export function toHistoryProgress(
  status: keyof typeof PROGRESS,
): (typeof PROGRESS)[keyof typeof PROGRESS] {
  return PROGRESS[status]
}
