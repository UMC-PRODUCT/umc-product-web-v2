import { redirect } from "@tanstack/react-router"

import { getMyInfo, type MemberInfoResponse } from "@/features/auth/api/me"

import type { QueryClient } from "@tanstack/react-query"

export async function ensureMe(
  queryClient: QueryClient,
): Promise<MemberInfoResponse> {
  if (typeof window === "undefined" || !localStorage.getItem("access_token")) {
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
