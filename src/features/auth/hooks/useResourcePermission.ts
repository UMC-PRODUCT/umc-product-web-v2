import { useQuery } from "@tanstack/react-query"

import {
  getResourcePermission,
  type PermissionType,
  type ResourceType,
} from "@/features/auth/api/permissions"
import { hasGrantedPermission } from "@/features/auth/model/resourcePermission"
import { useAuthStore } from "@/features/auth/store/authStore"

interface UseResourcePermissionOptions {
  enabled?: boolean
  permissionType?: PermissionType
  allowTypeLevel?: boolean
}

export function useResourcePermission(
  resourceType: ResourceType,
  resourceId?: number,
  options?: UseResourcePermissionOptions,
) {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const canRequest =
    resourceId !== undefined || options?.allowTypeLevel === true
  const query = useQuery({
    queryKey: [
      "authorization",
      "resource-permission",
      resourceType,
      resourceId,
      options?.permissionType,
    ],
    queryFn: () =>
      getResourcePermission({
        resourceType,
        resourceId,
        permissionType: options?.permissionType,
      }),
    enabled: isAuthed && canRequest && (options?.enabled ?? true),
    staleTime: 0,
  })

  const hasPermission = (type: PermissionType): boolean =>
    hasGrantedPermission(query.data, type)

  return {
    ...query,
    hasPermission,
  }
}
