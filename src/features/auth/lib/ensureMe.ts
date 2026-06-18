import { redirect } from "@tanstack/react-router"

import { meQueryOptions } from "@/features/auth/hooks/useMe"
import { buildLoginRedirectSearch } from "@/features/auth/lib/loginRedirect"
import { useAuthStore } from "@/features/auth/store/authStore"

import type { QueryClient } from "@tanstack/react-query"

import type { MemberInfoResponse } from "@/features/auth/api/me"

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
