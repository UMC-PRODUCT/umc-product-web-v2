import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/sidebar/project-register")({
  component: () => <h1 className="text-heading-5">프로젝트 등록</h1>,
})
