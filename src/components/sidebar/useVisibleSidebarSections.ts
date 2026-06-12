import { useMemo } from "react"

import {
  canAccessProjectSettings,
  canManageProjects,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { useViewMe } from "@/shared/view-mode/useViewMe"

import { filterSectionsByPermission } from "./utils"

export function useVisibleSidebarSections() {
  const { viewMe, isLoading } = useViewMe()
  const canAccessSettings = canAccessProjectSettings(viewMe)
  const canManage = canManageProjects(viewMe)
  const canRecruit = isOperator(viewMe) || isCurrentTermPm(viewMe)

  const visibleSections = useMemo(
    () =>
      filterSectionsByPermission(SIDEBAR_ITEMS, {
        canAccessProjectSettings: canAccessSettings,
        canManageProjects: canManage,
        canManageRecruitment: canRecruit,
      }),
    [canAccessSettings, canManage, canRecruit],
  )

  return { visibleSections, isLoading }
}
