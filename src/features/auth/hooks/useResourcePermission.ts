import { useQuery } from "@tanstack/react-query"

import {
  getResourcePermission,
  type PermissionType,
  type ResourceType,
} from "@/features/auth/api/permissions"
import { useAuthStore } from "@/features/auth/store/authStore"

export function useResourcePermission(
  resourceType: ResourceType,
  resourceId?: number,
  options?: { enabled?: boolean },
) {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const query = useQuery({
    queryKey: [
      "authorization",
      "resource-permission",
      resourceType,
      resourceId,
    ],
    queryFn: () => getResourcePermission({ resourceType, resourceId }),
    enabled: isAuthed && (options?.enabled ?? true),
    staleTime: 0,
  })

  const hasPermission = (type: PermissionType): boolean =>
    query.data?.permissions?.some(
      (p) => p.permissionType === type && p.hasPermission === true,
    ) ?? false

  return {
    ...query,
    hasPermission,
  }
}
