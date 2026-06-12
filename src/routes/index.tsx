import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  getViewerBranch,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { type Chapter, CHAPTERS } from "@/features/notice"

function isChapter(value: unknown): value is Chapter {
  return (
    typeof value === "string" && (CHAPTERS as readonly string[]).includes(value)
  )
}

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)

    // Admin(운영진): 팀 매칭 > 프로젝트 목록
    if (isOperator(me)) {
      throw redirect({ to: "/matching/projects" })
    }

    // Plan Challenger(PM): 프로젝트 설정 > 공지 (본인 지부)
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

    // Design/FE/BE Challenger: 팀 매칭 > 공지 (본인 지부)
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
