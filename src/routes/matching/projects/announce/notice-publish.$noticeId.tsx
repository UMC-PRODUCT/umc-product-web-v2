import { createFileRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

export const Route = createFileRoute(
  "/matching/projects/announce/notice-publish/$noticeId",
)({
  component: ProjectSettingsNoticePublishEditPage,
})

function ProjectSettingsNoticePublishEditPage() {
  const { noticeId } = Route.useParams()

  return (
    <NoticePublishForm
      variant="edit"
      noticeId={noticeId}
      noticeTab="CHALLENGER"
    />
  )
}
