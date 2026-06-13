import { create } from "zustand"

interface SelectedChallengerState {
  selectedGisuId: string | null
  setSelectedGisuId: (gisuId: string) => void
}

export const useSelectedChallengerStore = create<SelectedChallengerState>(
  (set) => ({
    selectedGisuId: null,
    setSelectedGisuId: (gisuId) => set({ selectedGisuId: gisuId }),
  }),
)
