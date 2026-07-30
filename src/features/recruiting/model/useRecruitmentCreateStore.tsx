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
// 각 단계는 여전히 독립 컴포넌트지만, roundId·트랙 선택처럼 다른 단계의 값을 참조해야 하는 필드는 여기서 소유한다.
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
  // availability form 빌더 미구현이라 체크박스 자체를 disabled로 막아둠
  interviewRequired: false,
  footer: "",
  periodForm: INITIAL_PERIOD_FORM,
}

const DEFAULT_ENABLED_PARTS: Record<PartKey, boolean> = Object.fromEntries(
  PARTS.map((part) => [part.key, false]),
) as Record<PartKey, boolean>

export interface RecruitmentCreateState {
  seasonId: string | null
  roundId: string | null
  // 모집 제목("UMC N기 ...")에 쓰는 로그인 사용자의 활성 기수 번호.
  gisuGeneration: number | null
  basicInfo: RecruitmentBasicInfo
  // Step2 "파트 사용" 토글
  enabledParts: Record<PartKey, boolean>
  // Step2 기본 문항 04번(2지망) enabled 토글과 동기화되는 Round 레벨 플래그.
  secondChoiceEnabled: boolean
  announcement: string
  contactText: string

  setSeasonId: (id: string | null) => void
  setRoundId: (id: string) => void
  setGisuGeneration: (generation: number | null) => void
  patchBasicInfo: (patch: Partial<RecruitmentBasicInfo>) => void
  setEnabledParts: (parts: Record<PartKey, boolean>) => void
  setSecondChoiceEnabled: (enabled: boolean) => void
  setAnnouncement: (text: string) => void
  setContactText: (text: string) => void
  reset: () => void
}

export function createRecruitmentCreateStore() {
  return createStore<RecruitmentCreateState>((set) => ({
    seasonId: null,
    roundId: null,
    gisuGeneration: null,
    basicInfo: { ...DEFAULT_BASIC_INFO },
    enabledParts: { ...DEFAULT_ENABLED_PARTS },
    secondChoiceEnabled: true,
    announcement: "",
    contactText: "",

    setSeasonId: (id) =>
      set((s) => (s.seasonId === id ? {} : { seasonId: id, roundId: null })),
    setRoundId: (id) => set({ roundId: id }),
    setGisuGeneration: (generation) => set({ gisuGeneration: generation }),
    patchBasicInfo: (patch) =>
      set((s) => {
        // 값이 바뀌면 기존 roundId를 재사용하지 못하게 초기화한다.
        const invalidatesRound =
          ("recruitmentType" in patch &&
            patch.recruitmentType !== s.basicInfo.recruitmentType) ||
          ("roundNo" in patch && patch.roundNo !== s.basicInfo.roundNo)
        return {
          basicInfo: { ...s.basicInfo, ...patch },
          ...(invalidatesRound ? { roundId: null } : {}),
        }
      }),
    setEnabledParts: (parts) => set({ enabledParts: parts }),
    setSecondChoiceEnabled: (enabled) => set({ secondChoiceEnabled: enabled }),
    setAnnouncement: (text) => set({ announcement: text }),
    setContactText: (text) => set({ contactText: text }),
    reset: () =>
      set({
        seasonId: null,
        roundId: null,
        gisuGeneration: null,
        basicInfo: { ...DEFAULT_BASIC_INFO },
        enabledParts: { ...DEFAULT_ENABLED_PARTS },
        secondChoiceEnabled: true,
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
