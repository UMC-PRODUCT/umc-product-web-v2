import { create } from "zustand"

export type ViewRole = "admin" | "challenger-plan" | "challenger-others"

interface ViewRoleState {
  role: ViewRole
  setRole: (role: ViewRole) => void
}

export const useViewRoleStore = create<ViewRoleState>((set) => ({
  role: "admin",
  setRole: (role) => set({ role }),
}))
