import { createFileRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

export const Route = createFileRoute("/matching/notice-publish/$noticeId")({
  component: TeamMatchingNoticePublishEditPage,
})

function TeamMatchingNoticePublishEditPage() {
  const { noticeId } = Route.useParams()

  return <NoticePublishForm variant="edit" noticeId={noticeId} />
}
