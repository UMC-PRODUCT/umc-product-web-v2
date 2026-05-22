import { useRouterState } from "@tanstack/react-router"
import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import { isOperator } from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"

import { filterSectionsByPermission } from "./utils"

export function MatchingSegmentRegion() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { data: me } = useMe()
  const canManageRecruitment = isOperator(me)

  const visibleSections = useMemo(
    () => filterSectionsByPermission(SIDEBAR_ITEMS, canManageRecruitment),
    [canManageRecruitment],
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
