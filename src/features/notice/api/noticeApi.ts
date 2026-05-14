import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  NoticeDetailResponse,
  NoticeSummaryResponse,
  NoticeTabEnum,
  PartEnum,
  PostNoticeRequest,
  PostNoticeResponse,
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

// 공지사항 상세 조회
export async function getNoticeDetail(noticeId: number) {
  const { data } = await api.get<ApiResponse<NoticeDetailResponse>>(
    `/v1/notices/${noticeId}`,
  )
  return data.result
}

// 공지사항 생성
export async function postNotice(body: PostNoticeRequest) {
  const { data } = await api.post<ApiResponse<PostNoticeResponse>>(
    `/v1/notices`,
    body,
  )
  return data.result
}
