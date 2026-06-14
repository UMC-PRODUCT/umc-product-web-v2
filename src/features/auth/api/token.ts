import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

interface RenewAccessTokenRequest {
  refreshToken: string
}

interface RenewAccessTokenResponse {
  accessToken: string
  refreshToken: string
}

export async function renewAccessToken(
  refreshToken: string,
): Promise<RenewAccessTokenResponse> {
  const { data } = await api.post<ApiResponse<RenewAccessTokenResponse>>(
    "/v1/auth/token/renew",
    { refreshToken } satisfies RenewAccessTokenRequest,
  )
  return data.result
}
