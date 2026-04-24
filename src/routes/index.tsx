import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/matching",
      search: { chapter: "Chromium", page: 1 }, // TODO: 사용자 지부로 리다이렉트
    })
  },
})
