import { createFileRoute, redirect } from "@tanstack/react-router"

import { getMyInfo } from "@/features/auth/api/me"
import { getViewerBranch, isOperator } from "@/features/auth/model/identity"
import { type Chapter, CHAPTERS } from "@/features/notice"

function isChapter(value: unknown): value is Chapter {
  return (
    typeof value === "string" && (CHAPTERS as readonly string[]).includes(value)
  )
}

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (
      typeof window === "undefined" ||
      !localStorage.getItem("access_token")
    ) {
      throw redirect({ to: "/login" })
    }

    let me: Awaited<ReturnType<typeof getMyInfo>>
    try {
      me = await context.queryClient.ensureQueryData({
        queryKey: ["auth", "me"],
        queryFn: getMyInfo,
        staleTime: 1000 * 60 * 5,
      })
    } catch {
      throw redirect({ to: "/login" })
    }

    if (isOperator(me)) {
      throw redirect({ to: "/matching/projects" })
    }

    const userChapter = getViewerBranch(me)
    if (isChapter(userChapter)) {
      throw redirect({
        to: "/matching",
        search: { chapter: userChapter, page: 1 },
      })
    }

    throw redirect({ to: "/login" })
  },
})
