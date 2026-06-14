import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export const VIEW_MODE_OPTIONS = [
  { mode: "admin", label: "Admin View" },
  { mode: "pm", label: "Challenger-Plan View" },
  { mode: "others", label: "Challenger-Others View" },
] as const

export type ViewMode = (typeof VIEW_MODE_OPTIONS)[number]["mode"]

interface ViewModeState {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  setModeByIndex: (index: number) => void
}

function modeFromIndex(index: number): ViewMode {
  return VIEW_MODE_OPTIONS[index]?.mode ?? "admin"
}

export function indexFromMode(mode: ViewMode): number {
  const idx = VIEW_MODE_OPTIONS.findIndex((item) => item.mode === mode)
  return idx === -1 ? 0 : idx
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      mode: "admin",
      setMode: (mode) => set({ mode }),
      setModeByIndex: (index) => set({ mode: modeFromIndex(index) }),
    }),
    {
      name: "umc-view-mode",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
