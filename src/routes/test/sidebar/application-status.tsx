import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/sidebar/application-status")({
  component: () => <h1 className="text-heading-5">지원 현황</h1>,
})
