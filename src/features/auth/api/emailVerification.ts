import { api } from "@/shared/lib/axios"

import type {
  CompleteEmailVerificationRequest,
  CompleteEmailVerificationResponse,
  GetEmailAvailabilityRequest,
  GetEmailAvailabilityResponse,
  ResendEmailVerificationRequest,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
} from "@/features/auth/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

export async function sendEmailVerification(
  payload: SendEmailVerificationRequest,
): Promise<SendEmailVerificationResponse> {
  const { data } = await api.post<ApiResponse<SendEmailVerificationResponse>>(
    "/v1/auth/email-verification",
    payload,
  )
  return data.result
}

export async function resendEmailVerification(
  payload: ResendEmailVerificationRequest,
): Promise<void> {
  await api.post("/v1/auth/email-verification/resend", payload)
}

export async function completeEmailVerification(
  payload: CompleteEmailVerificationRequest,
): Promise<CompleteEmailVerificationResponse> {
  const { data } = await api.post<
    ApiResponse<CompleteEmailVerificationResponse>
  >("/v1/auth/email-verification/code", payload)
  return data.result
}

export async function getEmailAvailability(
  params: GetEmailAvailabilityRequest,
): Promise<GetEmailAvailabilityResponse> {
  const { data } = await api.get<ApiResponse<GetEmailAvailabilityResponse>>(
    "/v1/auth/email/availability",
    { params },
  )
  return data.result
}
