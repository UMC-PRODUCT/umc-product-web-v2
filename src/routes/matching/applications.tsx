import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/matching/applications")({
  component: MatchingApplicationsPage,
})

function MatchingApplicationsPage() {
  return (
    <section className="flex w-full flex-col pt-10">
      <p className="text-body-2-regular text-teal-gray-600">
        지원 현황 (준비 중)
      </p>
    </section>
  )
}
