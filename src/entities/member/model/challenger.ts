// 챌린저(회원) 도메인 응답 타입. 공통 enum은 shared/model/domain에서 가져와 re-export.

import type {
  ChallengerStatus,
  MemberStatus,
  OrganizationType,
  Part,
  PointType,
  RoleType,
} from "@/shared/model/domain"

export type {
  ChallengerStatus,
  MemberStatus,
  OrganizationType,
  Part,
  PointType,
  RoleType,
}

export interface ChallengerPointInfo {
  id: string
  challengerId: string
  pointType: PointType
  /** 백엔드가 number/문자열로 줄 수 있음. 호출부에서 number 변환 필요 (toNumberSafe). */
  point: number | string | null
  description?: string | null
  createdAt: string
}

export interface ChallengerRoleResponse {
  challengerRoleId: string
  challengerId: string
  roleType: RoleType
  organizationType: OrganizationType
  organizationId: string
  responsiblePart?: Part
  gisuId: string
  /** 표시용 기수 번호 (e.g. "9"). */
  gisu: string
}

export interface ChallengerInfoResponse {
  challengerId: string
  memberId: string
  gisuId: string
  /** 표시용 기수 번호 */
  gisu: string
  chapterId: string
  chapterName: string
  part: Part
  challengerStatus: ChallengerStatus
  /** @deprecated `points` 사용 권장. 동일한 값. */
  challengerPoints?: ChallengerPointInfo[]
  points?: ChallengerPointInfo[]
  /** 합계 점수. 호출부에서 number 변환 필요 (toNumberSafe). */
  totalPoints?: number | string | null
  roles?: ChallengerRoleResponse[]
  name: string
  nickname: string
  /** Public View 에서는 null 로 마스킹됨 */
  email: string | null
  schoolId: string
  schoolName: string
  profileImageLink?: string | null
  /** Public View 에서는 null 로 마스킹됨 */
  memberStatus?: MemberStatus | null
  /** Public View 에서는 null 로 마스킹됨 */
  status?: MemberStatus | null
}
