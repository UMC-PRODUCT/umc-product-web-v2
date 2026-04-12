import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/sidebar/matching-round")({
  component: () => <h1 className="text-heading-5">매칭 차수 설정</h1>,
})
