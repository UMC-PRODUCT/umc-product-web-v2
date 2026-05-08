import { create } from "zustand"

export const VIEW_MODE_OPTIONS = [
  { mode: "admin", label: "Admin View" },
  { mode: "pm", label: "Challenger-Plan View" },
  { mode: "others", label: "Challenger-Others View" },
] as const

export type ViewMode = (typeof VIEW_MODE_OPTIONS)[number]["mode"]

interface ViewModeState {
  mode: ViewMode
  previewMode: ViewMode
  viewerBranch: string
  setModeByIndex: (index: number) => void
  setPreviewModeByIndex: (index: number) => void
}

function modeFromIndex(index: number): ViewMode {
  return VIEW_MODE_OPTIONS[index]?.mode ?? "admin"
}

export function indexFromMode(mode: ViewMode): number {
  const idx = VIEW_MODE_OPTIONS.findIndex((item) => item.mode === mode)
  return idx === -1 ? 0 : idx
}

/** 임시 상태: 권한에 따른 뷰 변화를 보고 싶으시면 아래에서 임시 설정 가능합니다. */
export const useViewModeStore = create<ViewModeState>((set) => ({
  mode: "admin",
  previewMode: "admin",
  viewerBranch: "Selenium",
  setModeByIndex: (index) => set({ mode: modeFromIndex(index) }),
  setPreviewModeByIndex: (index) => set({ previewMode: modeFromIndex(index) }),
}))
