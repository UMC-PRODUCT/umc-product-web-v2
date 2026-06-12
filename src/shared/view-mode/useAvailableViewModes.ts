import { useEffect } from "react"

import { useMe } from "@/features/auth/hooks/useMe"

import { useViewModeStore } from "."
import { computeAvailableViewModes } from "./availableViewModes"

export function useAvailableViewModes() {
  const { data: me } = useMe()
  const mode = useViewModeStore((s) => s.mode)
  const setMode = useViewModeStore((s) => s.setMode)

  const availableModes = computeAvailableViewModes(me)
  const defaultMode = availableModes[0] ?? "admin"

  useEffect(() => {
    if (availableModes.length > 0 && !availableModes.includes(mode)) {
      setMode(defaultMode)
    }
  }, [availableModes, mode, defaultMode, setMode])

  return { availableModes, defaultMode }
}
