import { useQuery } from "@tanstack/react-query"

import {
  batchGetResourcePermission,
  type PermissionType,
  type ResourcePermissionQuery,
  type ResourceType,
} from "@/entities/member/api/permissions"
import { hasGrantedResourcePermission } from "@/entities/member/model/resourcePermission"
import { useAuthStore } from "@/entities/member/store/authStore"

interface UseResourcePermissionsBatchOptions {
  enabled?: boolean
}

function normalizeResourcePermissionQueries(
  queries: ResourcePermissionQuery[],
): ResourcePermissionQuery[] {
  return queries
    .filter(
      (query) =>
        query.resourceIds === undefined || query.resourceIds.length > 0,
    )
    .map((query) => ({
      ...query,
      permissionTypes:
        query.permissionTypes !== undefined && query.permissionTypes.length > 0
          ? query.permissionTypes
          : undefined,
    }))
}

export function useResourcePermissionsBatch(
  queries: ResourcePermissionQuery[],
  options?: UseResourcePermissionsBatchOptions,
) {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const normalizedQueries = normalizeResourcePermissionQueries(queries)
  const query = useQuery({
    queryKey: [
      "authorization",
      "resource-permissions",
      "batch",
      normalizedQueries,
    ],
    queryFn: () => batchGetResourcePermission(normalizedQueries),
    enabled:
      isAuthed && normalizedQueries.length > 0 && (options?.enabled ?? true),
    staleTime: 0,
  })

  const hasPermission = (params: {
    resourceType: ResourceType
    resourceId?: number
    permissionType: PermissionType
  }): boolean => hasGrantedResourcePermission(query.data?.results, params)

  return {
    ...query,
    hasPermission,
  }
}
