import { create } from "zustand"

import type { MemberInfoResponse } from "@/features/auth/api/me"
import type { components } from "@/types/api"

type ActiveGisuResponse = components["schemas"]["ActiveGisuResponse"]

interface CacheState {
  me: MemberInfoResponse | null
  activeGisu: ActiveGisuResponse | null
  setMe: (me: MemberInfoResponse | null) => void
  setActiveGisu: (activeGisu: ActiveGisuResponse | null) => void
  clear: () => void
}

export const useCacheStore = create<CacheState>((set) => ({
  me: null,
  activeGisu: null,
  setMe: (me) => set({ me }),
  setActiveGisu: (activeGisu) => set({ activeGisu }),
  clear: () => set({ me: null, activeGisu: null }),
}))
