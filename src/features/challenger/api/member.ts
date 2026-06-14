import { api } from "@/shared/lib/axios"

import type {
  MemberInfoResponse,
  SearchChallengerCursorParams,
  SearchChallengerCursorResponse,
  SearchMemberParams,
  SearchMemberResponse,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function searchMembers(
  params: SearchMemberParams,
): Promise<SearchMemberResponse> {
  const { data } = await api.get<ApiResponse<SearchMemberResponse>>(
    "/v1/member/search",
    { params },
  )
  return data.result
}

export async function searchChallengersByCursor(
  params: SearchChallengerCursorParams,
): Promise<SearchChallengerCursorResponse> {
  const { data } = await api.get<ApiResponse<SearchChallengerCursorResponse>>(
    "/v1/challenger/search/cursor",
    { params },
  )
  return data.result
}

export async function searchAllMembers(
  params: SearchMemberParams,
): Promise<SearchMemberResponse> {
  const firstPage = await searchMembers({ ...params, page: 0 })
  const totalPages = firstPage.page.totalPages

  if (totalPages <= 1) return firstPage

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      searchMembers({ ...params, page: index + 1 }),
    ),
  )

  const content = [
    ...firstPage.page.content,
    ...restPages.flatMap((response) => response.page.content),
  ]

  return {
    totalCount: firstPage.totalCount,
    page: {
      ...firstPage.page,
      content,
      page: 0,
      totalElements: firstPage.page.totalElements,
      totalPages,
      hasNext: false,
      hasPrevious: false,
    },
  }
}

export async function getMemberProfile(
  memberId: string,
): Promise<MemberInfoResponse> {
  const { data } = await api.get<ApiResponse<MemberInfoResponse>>(
    `/v1/member/profile/${encodeURIComponent(memberId)}`,
  )
  return data.result
}
