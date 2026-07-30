import { createContext, useContext, useRef } from "react"
import { createStore, useStore } from "zustand"

import { PARTS } from "./parts"
import { INITIAL_PERIOD_FORM } from "./recruitmentCreate"

import type { ReactNode } from "react"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { PartKey } from "./parts"
import type { PeriodFieldKey, PeriodFieldValue } from "./recruitmentCreate"
import type { RecruitmentRoundType } from "./recruitmentList"

// 모집 생성 3단계(기본 정보·모집 문항·공고)가 공유하는 값들.
// 각 단계는 여전히 독립 컴포넌트지만, roundId·트랙 선택처럼 다른 단계의
// 값을 참조해야 하는 필드는 여기서 소유한다.
export interface RecruitmentBasicInfo {
  chapter: Chapter | undefined
  school: string | undefined
  recruitmentType: RecruitmentRoundType | undefined
  roundNo: string | undefined
  interviewRequired: boolean
  footer: string
  periodForm: Record<PeriodFieldKey, PeriodFieldValue>
}

const DEFAULT_BASIC_INFO: RecruitmentBasicInfo = {
  chapter: undefined,
  school: undefined,
  // 공통 디폴트: 정규 모집·1차가 항상 기본 선택되어 있어야 한다.
  recruitmentType: "REGULAR",
  roundNo: "1",
  interviewRequired: true,
  footer: "",
  periodForm: INITIAL_PERIOD_FORM,
}

const DEFAULT_ENABLED_PARTS: Record<PartKey, boolean> = Object.fromEntries(
  PARTS.map((part) => [part.key, false]),
) as Record<PartKey, boolean>

export interface RecruitmentCreateState {
  seasonId: string | null
  roundId: string | null
  basicInfo: RecruitmentBasicInfo
  // Step2 "파트 사용" 토글. 백엔드 recruitableTracks는 이 값에서 파생된다.
  enabledParts: Record<PartKey, boolean>
  announcement: string
  contactText: string

  setSeasonId: (id: string | null) => void
  setRoundId: (id: string) => void
  patchBasicInfo: (patch: Partial<RecruitmentBasicInfo>) => void
  setEnabledParts: (parts: Record<PartKey, boolean>) => void
  setAnnouncement: (text: string) => void
  setContactText: (text: string) => void
  reset: () => void
}

export function createRecruitmentCreateStore() {
  return createStore<RecruitmentCreateState>((set) => ({
    seasonId: null,
    roundId: null,
    basicInfo: { ...DEFAULT_BASIC_INFO },
    enabledParts: { ...DEFAULT_ENABLED_PARTS },
    announcement: "",
    contactText: "",

    setSeasonId: (id) => set({ seasonId: id }),
    setRoundId: (id) => set({ roundId: id }),
    patchBasicInfo: (patch) =>
      set((s) => ({ basicInfo: { ...s.basicInfo, ...patch } })),
    setEnabledParts: (parts) => set({ enabledParts: parts }),
    setAnnouncement: (text) => set({ announcement: text }),
    setContactText: (text) => set({ contactText: text }),
    reset: () =>
      set({
        seasonId: null,
        roundId: null,
        basicInfo: { ...DEFAULT_BASIC_INFO },
        enabledParts: { ...DEFAULT_ENABLED_PARTS },
        announcement: "",
        contactText: "",
      }),
  }))
}

export type RecruitmentCreateStoreApi = ReturnType<
  typeof createRecruitmentCreateStore
>

const RecruitmentCreateStoreContext =
  createContext<RecruitmentCreateStoreApi | null>(null)

export function RecruitmentCreateStoreProvider({
  children,
}: {
  children: ReactNode
}) {
  const storeRef = useRef<RecruitmentCreateStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createRecruitmentCreateStore()
  }
  return (
    <RecruitmentCreateStoreContext.Provider value={storeRef.current}>
      {children}
    </RecruitmentCreateStoreContext.Provider>
  )
}

export function useRecruitmentCreateStoreApi(): RecruitmentCreateStoreApi {
  const store = useContext(RecruitmentCreateStoreContext)
  if (!store) {
    throw new Error(
      "useRecruitmentCreateStore는 RecruitmentCreateStoreProvider 내부에서만 사용할 수 있습니다.",
    )
  }
  return store
}

export function useRecruitmentCreateStore<T>(
  selector: (state: RecruitmentCreateState) => T,
): T {
  return useStore(useRecruitmentCreateStoreApi(), selector)
}
