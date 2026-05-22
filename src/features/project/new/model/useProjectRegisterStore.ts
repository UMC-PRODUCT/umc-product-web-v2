import { create } from "zustand"

import type { MemberItem } from "@/shared/ui/searchbar/MemberSearchBar"

import type { Question, Section } from "./applicationQuestion"
import type { BasicInfoFormData } from "./basicInfoSchema"

export type RoleKey = "design" | "frontend" | "backend"
export type RoleStack = "Web" | "iOS" | "Android" | "SpringBoot" | "Node.js"

export interface RoleState {
  count: number
  stack: RoleStack | undefined
}

interface PmInfo {
  isMultiPm: boolean
  pm1: MemberItem | null
  pm2: MemberItem | null
}

interface UploadedFileIds {
  thumbnailFileId: string | null
  logoFileId: string | null
  thumbnailUrl: string | null
  logoUrl: string | null
}

interface BasicDraftFields {
  title: string
  description: string
}

interface ProjectRegisterState {
  projectId: number | null
  gisuId: number | null
  basicInfo: BasicInfoFormData | null
  basicDraftFields: BasicDraftFields | null
  pmInfo: PmInfo
  uploaded: UploadedFileIds
  recruitInfo: Record<RoleKey, RoleState>
  application: {
    commonQuestions: Question[]
    sections: Section[]
  }

  setProjectId: (id: number) => void
  setGisuId: (id: number) => void
  setBasicInfo: (data: BasicInfoFormData) => void
  setBasicDraftFields: (fields: BasicDraftFields) => void
  setPmInfo: (patch: Partial<PmInfo>) => void
  setUploaded: (patch: Partial<UploadedFileIds>) => void
  setRecruitInfo: (state: Record<RoleKey, RoleState>) => void
  setApplication: (
    patch: Partial<{ commonQuestions: Question[]; sections: Section[] }>,
  ) => void
  reset: () => void
}

const DEFAULT_RECRUIT_INFO: Record<RoleKey, RoleState> = {
  design: { count: 0, stack: undefined },
  frontend: { count: 0, stack: undefined },
  backend: { count: 0, stack: undefined },
}

export const useProjectRegisterStore = create<ProjectRegisterState>((set) => ({
  projectId: null,
  gisuId: null,
  basicInfo: null,
  basicDraftFields: null,
  pmInfo: { isMultiPm: false, pm1: null, pm2: null },
  uploaded: {
    thumbnailFileId: null,
    logoFileId: null,
    thumbnailUrl: null,
    logoUrl: null,
  },
  recruitInfo: { ...DEFAULT_RECRUIT_INFO },
  application: { commonQuestions: [], sections: [] },

  setProjectId: (id) => set({ projectId: id }),
  setGisuId: (id) => set({ gisuId: id }),
  setBasicInfo: (data) => set({ basicInfo: data }),
  setBasicDraftFields: (fields) => set({ basicDraftFields: fields }),
  setPmInfo: (patch) => set((s) => ({ pmInfo: { ...s.pmInfo, ...patch } })),
  setUploaded: (patch) =>
    set((s) => ({ uploaded: { ...s.uploaded, ...patch } })),
  setRecruitInfo: (state) => set({ recruitInfo: state }),
  setApplication: (patch) =>
    set((s) => ({ application: { ...s.application, ...patch } })),
  reset: () =>
    set({
      projectId: null,
      gisuId: null,
      basicInfo: null,
      basicDraftFields: null,
      pmInfo: { isMultiPm: false, pm1: null, pm2: null },
      uploaded: {
        thumbnailFileId: null,
        logoFileId: null,
        thumbnailUrl: null,
        logoUrl: null,
      },
      recruitInfo: { ...DEFAULT_RECRUIT_INFO },
      application: { commonQuestions: [], sections: [] },
    }),
}))
