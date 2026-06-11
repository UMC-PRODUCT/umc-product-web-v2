import { useQuery } from "@tanstack/react-query"

import { getMemberOAuthList } from "../api/memberOauth"
import { useAuthStore } from "../store/authStore"

export const MEMBER_OAUTH_QUERY_KEY = ["auth", "member-oauth"] as const

export function useMemberOAuthList() {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  return useQuery({
    queryKey: MEMBER_OAUTH_QUERY_KEY,
    queryFn: getMemberOAuthList,
    staleTime: 1000 * 60 * 5,
    enabled: isAuthed,
  })
}
