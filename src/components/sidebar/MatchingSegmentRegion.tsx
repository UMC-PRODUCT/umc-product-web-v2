import { useRouterState } from "@tanstack/react-router"
import { useMemo } from "react"

import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"
import { useViewModeStore } from "@/shared/view-mode"

import { getVisibleSectionsByViewMode } from "./utils"

export function MatchingSegmentRegion() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const mode = useViewModeStore((s) => s.mode)
  const visibleSections = useMemo(
    () => getVisibleSectionsByViewMode(SIDEBAR_ITEMS, mode),
    [mode],
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
