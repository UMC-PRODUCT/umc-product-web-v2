import { useRouterState } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  canAccessProjectSettings,
  canManageProjects,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"
import { useViewMe } from "@/shared/view-mode/useViewMe"

import { filterSectionsByPermission } from "./utils"

interface MatchingSegmentRegionProps {
  activePathname?: string
}

export function MatchingSegmentRegion({
  activePathname,
}: MatchingSegmentRegionProps = {}) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const { viewMe } = useViewMe()
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

  const resolved = resolveNavigationFromPathname(pathname, visibleSections)
  if (!resolved) return null

  const { section, menu } = resolved

  const items: SegmentItem[] = section.menus.map((m) => ({
    id: m.id,
    label: m.title,
    to: m.to,
  }))

  return <Segment title={section.title} items={items} value={menu.id} />
}
