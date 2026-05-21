import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isOperator } from "@/features/auth/model/identity"
import { NoticePublishForm } from "@/features/notice"

import type { PartEnum } from "@/features/notice/model/apiTypes"

export const Route = createFileRoute(
  "/matching/projects/announce/notice-publish/$noticeId",
)({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!isOperator(me)) throw redirect({ to: "/" })
  },
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
