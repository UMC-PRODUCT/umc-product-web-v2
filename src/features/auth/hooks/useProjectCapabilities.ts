import { buildProjectCapabilities } from "../model/projectCapabilities"
import { useResourcePermission } from "./useResourcePermission"

import type { MemberInfoResponse } from "@/features/auth/api/me"

export function useProjectCapabilities(me: MemberInfoResponse | undefined) {
  const projectWritePermissionQuery = useResourcePermission(
    "PROJECT",
    undefined,
    {
      enabled: me != null,
      permissionType: "WRITE",
      allowTypeLevel: true,
    },
  )

  return {
    capabilities: buildProjectCapabilities({
      me,
      hasProjectWritePermission:
        projectWritePermissionQuery.hasPermission("WRITE"),
    }),
    isPermissionLoading: projectWritePermissionQuery.isPending,
    isPermissionError: projectWritePermissionQuery.isError,
  }
}
