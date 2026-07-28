import { api } from "@/shared/lib/axios"

import type {
  CreateSchoolRequest,
  DeleteSchoolsRequest,
  SchoolDetailResponse,
  SchoolNameListResponse,
  UpdateSchoolRequest,
} from "@/entities/organization/model/schoolTypes"
import type { ApiResponse } from "@/shared/lib/apiResponse"

/**
 * 학교 전체 목록 조회 (SCHOOL-101)
 * 전체 학교 목록을 이름순으로 조회합니다.
 */
export async function getAllSchools(): Promise<SchoolNameListResponse> {
  const { data } =
    await api.get<ApiResponse<SchoolNameListResponse>>("/v1/schools/all")
  return data.result
}

/**
 * 학교 생성 (SCHOOL-001)
 * 새로운 학교를 등록합니다.
 */
export async function createSchool(body: CreateSchoolRequest): Promise<void> {
  const { data } = await api.post<ApiResponse<void>>("/v1/schools", body)
  return data.result
}

/**
 * 학교 수정 (SCHOOL-002)
 * 학교 정보를 수정합니다. 입력된 필드만 수정됩니다.
 */
export async function updateSchool(
  schoolId: number | string,
  body: UpdateSchoolRequest,
): Promise<void> {
  const { data } = await api.patch<ApiResponse<void>>(
    `/v1/schools/${schoolId}`,
    body,
  )
  return data.result
}

/**
 * 학교 일괄 삭제 (SCHOOL-003)
 * 여러 학교를 일괄 삭제합니다.
 */
export async function deleteSchools(body: DeleteSchoolsRequest): Promise<void> {
  const { data } = await api.delete<ApiResponse<void>>("/v1/schools", {
    data: body,
  })
  return data.result
}

/**
 * 학교 단건 삭제 헬퍼 함수
 */
export async function deleteSchool(schoolId: number | string): Promise<void> {
  return deleteSchools({ schoolIds: [Number(schoolId)] })
}

/**
 * 학교 상세 조회 (SCHOOL-102)
 * 학교 상세 정보를 조회합니다.
 */
export async function getSchoolDetail(
  schoolId: number | string,
): Promise<SchoolDetailResponse> {
  const { data } = await api.get<ApiResponse<SchoolDetailResponse>>(
    `/v1/schools/${schoolId}`,
  )
  return data.result
}
