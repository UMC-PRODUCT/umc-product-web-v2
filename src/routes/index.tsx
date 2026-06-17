import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  getViewerBranch,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { useAuthStore } from "@/features/auth/store/authStore"
import { type Chapter, CHAPTERS } from "@/features/notice"

function isChapter(value: unknown): value is Chapter {
  return (
    typeof value === "string" && (CHAPTERS as readonly string[]).includes(value)
  )
}

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!useAuthStore.getState().isAuthed) {
      throw redirect({ to: "/intro" })
    }

    const me = await ensureMe(context.queryClient)

    if (isOperator(me)) {
      throw redirect({ to: "/matching/projects" })
    }

    if (isCurrentTermPm(me)) {
      const pmChapter = getViewerBranch(me)
      throw redirect({
        to: "/matching/projects/announce",
        search: {
          chapter: isChapter(pmChapter) ? pmChapter : CHAPTERS[0],
          page: 1,
        },
      })
    }

    const userChapter = getViewerBranch(me)
    if (isChapter(userChapter)) {
      throw redirect({
        to: "/matching",
        search: { chapter: userChapter, page: 1 },
      })
    }

    throw redirect({ to: "/challenger-verification" })
  },
})
