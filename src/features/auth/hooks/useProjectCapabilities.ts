import { useMemo } from "react"

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

  const hasProjectWritePermission =
    projectWritePermissionQuery.hasPermission("WRITE")

  const capabilities = useMemo(
    () =>
      buildProjectCapabilities({
        me,
        hasProjectWritePermission,
      }),
    [me, hasProjectWritePermission],
  )

  return {
    capabilities,
    isPermissionLoading: projectWritePermissionQuery.isPending,
    isPermissionError: projectWritePermissionQuery.isError,
  }
}
