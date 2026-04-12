import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/sidebar/")({
  component: () => (
    <p className="text-body-1-regular text-teal-gray-400">
      메뉴를 선택해주세요
    </p>
  ),
})
