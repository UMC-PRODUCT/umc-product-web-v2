import { useNavigate, useRouterState } from "@tanstack/react-router"

import {
  pathForMenuId,
  resolveNavigationFromPathname,
} from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"

export function MatchingSegmentRegion() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  const resolved = resolveNavigationFromPathname(pathname)
  if (!resolved) return null

  const { section, menu } = resolved

  const items: SegmentItem[] = section.menus.map((m) => ({
    id: m.id,
    label: m.title,
  }))

  return (
    <Segment
      title={section.title}
      items={items}
      value={menu.id}
      onValueChange={(menuId) => {
        const to = pathForMenuId(menuId)
        if (to) void navigate({ to })
      }}
    />
  )
}
