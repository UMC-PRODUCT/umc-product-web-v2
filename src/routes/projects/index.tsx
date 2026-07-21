import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/projects/")({
  component: ApplyMethodPage,
})

function ApplyMethodPage() {
  return <div>{/* 지원 방법 */}</div>
}
