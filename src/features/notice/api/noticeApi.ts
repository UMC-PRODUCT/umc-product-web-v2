import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  NoticeSummaryResponse,
  NoticeTabEnum,
  PartEnum,
} from "../model/apiTypes"

// 공지사항 전체 조회
export async function getNotices(params: {
  gisuId: number
  chapterId?: number
  schoolId?: number
  part?: PartEnum
  noticeTab: NoticeTabEnum
  page?: number
  size?: number
  sort?: string // property,(asc|desc) 형식으로 작성 (ex: createdAt,DESC)
}) {
  const { data } = await api.get<ApiResponse<NoticeSummaryResponse>>(
    `/v1/notices`,
    { params },
  )
  return data.result
}
