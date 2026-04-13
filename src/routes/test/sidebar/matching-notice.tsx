import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/sidebar/matching-notice")({
  component: () => <h1 className="text-heading-5">공지</h1>,
})
