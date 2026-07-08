// 회원/챌린저 검색 및 상세(admin view) 도메인 타입.

import type { ChallengerInfoResponse } from "@/entities/member/model/challenger"
import type {
  MemberStatus,
  OrganizationType,
  Part,
  RoleType,
} from "@/shared/model/domain"

export interface SearchMemberItem {
  memberId: string
  name: string
  nickname: string
  email: string
  schoolId: string
  schoolName: string
  profileImageLink?: string
  challengerId?: string
  gisuId?: string
  gisu?: string
  part?: Part
  roleTypes?: RoleType[]
}

export interface SearchMemberPage {
  content: SearchMemberItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface SearchMemberResponse {
  totalCount: number
  page: SearchMemberPage
}

export interface SearchMemberParams {
  page?: number
  size?: number
  keyword?: string
  gisuId?: string
  part?: Part
  chapterId?: string
  schoolId?: string
}

export interface SearchChallengerCursorParams {
  cursor?: string
  size?: number
  challengerId?: string
  name?: string
  nickname?: string
  keyword?: string
  schoolId?: string
  chapterId?: string
  part?: Part
  gisuId?: string
}

export interface SearchChallengerItem {
  challengerId?: string
  memberId?: string
  gisuId?: string
  generation?: string
  gisu?: string
  part?: Part
  name?: string
  nickname?: string
  schoolName?: string
  pointSum?: string
  profileImageLink?: string | null
  roleTypes?: RoleType[]
}

export interface SearchChallengerCursor {
  content: SearchChallengerItem[]
  nextCursor?: string
  hasNext: boolean
}

export interface PartCount {
  part: Part
  count: string
}

export interface SearchChallengerCursorResponse {
  cursor: SearchChallengerCursor
  partCounts?: PartCount[]
}

export interface MemberRoleInfo {
  id: string
  challengerId: string
  roleType: RoleType
  organizationType: OrganizationType
  organizationId: string
  responsiblePart?: Part
  gisuId: string
  gisu: string
}

export interface MemberProfileInfo {
  id: string
  linkedIn?: string
  instagram?: string
  github?: string
  blog?: string
  personal?: string
}

export interface MemberInfoResponse {
  id: string
  name: string
  nickname: string
  /** Public View 에서는 null 로 마스킹됨 */
  email: string | null
  schoolId: string
  schoolName: string
  profileImageLink?: string | null
  /** Public View 에서는 null 로 마스킹됨 */
  status: MemberStatus | null
  roles?: MemberRoleInfo[]
  challengerRecords?: ChallengerInfoResponse[]
  profile?: MemberProfileInfo | null
}
