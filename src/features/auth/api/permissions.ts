import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"
import type { components, operations } from "@/types/api"

export type ResourceType = NonNullable<
  operations["getResourcePermission"]["parameters"]["query"]["resourceType"]
>
export type PermissionType = NonNullable<
  components["schemas"]["PermissionInfo"]["permissionType"]
>
export type ResourcePermissionQuery =
  components["schemas"]["ResourcePermissionQueryRequest"]
export type ResourcePermissionResponse =
  components["schemas"]["ResourcePermissionResponse"]
export type BatchResourcePermissionResponse =
  components["schemas"]["BatchResourcePermissionResponse"]

export async function getResourcePermission(params: {
  resourceType: ResourceType
  resourceId?: number
  permissionType?: PermissionType
}): Promise<ResourcePermissionResponse> {
  const { data } = await api.get<ApiResponse<ResourcePermissionResponse>>(
    "/v1/authorization/resource-permission",
    { params },
  )
  return data.result
}

export async function batchGetResourcePermission(
  queries: ResourcePermissionQuery[],
): Promise<BatchResourcePermissionResponse> {
  const { data } = await api.post<ApiResponse<BatchResourcePermissionResponse>>(
    "/v1/authorization/resource-permissions/batch",
    { queries },
  )
  return data.result
}
