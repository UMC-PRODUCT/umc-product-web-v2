import { api } from "@/shared/lib/axios"

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
  const { data } = await api.post<RenewAccessTokenResponse>(
    "/v1/auth/token/renew",
    { refreshToken } satisfies RenewAccessTokenRequest,
  )
  return data
}
