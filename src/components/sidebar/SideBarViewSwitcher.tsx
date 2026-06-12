import {
  useViewModeStore,
  VIEW_MODE_OPTIONS,
  type ViewMode,
} from "@/shared/view-mode"
import { useAvailableViewModes } from "@/shared/view-mode/useAvailableViewModes"

import { SideBarDropDown } from "./dropdown/SideBarDropDown"

interface SideBarViewSwitcherProps {
  onSelect?: (mode: ViewMode) => void
  className?: string
}

export function SideBarViewSwitcher({
  onSelect,
  className,
}: SideBarViewSwitcherProps) {
  const { availableModes } = useAvailableViewModes()
  const mode = useViewModeStore((s) => s.mode)
  const setMode = useViewModeStore((s) => s.setMode)

  if (availableModes.length < 2) return null

  const options = VIEW_MODE_OPTIONS.filter((o) =>
    availableModes.includes(o.mode),
  )
  const selectedIdx = Math.max(
    0,
    options.findIndex((o) => o.mode === mode),
  )

  return (
    <div className={className}>
      <SideBarDropDown
        options={options}
        selectedIdx={selectedIdx}
        onSelect={(idx) => {
          const next = options[idx]?.mode
          if (!next || next === mode) return
          setMode(next)
          onSelect?.(next)
        }}
      />
    </div>
  )
}
