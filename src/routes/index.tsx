import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { getViewerBranch, isOperator } from "@/features/auth/model/identity"
import { type Chapter, CHAPTERS } from "@/features/notice"

function isChapter(value: unknown): value is Chapter {
  return (
    typeof value === "string" && (CHAPTERS as readonly string[]).includes(value)
  )
}

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)

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
