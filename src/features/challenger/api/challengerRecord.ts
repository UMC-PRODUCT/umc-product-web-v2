import { api } from "@/shared/lib/axios"

import type {
  ChallengerRecordResponse,
  CreateChallengerRecordRequest,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function createChallengerRecord(
  payload: CreateChallengerRecordRequest,
): Promise<ChallengerRecordResponse> {
  const { data } = await api.post<ApiResponse<ChallengerRecordResponse>>(
    "/v1/challenger-record",
    payload,
  )
  return data.result
}

export async function getChallengerRecordByCode(
  code: string,
): Promise<ChallengerRecordResponse> {
  const { data } = await api.get<ApiResponse<ChallengerRecordResponse>>(
    `/v1/challenger-record/code/${encodeURIComponent(code)}`,
  )
  return data.result
}
