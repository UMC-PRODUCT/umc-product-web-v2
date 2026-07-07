// 챌린저 포인트 부여 / 기록 코드 발급 관련 요청·응답 타입 (feature 액션).

import type { Part, PointType, RoleType } from "@/shared/model/domain"

export interface GrantChallengerPointRequest {
  pointType: PointType
  /** null 이면 pointType 의 기본 점수 사용. CUSTOM 등 자체 제도 운영 시 명시. */
  pointValue?: number | null
  /** 부여 사유 (필수) */
  description: string
}

export interface CreateChallengerRecordRequest {
  gisuId: string
  chapterId: string
  schoolId: string
  part: Part
  memberName: string
  challengerRoleType: RoleType
}

export interface ChallengerRecordResponse {
  code: string
  part: Part
  gisuId: string
  gisu: string
  schoolId: string
  schoolName: string
  chapterId: string
  chapterName: string
  memberName: string
  challengerRoleType: RoleType
  organizationId: string
}
