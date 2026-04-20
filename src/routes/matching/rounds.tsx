import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/matching/rounds")({
  component: MatchingRoundsPage,
})

function MatchingRoundsPage() {
  return (
    <section className="flex w-full flex-col pt-10">
      <p className="text-body-2-regular text-teal-gray-600">
        매칭 차수 설정 (준비 중)
      </p>
    </section>
  )
}
