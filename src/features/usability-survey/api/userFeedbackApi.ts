import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  FeedbackContext,
  GetUserFeedbackTemplateResponse,
  SubmitUserFeedbackResponseRequest,
  UserFeedbackSubmitResponse,
} from "./types"

export async function getFeedbackTemplate(context: FeedbackContext) {
  const { data } = await api.get<
    ApiResponse<GetUserFeedbackTemplateResponse | null>
  >("/v1/user-feedbacks/templates", { params: { context } })
  return data.result
}

export async function submitFeedbackResponse(
  body: SubmitUserFeedbackResponseRequest,
) {
  const { data } = await api.post<ApiResponse<UserFeedbackSubmitResponse>>(
    "/v1/user-feedbacks/responses",
    body,
  )
  return data.result
}
