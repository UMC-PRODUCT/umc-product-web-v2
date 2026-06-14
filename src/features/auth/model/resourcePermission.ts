import type {
  PermissionType,
  ResourcePermissionResponse,
  ResourceType,
} from "@/features/auth/api/permissions"

export function hasGrantedPermission(
  permissionResponse: ResourcePermissionResponse | undefined,
  permissionType: PermissionType,
): boolean {
  return (
    permissionResponse?.permissions?.some(
      (permission) =>
        permission.permissionType === permissionType &&
        permission.hasPermission === true,
    ) ?? false
  )
}

export function hasGrantedResourcePermission(
  permissionResponses: ResourcePermissionResponse[] | undefined,
  params: {
    resourceType: ResourceType
    resourceId?: number
    permissionType: PermissionType
  },
): boolean {
  const permissionResponse = permissionResponses?.find((response) => {
    const responseId =
      response.resourceId == null ? undefined : String(response.resourceId)
    const paramId =
      params.resourceId == null ? undefined : String(params.resourceId)
    return (
      response.resourceType === params.resourceType && responseId === paramId
    )
  })

  return hasGrantedPermission(permissionResponse, params.permissionType)
}
