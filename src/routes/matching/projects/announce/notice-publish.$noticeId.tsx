import { createFileRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

import type { PartEnum } from "@/features/notice/model/apiTypes"

export const Route = createFileRoute(
  "/matching/projects/announce/notice-publish/$noticeId",
)({
  component: ProjectSettingsNoticePublishEditPage,
})

// PM 챌린저
const TEMP_TARGET_PARTS: PartEnum[] = ["PLAN"]

function ProjectSettingsNoticePublishEditPage() {
  const { noticeId } = Route.useParams()

  return (
    <NoticePublishForm
      variant="edit"
      noticeId={noticeId}
      noticeTab="CHALLENGER"
      targetParts={TEMP_TARGET_PARTS}
    />
  )
}
