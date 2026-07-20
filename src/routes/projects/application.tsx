import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/projects/application")({
  component: MyApplicationCodePage,
})

function MyApplicationCodePage() {
  return <div>{/* 내 지원서 */}</div>
}
