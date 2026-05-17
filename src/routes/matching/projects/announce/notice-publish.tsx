import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router"

import { NoticePublishForm } from "@/features/notice"

import type { PartEnum } from "@/features/notice/model/apiTypes"

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

// PM 챌린저
const TEMP_TARGET_PARTS: PartEnum[] = ["PLAN"]

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
      noticeTab="CHALLENGER"
      targetParts={TEMP_TARGET_PARTS}
      chapter={chapter}
    />
  )
}
