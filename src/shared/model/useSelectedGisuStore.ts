import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface SelectedGisu {
  gisuId: string
  generation: number
}

interface SelectedGisuState {
  selected: SelectedGisu | null
  setSelected: (selected: SelectedGisu | null) => void
  clear: () => void
}

export const useSelectedGisuStore = create<SelectedGisuState>()(
  persist(
    (set) => ({
      selected: null,
      setSelected: (selected) => set({ selected }),
      clear: () => set({ selected: null }),
    }),
    {
      name: "umc-selected-gisu",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
