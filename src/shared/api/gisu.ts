import { api } from "@/shared/lib/axios"
import { useCacheStore } from "@/shared/store/cacheStore"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { components } from "@/types/api"

type ActiveGisuResponse = components["schemas"]["ActiveGisuResponse"]

export async function getActiveGisu(
  options?: unknown,
): Promise<ActiveGisuResponse> {
  const bypassCache =
    options && typeof options === "object" && "bypassCache" in options
      ? (options as { bypassCache?: unknown }).bypassCache === true
      : false

  if (!bypassCache) {
    const cached = useCacheStore.getState().activeGisu
    if (cached) {
      return cached
    }
  }

  const { data } =
    await api.get<ApiResponse<ActiveGisuResponse>>("/v1/gisu/active")
  useCacheStore.getState().setActiveGisu(data.result)
  return data.result
}
