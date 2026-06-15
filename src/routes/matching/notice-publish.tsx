import {
  createFileRoute,
  Outlet,
  redirect,
  useMatchRoute,
} from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isOperator } from "@/features/auth/model/identity"
import { NoticePublishForm } from "@/features/notice"
import { useViewModeStore } from "@/shared/view-mode"
import { projectViewMe } from "@/shared/view-mode/projectViewMe"

interface NoticePublishSearch {
  chapter?: string
}

export const Route = createFileRoute("/matching/notice-publish")({
  beforeLoad: async ({ context, location }) => {
    const me = await ensureMe(context.queryClient, location.href)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)
    if (!isOperator(viewMe)) throw redirect({ to: "/" })
  },
  validateSearch: (search: Record<string, unknown>): NoticePublishSearch => {
    return {
      chapter: typeof search.chapter === "string" ? search.chapter : undefined,
    }
  },
  component: TeamMatchingNoticePublishPage,
})

function TeamMatchingNoticePublishPage() {
  const { chapter } = Route.useSearch()
  const matchRoute = useMatchRoute()
  const isEditPage = Boolean(
    matchRoute({ to: "/matching/notice-publish/$noticeId" }),
  )

  if (isEditPage) {
    return <Outlet />
  }

  return (
    <NoticePublishForm
      variant="publish"
      noticeTab="CHALLENGER"
      chapter={chapter}
    />
  )
}
