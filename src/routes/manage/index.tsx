import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/manage/")({
  beforeLoad: () => {
    throw redirect({ to: "/manage/school" })
  },
})
