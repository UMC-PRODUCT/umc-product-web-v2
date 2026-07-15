import { createFileRoute, redirect } from "@tanstack/react-router"

import {
  getViewerBranch,
  isCurrentTermPm,
  isOperator,
} from "@/entities/member/model/identity"
import { useAuthStore } from "@/entities/member/store/authStore"
import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import { ensureMe } from "@/features/auth/lib/ensureMe"

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
