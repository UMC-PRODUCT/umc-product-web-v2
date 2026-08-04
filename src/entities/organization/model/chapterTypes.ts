/**
 * 지부 생성 및 일괄 생성을 위한 DTO 정의
 * OpenAPI 스펙 (CHAPTER-001, CHAPTER-002) 기반
 */

/** 지부 생성 요청 DTO (CHAPTER-001) */
export interface CreateChapterRequest {
  /** 기수 ID */
  gisuId: number
  /** 지부명 (예: 서울) */
  name: string
  /** 소속 학교 ID 목록 */
  schoolIds?: number[]
}

/** 지부 일괄 생성 요청 DTO (CHAPTER-002) */
export type CreateChapterBulkRequest = CreateChapterRequest[]
