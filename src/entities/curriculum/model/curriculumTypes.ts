import type { components } from "@/types/api"

/**
 * 커리큘럼 파트 Enum (OpenAPI Spec 기반)
 */
export type CurriculumPart =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "ANDROID"
  | "IOS"
  | "NODEJS"
  | "SPRINGBOOT"
  | "ADMIN"

/**
 * 1. 각 커리큘럼에 새로운 주차 생성 요청 DTO (CURRICULUM-004)
 */
export interface CreateWeeklyCurriculumRequest {
  /** 상위 커리큘럼 ID */
  curriculumId: number
  /** 주차 번호 */
  weekNo: number
  /** 부록(EXTRA) 여부 */
  isExtra?: boolean
  /** 주차 제목 */
  title: string
  /** 시작일시 (ISO 8601 string) */
  startsAt: string
  /** 종료일시 (ISO 8601 string) */
  endsAt: string
}

/**
 * 2. 주차별 커리큘럼 삭제 요청 DTO (CURRICULUM-006)
 */
export interface DeleteWeeklyCurriculumRequest {
  /** 삭제할 주차별 커리큘럼 ID */
  weeklyCurriculumId: number
}

/**
 * 3. 주차별 커리큘럼 수정 요청 DTO (CURRICULUM-005)
 */
export interface EditWeeklyCurriculumRequest {
  /** 주차 번호 */
  weekNo?: number
  /** 부록(EXTRA) 여부 */
  isExtra?: boolean
  /** 주차 제목 */
  title?: string
  /** 시작일시 (ISO 8601 string) */
  startsAt?: string
  /** 종료일시 (ISO 8601 string) */
  endsAt?: string
}

/**
 * 4. 중앙운영사무국 총괄단용: 커리큘럼 삭제 요청 DTO (CURRICULUM-003)
 */
export interface DeleteCurriculumRequest {
  /** 삭제할 커리큘럼 ID */
  curriculumId: number
}

/**
 * 5. 커리큘럼 생성 요청 DTO (CURRICULUM-001)
 */
export interface CreateCurriculumRequest {
  /** 기수 ID */
  gisuId: number
  /** 파트 */
  part: CurriculumPart
  /** 커리큘럼 제목 */
  title: string
}

/**
 * 6. 커리큘럼 수정 요청 DTO (CURRICULUM-002)
 */
export interface EditCurriculumRequest {
  /** 커리큘럼 제목 */
  title: string
}

/**
 * 특정 기수의 파트별 커리큘럼 조회 쿼리 파라미터 DTO (CURRICULUM-101)
 */
export interface GetCurriculumOverviewParams {
  /** 기수 ID */
  gisuId: number
  /** 파트 */
  part: CurriculumPart
  /** 주차 번호 (선택) */
  weekNo?: number
}

/**
 * 주차별 커리큘럼 개요 응답 DTO
 */
export interface WeeklyCurriculumOverviewResponse {
  weeklyCurriculumId?: number
  weekNo?: number
  title?: string
  isExtra?: boolean
  startsAt?: string
  endsAt?: string
}

/**
 * 커리큘럼 개요 (특정 기수/파트) 응답 DTO (CURRICULUM-101)
 */
export interface CurriculumOverviewResponse {
  curriculumId?: number
  title?: string
  weeks?: WeeklyCurriculumOverviewResponse[]
}

/**
 * OpenAPI components.schemas 기반 타입 별칭 호환성 제공
 */
export type ApiCreateCurriculumRequest =
  components["schemas"]["CreateCurriculumRequest"]
export type ApiCreateWeeklyCurriculumRequest =
  components["schemas"]["CreateWeeklyCurriculumRequest"]
export type ApiEditCurriculumRequest =
  components["schemas"]["EditCurriculumRequest"]
export type ApiEditWeeklyCurriculumRequest =
  components["schemas"]["EditWeeklyCurriculumRequest"]
export type ApiCurriculumOverviewResponse =
  components["schemas"]["CurriculumOverviewResponse"]
export type ApiWeeklyCurriculumOverviewResponse =
  components["schemas"]["WeeklyCurriculumOverviewResponse"]
