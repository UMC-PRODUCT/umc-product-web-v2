import { createFileRoute, redirect } from "@tanstack/react-router"

import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isOperator } from "@/features/auth/model/identity"
import { NoticePublishForm } from "@/features/notice"

export const Route = createFileRoute("/matching/notice-publish/$noticeId")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!isOperator(me)) throw redirect({ to: "/" })
  },
  component: TeamMatchingNoticePublishEditPage,
})

function TeamMatchingNoticePublishEditPage() {
  const { noticeId } = Route.useParams()

  return (
    <NoticePublishForm
      variant="edit"
      noticeId={noticeId}
      noticeTab="CHALLENGER"
    />
  )
}
