import { publicApi } from "@/shared/lib/publicApi"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { components } from "@/types/api"

type ActiveGisuResponse = components["schemas"]["ActiveGisuResponse"]

export async function getActiveGisu(): Promise<ActiveGisuResponse> {
  const { data } =
    await publicApi.get<ApiResponse<ActiveGisuResponse>>("/v1/gisu/active")
  return data.result
}
