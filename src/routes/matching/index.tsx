import { createFileRoute } from "@tanstack/react-router"

/** 팀 매칭 · 공지 — 레이아웃 하위 인덱스 (/matching) */
export const Route = createFileRoute("/matching/")({
  component: TeamMatchingAnnouncePage,
})

function TeamMatchingAnnouncePage() {
  return (
    <section className="flex w-full flex-col pt-10">
      <p className="text-body-2-regular text-teal-gray-600">
        팀 매칭 · 공지 (준비 중)
      </p>
    </section>
  )
}
