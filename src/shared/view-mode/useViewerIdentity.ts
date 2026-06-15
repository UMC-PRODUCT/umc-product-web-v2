import { useEffect, useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"

import { useViewModeStore } from "."
import {
  computeAvailableViewModes,
  resolveAvailableViewMode,
} from "./availableViewModes"
import { getProjectViewContext } from "./projectViewContext"

export function useViewerIdentity() {
  const { data: me, isLoading } = useMe()
  const mode = useViewModeStore((state) => state.mode)
  const setMode = useViewModeStore((state) => state.setMode)
  const availableModes = useMemo(() => computeAvailableViewModes(me), [me])
  const defaultMode = availableModes[0]
  const resolvedMode = resolveAvailableViewMode(mode, availableModes)
  const viewContext = useMemo(
    () => getProjectViewContext(me, resolvedMode),
    [me, resolvedMode],
  )

  useEffect(() => {
    if (defaultMode != null && mode !== resolvedMode) {
      setMode(resolvedMode)
    }
  }, [defaultMode, mode, resolvedMode, setMode])

  return {
    me,
    mode: resolvedMode,
    availableModes,
    viewContext,
    isLoading,
  }
}
