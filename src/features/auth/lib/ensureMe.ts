import { redirect } from "@tanstack/react-router"

import { getMyInfo, type MemberInfoResponse } from "@/features/auth/api/me"
import { useAuthStore } from "@/features/auth/store/authStore"

import type { QueryClient } from "@tanstack/react-query"

export async function ensureMe(
  queryClient: QueryClient,
): Promise<MemberInfoResponse> {
  if (!useAuthStore.getState().isAuthed) {
    throw redirect({ to: "/login" })
  }

  try {
    return await queryClient.ensureQueryData({
      queryKey: ["auth", "me"],
      queryFn: getMyInfo,
      staleTime: 1000 * 60 * 5,
    })
  } catch {
    throw redirect({ to: "/login" })
  }
}
