import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  CreateCurriculumRequest,
  CreateWeeklyCurriculumRequest,
  CurriculumOverviewResponse,
  DeleteCurriculumRequest,
  DeleteWeeklyCurriculumRequest,
  EditCurriculumRequest,
  EditWeeklyCurriculumRequest,
  GetCurriculumOverviewParams,
} from "../model/curriculumTypes"

/**
 * 특정 기수의 파트별 커리큘럼 조회 (CURRICULUM-101)
 * @description 요청자와 관계없이 주어진 기수, 파트에 해당하는 커리큘럼 및 주차별 목록을 조회합니다.
 */
export async function getCurriculumOverview(
  params: GetCurriculumOverviewParams,
): Promise<CurriculumOverviewResponse> {
  const { data } = await api.get<ApiResponse<CurriculumOverviewResponse>>(
    "/v2/curriculums/overview",
    { params },
  )
  return data.result
}

/**
 * 1. 각 커리큘럼에 새로운 주차 생성 (CURRICULUM-004)
 * 상위 객체인 커리큘럼에 주차별 커리큘럼을 생성합니다.
 * (각 커리큘럼당 주차별 커리큘럼은 최대 2개 [MAIN, EXTRA] 생성 가능)
 */
export async function createWeeklyCurriculum(
  body: CreateWeeklyCurriculumRequest,
): Promise<number> {
  const { data } = await api.post<ApiResponse<number>>(
    "/v2/curriculums/weekly",
    body,
  )
  return data.result
}

/**
 * 2. 주차별 커리큘럼 삭제 (CURRICULUM-006)
 * 주차별 커리큘럼을 삭제합니다.
 * (포함된 주차별 워크북이 하나라도 존재하면 삭제가 불가능합니다)
 */
export async function deleteWeeklyCurriculum(
  weeklyCurriculumIdOrReq: number | DeleteWeeklyCurriculumRequest,
): Promise<void> {
  const weeklyCurriculumId =
    typeof weeklyCurriculumIdOrReq === "object"
      ? weeklyCurriculumIdOrReq.weeklyCurriculumId
      : weeklyCurriculumIdOrReq

  const { data } = await api.delete<ApiResponse<void>>(
    `/v2/curriculums/weekly/${weeklyCurriculumId}`,
  )
  return data.result
}

/**
 * 3. 주차별 커리큘럼 수정 (CURRICULUM-005)
 * 주차별 커리큘럼 자체를 수정합니다.
 * (제목은 상시 수정 가능, 배포된 워크북이 있으면 시작/종료일 수정 불가 등)
 */
export async function updateWeeklyCurriculum(
  weeklyCurriculumId: number,
  body: EditWeeklyCurriculumRequest,
): Promise<void> {
  const { data } = await api.patch<ApiResponse<void>>(
    `/v2/curriculums/weekly/${weeklyCurriculumId}`,
    body,
  )
  return data.result
}

/**
 * 4. 중앙운영사무국 총괄단용: 커리큘럼 삭제 (CURRICULUM-003)
 * 커리큘럼을 삭제합니다.
 * (내부에 포함된 주차별 커리큘럼이 존재하는 경우 삭제하지 못하며, 중앙운영사무국 총괄단 권한 필요)
 */
export async function deleteCurriculum(
  curriculumIdOrReq: number | DeleteCurriculumRequest,
): Promise<void> {
  const curriculumId =
    typeof curriculumIdOrReq === "object"
      ? curriculumIdOrReq.curriculumId
      : curriculumIdOrReq

  const { data } = await api.delete<ApiResponse<void>>(
    `/v2/curriculums/${curriculumId}`,
  )
  return data.result
}

/**
 * 5. 커리큘럼 생성 (CURRICULUM-001)
 * 기수, 파트에 대한 상위 객체인 커리큘럼을 생성합니다.
 * (동일한 기수에 동일한 파트에 대한 커리큘럼은 중복 불가)
 */
export async function createCurriculum(
  body: CreateCurriculumRequest,
): Promise<number> {
  const { data } = await api.post<ApiResponse<number>>("/v2/curriculums", body)
  return data.result
}

/**
 * 6. 커리큘럼 수정 (CURRICULUM-002)
 * 상위 객체인 커리큘럼의 이름을 수정합니다.
 * (기수, 파트 등은 수정할 수 없으며 이름만 수정 가능)
 */
export async function updateCurriculum(
  curriculumId: number,
  body: EditCurriculumRequest,
): Promise<void> {
  const { data } = await api.patch<ApiResponse<void>>(
    `/v2/curriculums/${curriculumId}`,
    body,
  )
  return data.result
}
