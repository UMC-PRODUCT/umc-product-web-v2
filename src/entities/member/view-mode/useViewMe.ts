import { useMe } from "@/entities/member/hooks/useMe"

import type { MemberInfoResponse } from "@/entities/member/api/me"

export function useViewMe(): {
  viewMe: MemberInfoResponse | undefined
  isLoading: boolean
} {
  const { data: me, isLoading } = useMe()
  return { viewMe: me, isLoading }
}
