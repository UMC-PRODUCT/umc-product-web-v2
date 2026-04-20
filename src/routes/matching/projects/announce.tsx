import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/matching/projects/announce")({
  component: ProjectSettingsAnnouncePage,
})

function ProjectSettingsAnnouncePage() {
  return (
    <section className="flex w-full flex-col pt-10">
      <p className="text-body-2-regular text-teal-gray-600">
        프로젝트 설정 · 공지 (준비 중)
      </p>
    </section>
  )
}
