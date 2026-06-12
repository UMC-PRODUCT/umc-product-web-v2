import { useRouterState } from "@tanstack/react-router"
import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import {
  canAccessProjectSettings,
  canManageProjects,
  isOperator,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"

import { filterSectionsByPermission } from "./utils"

interface MatchingSegmentRegionProps {
  activePathname?: string
}

export function MatchingSegmentRegion({
  activePathname,
}: MatchingSegmentRegionProps = {}) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const { data: me } = useMe()
  const canAccessSettings = canAccessProjectSettings(me)
  const canManage = canManageProjects(me)
  const canRecruit = isOperator(me)

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
