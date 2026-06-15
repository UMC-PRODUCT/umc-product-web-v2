import { useMe } from "@/features/auth/hooks/useMe"

import type { MemberInfoResponse } from "@/features/auth/api/me"

export function useViewMe(): {
  viewMe: MemberInfoResponse | undefined
  isLoading: boolean
} {
  const { data: me, isLoading } = useMe()
  return { viewMe: me, isLoading }
}
