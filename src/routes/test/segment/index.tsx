import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/segment/")({
  component: () => (
    <p className="text-body-1-regular text-teal-gray-400">
      위 탭을 눌러 스타일을 확인하세요.
    </p>
  ),
})
