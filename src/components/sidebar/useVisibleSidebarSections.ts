import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import {
  canAccessProjectSettings,
  canManageProjects,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"

import { filterSectionsByPermission } from "./utils"

export function useVisibleSidebarSections() {
  const { data: me, isLoading } = useMe()
  const canAccessSettings = canAccessProjectSettings(me)
  const canManage = canManageProjects(me)
  const canRecruit = isOperator(me) || isCurrentTermPm(me)

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
