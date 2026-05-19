import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { components, operations } from "@/types/api"

export type ResourceType = NonNullable<
  operations["getResourcePermission"]["parameters"]["query"]["resourceType"]
>
export type PermissionType = NonNullable<
  components["schemas"]["PermissionInfo"]["permissionType"]
>
export type ResourcePermissionResponse =
  components["schemas"]["ResourcePermissionResponse"]

export async function getResourcePermission(params: {
  resourceType: ResourceType
  resourceId?: number
}): Promise<ResourcePermissionResponse> {
  const { data } = await api.get<ApiResponse<ResourcePermissionResponse>>(
    "/v1/authorization/resource-permission",
    { params },
  )
  return data.result
}
