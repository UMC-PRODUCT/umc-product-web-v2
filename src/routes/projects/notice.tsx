import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/projects/notice")({
  component: RecruitmentNoticePage,
})

function RecruitmentNoticePage() {
  return <div>{/* 모집 공고 */}</div>
}
