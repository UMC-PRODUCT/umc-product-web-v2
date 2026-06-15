import { useRouterState } from "@tanstack/react-router"
import { useMemo } from "react"

import { useProjectCapabilities } from "@/features/auth/hooks/useProjectCapabilities"
import { isAnyOperator, isCurrentTermPm } from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { resolveNavigationFromPathname } from "@/shared/config/navigationResolve"
import { Segment, type SegmentItem } from "@/shared/ui/segment/Segment"
import { useViewerIdentity } from "@/shared/view-mode/useViewerIdentity"

import { filterSectionsByPermission } from "./utils"

interface MatchingSegmentRegionProps {
  activePathname?: string
}

export function MatchingSegmentRegion({
  activePathname,
}: MatchingSegmentRegionProps = {}) {
  const currentPathname = useRouterState({ select: (s) => s.location.pathname })
  const pathname = activePathname ?? currentPathname
  const { me } = useViewerIdentity()
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

  const resolved = resolveNavigationFromPathname(pathname, visibleSections)
  if (!resolved) return null

  const { section, menu } = resolved

  const items: SegmentItem[] = section.menus.map((m) => ({
    id: m.id,
    label: m.title,
    to: m.to,
  }))

  return (
    <div id="matching-segment-region">
      <Segment title={section.title} items={items} value={menu.id} />
    </div>
  )
}
