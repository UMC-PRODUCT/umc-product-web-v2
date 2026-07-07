import { redirect } from "@tanstack/react-router"

import { meQueryOptions } from "@/entities/member/hooks/useMe"
import { useAuthStore } from "@/entities/member/store/authStore"
import { buildLoginRedirectSearch } from "@/features/auth/lib/loginRedirect"

import type { QueryClient } from "@tanstack/react-query"

import type { MemberInfoResponse } from "@/entities/member/api/me"

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
    return await queryClient.ensureQueryData(meQueryOptions)
  } catch {
    throw redirect({
      to: "/login",
      search: buildLoginRedirectSearch(returnTo),
    })
  }
}
