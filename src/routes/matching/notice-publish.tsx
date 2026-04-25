import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

export const Route = createFileRoute("/matching/notice-publish")({
  component: TeamMatchingNoticePublishPage,
})

function TeamMatchingNoticePublishPage() {
  const matchRoute = useMatchRoute()
  const isEditPage = Boolean(
    matchRoute({ to: "/matching/notice-publish/$noticeId" }),
  )

  if (isEditPage) {
    return <Outlet />
  }

  return <NoticePublishForm variant="publish" />
}
