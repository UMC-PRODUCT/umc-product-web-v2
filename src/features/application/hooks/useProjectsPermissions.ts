import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useAuthStore } from "@/features/auth/store/authStore"

import { getProjectsPermissions } from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"

import type { ProjectPermissionResponse } from "../model/projectPermissionTypes"

interface UseProjectsPermissionsOptions {
  enabled?: boolean
}

export function useProjectsPermissions(
  projectIds: string[],
  options: UseProjectsPermissionsOptions = {},
) {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const sortedIds = useMemo(() => [...projectIds].sort(), [projectIds])

  const query = useQuery({
    queryKey: applicationKeys.projectsPermissions(sortedIds),
    queryFn: () => getProjectsPermissions(sortedIds),
    enabled: isAuthed && sortedIds.length > 0 && (options.enabled ?? true),
    staleTime: 0,
  })

  const permissionByProjectId = useMemo(() => {
    const map = new Map<string, ProjectPermissionResponse>()
    for (const item of query.data?.projects ?? []) {
      map.set(String(item.projectId), item)
    }
    return map
  }, [query.data])

  const getCapability = (projectId: string | number) =>
    permissionByProjectId.get(String(projectId))

  const canReadList = (projectId: string | number): boolean =>
    getCapability(projectId)?.application.canReadList.allowed ?? false

  const canDecide = (projectId: string | number): boolean =>
    getCapability(projectId)?.application.canDecide.allowed ?? false

  const canReadStatistics = (projectId: string | number): boolean =>
    getCapability(projectId)?.statistics.canRead.allowed ?? false

  return {
    ...query,
    permissionByProjectId,
    getCapability,
    canReadList,
    canDecide,
    canReadStatistics,
  }
}
