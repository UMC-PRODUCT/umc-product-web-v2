import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/sidebar/project-list")({
  component: () => <h1 className="text-heading-5">프로젝트 목록</h1>,
})
