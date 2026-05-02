import { api } from "@/shared/lib/axios"

import type {
  CompleteEmailVerificationRequest,
  CompleteEmailVerificationResponse,
  ResendEmailVerificationRequest,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
} from "@/features/auth/model/types"

export async function sendEmailVerification(
  payload: SendEmailVerificationRequest,
): Promise<SendEmailVerificationResponse> {
  const { data } = await api.post<SendEmailVerificationResponse>(
    "/v1/auth/email-verification",
    payload,
  )
  return data
}

export async function resendEmailVerification(
  payload: ResendEmailVerificationRequest,
): Promise<void> {
  await api.post("/v1/auth/email-verification/resend", payload)
}

export async function completeEmailVerification(
  payload: CompleteEmailVerificationRequest,
): Promise<CompleteEmailVerificationResponse> {
  const { data } = await api.post<CompleteEmailVerificationResponse>(
    "/v1/auth/email-verification/code",
    payload,
  )
  return data
}
