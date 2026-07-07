import type {
  ChallengerInfoResponse,
  MemberStatus,
  OrganizationType,
  Part,
  PointType,
  RoleType,
} from "@/entities/member/model/challenger"

// 하위 호환 re-export: 회원 도메인 타입의 원본은 entities/member로 이동함.
// entities/organization 분리 시 외부 임포트를 원본 경로로 정리할 예정.
export type {
  ChallengerInfoResponse,
  ChallengerPointInfo,
  ChallengerRoleResponse,
  ChallengerStatus,
  MemberStatus,
  OrganizationType,
  Part,
  PointType,
  RoleType,
} from "@/entities/member/model/challenger"

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

export interface GisuNameItem {
  gisuId: string
  generation: string
  gisu: string
  isActive: boolean
}

export interface GisuNameListResponse {
  gisuList: GisuNameItem[]
}

export interface ChapterItem {
  id: string
  name: string
}

export interface ChapterListResponse {
  chapters: ChapterItem[]
}

export interface SchoolItem {
  schoolId: string
  schoolName: string
}

export interface ChapterWithSchools {
  chapterId: string
  chapterName: string
  schools: SchoolItem[]
}

export interface ChapterWithSchoolsResponse {
  chapters: ChapterWithSchools[]
}

export interface SchoolNameListResponse {
  schools: SchoolItem[]
}
