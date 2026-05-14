import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

interface NoticePublishSearch {
  chapter?: string
}

export const Route = createFileRoute(
  "/matching/projects/announce/notice-publish",
)({
  validateSearch: (search: Record<string, unknown>): NoticePublishSearch => {
    return {
      chapter: typeof search.chapter === "string" ? search.chapter : undefined,
    }
  },
  component: ProjectSettingsNoticePublishPage,
})

function ProjectSettingsNoticePublishPage() {
  const { chapter } = Route.useSearch()
  const matchRoute = useMatchRoute()
  const isEditPage = Boolean(
    matchRoute({ to: "/matching/projects/announce/notice-publish/$noticeId" }),
  )

  if (isEditPage) {
    return <Outlet />
  }

  return (
    <NoticePublishForm
      variant="publish"
      noticeTab="SCHOOL_CORE"
      chapter={chapter}
    />
  )
}
