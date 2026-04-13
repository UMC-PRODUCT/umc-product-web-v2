import { create } from "zustand"

import type { BasicInfoFormData } from "../schemas/basicInfoSchema"

interface ProjectRegisterState {
  basicInfo: BasicInfoFormData | null
  setBasicInfo: (data: BasicInfoFormData) => void
}

export const useProjectRegisterStore = create<ProjectRegisterState>((set) => ({
  basicInfo: null,
  setBasicInfo: (data) => set({ basicInfo: data }),
}))
