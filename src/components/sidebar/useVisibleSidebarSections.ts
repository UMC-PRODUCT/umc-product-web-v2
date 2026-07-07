import { useMemo } from "react"

import { useProjectCapabilities } from "@/entities/member/hooks/useProjectCapabilities"
import {
  isAnyOperator,
  isCurrentTermPm,
} from "@/entities/member/model/identity"
import { useViewerIdentity } from "@/entities/member/view-mode/useViewerIdentity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"

import { filterSectionsByPermission } from "./utils"

export function useVisibleSidebarSections() {
  const { me, isLoading } = useViewerIdentity()
  const { capabilities } = useProjectCapabilities(me)
  const isRegularChallenger = !isAnyOperator(me) && !isCurrentTermPm(me)

  const visibleSections = useMemo(
    () =>
      filterSectionsByPermission(SIDEBAR_ITEMS, {
        canAccessProjectSettings: capabilities.canAccessProjectSettings,
        canWriteProject: capabilities.canWriteProject,
        canAccessProjectManagement: capabilities.canAccessProjectManagement,
        canManageMatchingRounds: capabilities.canManageMatchingRounds,
        isRegularChallenger,
      }),
    [capabilities, isRegularChallenger],
  )

  return { visibleSections, isLoading }
}
