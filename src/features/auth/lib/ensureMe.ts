import { redirect } from "@tanstack/react-router"

import { getMyInfo, type MemberInfoResponse } from "@/features/auth/api/me"
import { authKeys } from "@/features/auth/hooks/useMe"
import { buildLoginRedirectSearch } from "@/features/auth/lib/loginRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"

import type { QueryClient } from "@tanstack/react-query"

export async function ensureMe(
  queryClient: QueryClient,
  returnTo?: string,
): Promise<MemberInfoResponse> {
  if (!useAuthStore.getState().isAuthed) {
    throw redirect({
      to: "/login",
      search: buildLoginRedirectSearch(returnTo),
    })
  }

  try {
    return await queryClient.ensureQueryData({
      queryKey: authKeys.me,
      queryFn: getMyInfo,
      staleTime: 1000 * 60 * 5,
    })
  } catch {
    throw redirect({
      to: "/login",
      search: buildLoginRedirectSearch(returnTo),
    })
  }
}
