import { useQuery } from "@tanstack/react-query"

import {
  getResourcePermission,
  type PermissionType,
  type ResourceType,
} from "@/features/auth/api/permissions"

export function useResourcePermission(
  resourceType: ResourceType,
  resourceId?: number,
) {
  const query = useQuery({
    queryKey: [
      "authorization",
      "resource-permission",
      resourceType,
      resourceId,
    ],
    queryFn: () => getResourcePermission({ resourceType, resourceId }),
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("access_token"),
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
