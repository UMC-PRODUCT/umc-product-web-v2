import { useQuery } from "@tanstack/react-query"

import { getMyInfo } from "../api/me"
import { useAuthStore } from "../store/authStore"

export const authKeys = {
  me: ["auth", "me"] as const,
} as const

export function useMe() {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMyInfo,
    staleTime: 1000 * 60 * 5,
    enabled: isAuthed,
  })
}
