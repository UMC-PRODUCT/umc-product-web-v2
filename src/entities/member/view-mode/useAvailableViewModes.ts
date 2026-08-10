import { useViewerIdentity } from "./useViewerIdentity"

export function useAvailableViewModes() {
  const { availableModes } = useViewerIdentity()
  const defaultMode = availableModes[0] ?? "admin"

  return { availableModes, defaultMode }
}
