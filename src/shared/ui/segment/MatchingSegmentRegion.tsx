import { useRouterState } from "@tanstack/react-router"

import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"

export function MatchingSegmentRegion() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const resolved = resolveNavigationFromPathname(pathname)
  if (!resolved) return null

  const { section, menu } = resolved

  const items: SegmentItem[] = section.menus.map((m) => ({
    id: m.id,
    label: m.title,
    to: m.to,
  }))

  return <Segment title={section.title} items={items} value={menu.id} />
}
