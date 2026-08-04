/**
 * 학교 생성, 수정, 삭제 및 상세 조회를 위한 DTO 정의
 * OpenAPI 스펙 (SCHOOL-001, SCHOOL-002, SCHOOL-003, SCHOOL-102) 기반
 */

export type SchoolLinkType = "KAKAO" | "YOUTUBE" | "INSTAGRAM"

export interface SchoolLinkRequest {
  /** 링크 제목 (예: UMC 카카오톡 오픈채팅) */
  title: string
  /** 링크 타입 (KAKAO | YOUTUBE | INSTAGRAM) */
  type: SchoolLinkType
  /** 링크 URL (예: https://open.kakao.com/o/example) */
  url: string
}

export interface SchoolLinkResponse {
  /** 링크 ID */
  id?: number
  /** 링크 제목 */
  title?: string
  /** 링크 타입 */
  type?: SchoolLinkType
  /** 링크 URL */
  url?: string
}

/** 학교 생성 요청 DTO (SCHOOL-001) */
export interface CreateSchoolRequest {
  /** 학교명 (예: 서울대학교) */
  schoolName: string
  /** 약칭 (예: 서울대) */
  shortName?: string
  /** 비고 (예: 관악캠퍼스) */
  remark?: string
  /** 로고 이미지 파일 ID (presigned URL 업로드 후 전달) */
  logoImageId?: string
  /** 학교 링크 목록 */
  links?: SchoolLinkRequest[]
}

/** 학교 수정 요청 DTO (SCHOOL-002) */
export interface UpdateSchoolRequest {
  /** 학교명 (수정할 경우만 입력) */
  schoolName?: string
  /** 약칭 (수정할 경우만 입력) */
  shortName?: string
  /** 지부 ID (수정할 경우만 입력) */
  chapterId?: number
  /** 비고 (수정할 경우만 입력) */
  remark?: string
  /** 로고 이미지 파일 ID (수정할 경우만 입력) */
  logoImageId?: string
  /** 학교 링크 목록 (전달 시 전체 교체) */
  links?: SchoolLinkRequest[]
}

/** 학교 삭제 요청 DTO (SCHOOL-003) */
export interface DeleteSchoolsRequest {
  /** 삭제할 학교 ID 목록 */
  schoolIds: number[]
}

/** 학교 기본 정보 아이템 (SCHOOL-101) */
export interface SchoolItem {
  /** 학교 ID */
  schoolId: number
  /** 학교명 */
  schoolName: string
  /** 약칭 */
  shortName?: string
}

/** 학교 전체 목록 응답 DTO (SCHOOL-101) */
export interface SchoolNameListResponse {
  schools: SchoolItem[]
}

/** 학교 상세 응답 DTO (SCHOOL-102) */
export interface SchoolDetailResponse {
  /** 지부 ID */
  chapterId?: number
  /** 지부명 */
  chapterName?: string
  /** 학교명 */
  schoolName?: string
  /** 약칭 */
  shortName?: string
  /** 학교 ID */
  schoolId?: number
  /** 비고 */
  remark?: string
  /** 로고 이미지 URL */
  logoImageUrl?: string
  /** 학교 링크 목록 */
  links?: SchoolLinkResponse[]
}

/** 학교 현황 및 지부/인원 수 요약 정보 (DASHBOARD-100) */
export interface AdminSchoolSummaryResponse {
  schoolId?: number
  schoolName?: string
  chapterId?: number
  chapterName?: string
  activeChallengerCount?: number
}

/** 학교 현황 및 지부/인원 통계 요약 조회 쿼리 파라미터 DTO (DASHBOARD-100) */
export interface AdminSchoolsSummaryParams {
  gisuId?: number
  chapterId?: number
  search?: string
  page?: number
  size?: number
  sort?: string | string[]
}

/** 학교 현황 페이징 응답 DTO (DASHBOARD-100) */
export interface PageResponseAdminSchoolSummaryResponse {
  content?: AdminSchoolSummaryResponse[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  hasNext?: boolean
  hasPrevious?: boolean
}
