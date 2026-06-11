import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"

interface UseProjectPermissionsOptions {
  enabled?: boolean
}

export function useProjectPermissions(
  projectId?: number,
  options?: UseProjectPermissionsOptions,
) {
  const query = useResourcePermission("PROJECT", projectId, {
    enabled: options?.enabled,
  })

  return {
    ...query,
    canDelete: query.hasPermission("DELETE"),
    canEdit: query.hasPermission("EDIT"),
    canManage: query.hasPermission("MANAGE"),
    canRead: query.hasPermission("READ"),
  }
}
