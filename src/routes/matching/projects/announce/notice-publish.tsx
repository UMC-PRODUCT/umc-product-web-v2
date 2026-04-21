import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

export const Route = createFileRoute(
  "/matching/projects/announce/notice-publish",
)({
  component: ProjectSettingsNoticePublishPage,
})

function ProjectSettingsNoticePublishPage() {
  const matchRoute = useMatchRoute()
  const isEditPage = Boolean(
    matchRoute({ to: "/matching/projects/announce/notice-publish/$noticeId" }),
  )

  if (isEditPage) {
    return <Outlet />
  }

  return <NoticePublishForm variant="publish" />
}
