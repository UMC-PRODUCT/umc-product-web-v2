import { api } from "@/shared/lib/axios"

import type {
  CreateChapterBulkRequest,
  CreateChapterRequest,
} from "@/entities/organization/model/chapterTypes"
import type { ApiResponse } from "@/shared/lib/apiResponse"

/**
 * 지부 생성 (CHAPTER-001)
 * 새로운 지부를 생성합니다. 소속 학교를 함께 지정할 수 있습니다.
 */
export async function createChapter(
  body: CreateChapterRequest,
): Promise<number> {
  const { data } = await api.post<ApiResponse<number>>("/v1/chapters", body)
  return data.result
}

/**
 * 지부 일괄 생성 (CHAPTER-002)
 * 여러 지부를 일괄 생성합니다.
 */
export async function createChaptersBulk(
  body: CreateChapterBulkRequest,
): Promise<number[]> {
  const { data } = await api.post<ApiResponse<number[]>>(
    "/v1/chapters/bulk",
    body,
  )
  return data.result
}

/**
 * 지부 삭제 (CHAPTER-003)
 * 지부를 삭제합니다. 소속 학교는 삭제되지 않습니다.
 */
export async function deleteChapter(chapterId: number | string): Promise<void> {
  const { data } = await api.delete<ApiResponse<void>>(
    `/v1/chapters/${chapterId}`,
  )
  return data.result
}
