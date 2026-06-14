import { useMe } from "@/features/auth/hooks/useMe"

import { useViewModeStore } from "."
import { projectViewMe } from "./projectViewMe"

import type { MemberInfoResponse } from "@/features/auth/api/me"

export function useViewMe(): {
  viewMe: MemberInfoResponse | undefined
  isLoading: boolean
} {
  const { data: me, isLoading } = useMe()
  const mode = useViewModeStore((s) => s.mode)
  return { viewMe: projectViewMe(me, mode), isLoading }
}
