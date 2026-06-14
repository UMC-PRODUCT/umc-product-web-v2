import { useMemo } from "react"

import {
  canAccessProjectSettings,
  canManageMatchingRounds,
  canManageProjects,
  isAnyOperator,
  isCurrentTermPm,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { useViewMe } from "@/shared/view-mode/useViewMe"

import { filterSectionsByPermission } from "./utils"

export function useVisibleSidebarSections() {
  const { viewMe, isLoading } = useViewMe()
  const canAccessSettings = canAccessProjectSettings(viewMe)
  const canManage = canManageProjects(viewMe)
  const canManageRounds = canManageMatchingRounds(viewMe)
  const isRegularChallenger = !isAnyOperator(viewMe) && !isCurrentTermPm(viewMe)

  const visibleSections = useMemo(
    () =>
      filterSectionsByPermission(SIDEBAR_ITEMS, {
        canAccessProjectSettings: canAccessSettings,
        canManageProjects: canManage,
        canManageMatchingRounds: canManageRounds,
        isRegularChallenger,
      }),
    [canAccessSettings, canManage, canManageRounds, isRegularChallenger],
  )

  return { visibleSections, isLoading }
}
